# Tutorial 3: Production Hardening

When moving from a local breadboard prototype to a production environment, you must build robust error handling, secure key storage, static memory guarantees, and automatic recovery systems. This guide details how to harden both your devices and gateways for USMP v1.3.0.

---

## 1. Zero-Heap Static Allocation (Eliminate Heap Fragmentation)

In long-running embedded IoT deployments, dynamic heap allocations (`malloc`, `free`, `new`) can lead to memory fragmentation and eventual out-of-memory crashes. USMP v1.3.0 introduces static, zero-heap initialization patterns for both C/ESP-IDF and Arduino.

### ESP-IDF: Static Transport Initializers

Avoid heap allocation for the underlying socket transport by using static transport initialization and caller-provided scratchpads:

```c
#include "usmp.h"
#include "usmp_transport_tcp.h"

static usmp_t ctx;
static usmp_transport_tcp_ctx_t tcp_transport_ctx;
static uint8_t psk_bytes[32]; // Provisioned binary PSK
static uint8_t rx_ring_buf[512];

void init_zero_heap_client(void) {
    // 1. Initialize static TCP transport (no malloc)
    usmp_transport_tcp_init_static(&ctx.transport, &tcp_transport_ctx, "192.168.1.100", 8443);
    
    // 2. Configure session context
    ctx.psk = psk_bytes;
    ctx.psk_len = sizeof(psk_bytes);
    ctx.keepalive_ms = 15000;
}
```

### Arduino: Zero-Heap `USMPClientStatic`

For Arduino environments, use the `USMPClientStatic<TxSize, RxSize>` template to allocate all internal packet buffers on the stack or BSS segment:

```cpp
#include <USMP.h>

// Allocate 256-byte static TX and RX buffers without heap allocation
USMPClientStatic<256, 256> usmp("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");

void setup() {
    Serial.begin(115200);
    // Non-blocking async connect
    usmp.beginAsync(USMP::TCP("192.168.1.100", 8443));
}

void loop() {
    usmp.maintain(); // Advances non-blocking handshake FSM
    if (usmp.connected()) {
        usmp.println("status: ok");
    }
    delay(10);
}
```

---

## 2. Secure Credential Management (No Hardcoded PSKs)

Hardcoding Pre-Shared Keys directly in your firmware binary makes them vulnerable to reverse engineering and extraction.

### ESP32: Loading Binary PSK from Non-Volatile Storage (NVS)

On the ESP32, store the 32-byte binary PSK in a secure, encrypted NVS partition:

```c
#include "nvs_flash.h"
#include "nvs.h"
#include "esp_log.h"
#include "usmp.h"

static const char *TAG = "SECURITY";

bool load_psk_from_nvs(uint8_t *psk_buf, size_t *psk_len) {
    nvs_handle_t my_handle;
    esp_err_t err;

    // 1. Open the "storage" namespace in NVS
    err = nvs_open("storage", NVS_READONLY, &my_handle);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Error opening NVS handle: %s", esp_err_to_name(err));
        return false;
    }

    // 2. Fetch the binary key length
    err = nvs_get_blob(my_handle, "usmp_psk", NULL, psk_len);
    if (err != ESP_OK || *psk_len != 32) {
        ESP_LOGE(TAG, "Invalid PSK length in NVS (expected 32 bytes)");
        nvs_close(my_handle);
        return false;
    }

    // 3. Read the actual PSK blob
    err = nvs_get_blob(my_handle, "usmp_psk", psk_buf, psk_len);
    nvs_close(my_handle);

    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Error reading PSK payload: %s", esp_err_to_name(err));
        return false;
    }

    return true;
}
```

---

## 3. Split RTOS Concurrency (Full-Duplex Multi-Threading)

In USMP v1.3.0, the core context contains split mutexes (`tx_mutex` and `rx_mutex`). This allows dedicated RTOS sender and receiver tasks to operate concurrently without socket race conditions or AES-GCM nonce re-use.

```c
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_task_wdt.h"
#include "usmp.h"

static usmp_t ctx;

// High-frequency telemetry sender task
void telemetry_task(void *pvParameters) {
    char payload[64];
    int count = 0;
    while (1) {
        if (usmp_is_connected(&ctx)) {
            snprintf(payload, sizeof(payload), "{\"count\":%d}", count++);
            // tx_mutex locks sequence allocation & encryption only
            int ret = usmp_send(&ctx, (const uint8_t *)payload, strlen(payload));
            if (ret < 0) {
                ESP_LOGE("TX", "Send error: %s", usmp_strerror(ret));
            }
        }
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

// Background command receiver task
void command_task(void *pvParameters) {
    uint8_t rx_buf[256];
    while (1) {
        if (usmp_is_connected(&ctx)) {
            // rx_mutex locks socket read & frame authentication independently
            int n = usmp_recv(&ctx, rx_buf, sizeof(rx_buf) - 1);
            if (n > 0) {
                rx_buf[n] = '\0';
                ESP_LOGI("RX", "Received command: %s", rx_buf);
            }
        }
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}
```

---

## 4. Non-Blocking Handshake State Machine & Watchdog Safety

Synchronous blocking handshakes can trigger hardware Watchdog Timers (WDT) if network latency spikes. USMP v1.3.0 provides non-blocking async handshakes via `usmp_connect_async()` and `usmp_step()`:

```c
void connection_task(void *pvParameters) {
    esp_task_wdt_add(NULL);

    while (1) {
        esp_task_wdt_reset();

        if (!usmp_is_connected(&ctx)) {
            ESP_LOGI("CONN", "Starting non-blocking async connect...");
            usmp_connect_async(&ctx);

            while (ctx.state != USMP_STATE_ESTABLISHED && ctx.state != USMP_STATE_ERROR) {
                esp_task_wdt_reset();
                usmp_step(&ctx); // Drives one non-blocking tick of handshake FSM
                vTaskDelay(pdMS_TO_TICKS(50));
            }

            if (ctx.state == USMP_STATE_ESTABLISHED) {
                ESP_LOGI("CONN", "Connected securely!");
            } else {
                ESP_LOGE("CONN", "Handshake failed: %s", usmp_strerror(ctx.last_error));
                vTaskDelay(pdMS_TO_TICKS(3000)); // Backoff before retry
            }
        }

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
```

---

## 5. Keepalive Monitoring & Connection Watchdogs

A network connection can drop silently without closing the underlying socket (the "half-open" state). To detect this, USMP provides keepalive heartbeats (`PING` / `PONG`).

* **ESP-IDF**: You configure the keepalive interval directly on the context:

    ```c
    ctx.keepalive_ms = 15000; // Send a PING frame if no data is sent for 15 seconds
    ```

* **Arduino**: Set the interval using the helper method **after** `begin()` or `beginAsync()`:

    ```cpp
    usmp.keepalive(15000); // 15 seconds
    ```

---

## 6. Gateway Hardening (Python SDK)

The Python gateway server contains built-in protections against denial-of-service (DoS), resource exhaustion, and abrupt terminations:

* **Graceful Shutdown & Signal Traps**: Intercepts `SIGINT` / `SIGTERM` and drains active connections without abruptly aborting in-flight cryptographic frames:

    ```python
    import asyncio
    import signal
    from usmp import USMPServer

    server = USMPServer(host="0.0.0.0", port=8443, psk=b"0123456789abcdef0123456789abcdef")

    def handle_signal():
        asyncio.create_task(server.stop())

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, handle_signal)
    ```

* **Failed Handshake Lockout**: If a device IP fails the handshake process (due to an incorrect PSK or protocol violation) multiple times in a row, the server locks out that IP address for **60 seconds**, dropping any incoming packets immediately.
* **Concurrent Handshake Limits**: To prevent resource exhaustion, the server limits any single IP address to **3 concurrent handshakes** in progress.
* **Watchdog Task**: The server runs an asynchronous watchdog task on every session. If a connected device stops sending data or keepalive pings for the duration of the `session_timeout` (default: 60 seconds), the server closes the session socket and frees its resources.
* **Socket Re-use**: `reuse_address=True` allows rapid service restarts without waiting for TCP `TIME_WAIT` timeouts.
