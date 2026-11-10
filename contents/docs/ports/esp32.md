# ESP-IDF Component Reference (ESP32)

Welcome, firmware engineers! The ESP32 port of USMP implements the core protocol's hardware-dependent platform hooks and provides high-performance, secure TCP and UDP transport adapters optimized for the native Espressif IoT Development Framework (ESP-IDF v5.0+).

---

## Component Installation

Since the USMP repository is private, you should add USMP directly via the Espressif Component Registry:

```bash
idf.py add-dependency "metaloomlabs/usmp"
```

This registers USMP as a project dependency. The ESP-IDF build system automatically downloads, configures, and links the component.

---

## Component Architecture

Once installed, the component exposes the following file structure:

* `port/`
  * `usmp_port_esp32.c` — Connects USMP's hardware hooks to Espressif's APIs (RNG, timers, logging, and Wi-Fi MAC reading).
* `transport/`
  * `usmp_transport_tcp.c` — Implements secure, non-blocking streams over lwIP TCP sockets.
  * `usmp_transport_udp.c` — Implements secure, low-overhead communication over lwIP UDP sockets with USMP reliability mechanisms.

---

## Platform Hook Mappings

USMP is designed to be completely platform-agnostic. The core state machine requests system services through hooks defined in `usmp_port.h`. On the ESP32, these map directly to Espressif's hardware abstractions:

| Hook Function | Under the Hood (ESP-IDF API) | Role |
| :--- | :--- | :--- |
| `usmp_port_get_device_id` | `esp_read_mac(out, ESP_MAC_WIFI_STA)` | Reads the factory-configured station Wi-Fi MAC address as the unique device ID. |
| `usmp_port_random` | `esp_fill_random(out, len)` | Employs the ESP32's hardware True Random Number Generator (TRNG) for cryptographic salts. |
| `usmp_port_delay_ms` | `vTaskDelay(pdMS_TO_TICKS(ms))` | Yields execution to FreeRTOS to prevent task starvation. |
| `usmp_port_millis` | `esp_timer_get_time() / 1000` | Retrieves system uptime millisecond counters. |
| `usmp_port_log` | `ESP_LOGI` / `ESP_LOGW` / `ESP_LOGE` | Routes internal protocol logs directly to the ESP-IDF terminal logging engine. |
| `usmp_port_mutex_*` | `xSemaphoreCreateMutex()`, etc. | FreeRTOS priority-inheriting mutexes for split `tx_mutex` & `rx_mutex` concurrency. |
| `usmp_port_wdt_feed` | `esp_task_wdt_reset()` | Services the FreeRTOS Task Watchdog Timer (TWDT) during handshake and ARQ loops. |

---

## Transport Adaptors

### 1. TCP Transport

The TCP transport uses native BSD sockets provided by lwIP with `TCP_NODELAY` enabled. Both numeric IPv4 addresses and DNS hostnames are supported.

```c
usmp_transport_t transport;

// Dynamic allocation (allocates internal context on heap via malloc)
usmp_transport_tcp_init(&transport, "usmp.mycompany.com", 9000);

// OR: Zero-heap static initialization (uses static/BSS memory)
static usmp_tcp_ctx_t s_tcp_ctx;
usmp_transport_tcp_init_static(&transport, &s_tcp_ctx, "usmp.mycompany.com", 9000);
```

### 2. UDP Transport

The UDP transport is connectionless and lightweight with CoAP RTT estimation (RFC 7252 / Jacobson-Karn) and automatic watchdog feeding.

```c
usmp_transport_t transport;

// Dynamic allocation (allocates internal context on heap via malloc)
usmp_transport_udp_init(&transport, "usmp.mycompany.com", 9000);

// OR: Zero-heap static initialization (uses static/BSS memory)
static usmp_udp_ctx_t s_udp_ctx;
usmp_transport_udp_init_static(&transport, &s_udp_ctx, "usmp.mycompany.com", 9000);
```

---

## Zero-Heap Memory & Non-Blocking Concurrency

USMP v1.3.0 is optimized for mission-critical embedded systems with strict memory guarantees:

### Zero-Heap Handshake Scratchpad

Provide caller-managed memory to eliminate 100% of dynamic heap allocations during the handshake:

```c
static uint8_t s_scratch[USMP_HANDSHAKE_SCRATCH_LEN]; // 2048 bytes
ctx.scratch = s_scratch;
ctx.scratch_len = sizeof(s_scratch);
```

Contents are securely zeroized via `mbedtls_platform_zeroize()` upon handshake completion. You can enforce compile-time zero-heap verification by defining `-DUSMP_ZERO_HEAP`.

### Split RTOS Mutex Concurrency

`usmp_t` embeds independent `tx_mutex` and `rx_mutex` FreeRTOS handles:
* Concurrent sender tasks calling `usmp_send()` are safely serialized, preventing AES-GCM nonce reuse.
* A blocking `usmp_recv()` task never deadlocks with background telemetry tasks.
* In-band rekeying (`usmp_rekey`) acquires `tx_mutex` then `rx_mutex` in strict hierarchical order.

### Non-Blocking Handshake State Machine

Instead of blocking the calling task for 2–5 seconds during connection bring-up, drive the non-blocking state machine incrementally:

```c
usmp_connect_async(&ctx, &transport);

while (true) {
    vTaskDelay(pdMS_TO_TICKS(50));
    
    // Ticks FSM, processes frames, and feeds watchdog via esp_task_wdt_reset()
    usmp_err_t err = usmp_step(&ctx);
    if (err < 0) {
        ESP_LOGE("APP", "Connection error: %s (%d)", usmp_strerror(err), err);
        usmp_reconnect_async(&ctx);
    }
}
```

---

## Memory Footprint & Stack Allocation

| Context / Phase | RAM Consumption | Lifetime |
| :--- | :--- | :--- |
| **`usmp_t` Session Context** | ~240 bytes (ESP32 32-bit) | Persistent (lives for session duration). |
| **Transmit & Receive Buffers** | ~1 KB | Stack memory (allocated only during send/recv calls). |
| **Handshake Memory** | 0 bytes heap (with scratchpad) | Reuses static 2048-byte scratchpad; securely zeroized after completion. |
| **mbedTLS Handshake Tasks** | ~2 KB – 4 KB | Transient stack memory during key exchange. |

> [!CAUTION]
> **Runtime PSK Provisioning Required (No Compile-time `USMP_PSK`)**
> Defining `USMP_PSK` as a compile-time macro is no longer supported and will produce a build `#error` in `usmp.h`.
> You must assign `ctx.psk` and `ctx.psk_len` at runtime (loaded from secure storage or NVS) before invoking `usmp_connect()`.

> [!IMPORTANT]
> **Task Stack Configurations**
> Because the cryptographic handshake performs Curve25519 calculations and HMAC signing, it allocates transient variables on the stack.
> To prevent stack overflows, ensure the task calling `usmp_connect()` has **at least 8 KB (8192 bytes)** of stack space allocated.
>
> If calling from the main task, increase the stack size in `sdkconfig`:
>
> ```ini
> CONFIG_ESP_MAIN_TASK_STACK_SIZE=8192
> ```
>
> If creating a custom FreeRTOS task:
>
> ```c
> xTaskCreate(usmp_task, "usmp_task", 8192, NULL, 5, NULL);
> ```

---

## Hardware Support

This component supports any Espressif silicon variant running ESP-IDF v5+:

* **ESP32** (Classic)
* **ESP32-S2** / **ESP32-S3**
* **ESP32-C3** / **ESP32-C6** / **ESP32-H2**
