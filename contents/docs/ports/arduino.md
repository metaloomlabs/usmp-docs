# Arduino Library Reference

Welcome, Arduino developers! The Arduino port of USMP wraps the core C protocol in an ergonomic, developer-friendly C++ class: `USMPClient`. This guide walks you through the library structure, API signatures, and transport configurations.

---

## Installation

You can install the USMP Arduino library either through the official Arduino Library Manager (recommended) or as an offline ZIP package:

### Method 1: Arduino Library Manager (Recommended)

1. In Arduino IDE (1.8.x or 2.x), open **Tools** ➔ **Manage Libraries...** (or click the Library Manager icon on the left sidebar).
2. Search for `USMP`.
3. Click **Install** on the `USMP` library by MetaLoom Labs (version `1.3.0`).

Or install via the Arduino CLI:

```bash
arduino-cli lib install "USMP"
```

### Method 2: Offline ZIP Import

1. Download `usmp-1.3.0-arduino.zip` from the [Downloads Portal](/downloads).
2. Open **Arduino IDE**.
3. Go to **Sketch** ➔ **Include Library** ➔ **Add .ZIP Library...**
4. Choose `usmp-1.3.0-arduino.zip` to complete the import.

To include it in your sketch:

```cpp
#include <USMP.h>
```

---

## API Reference

### Constructors

USMP supports string passphrases, explicit binary key buffers (for high-entropy keys with null bytes), and caller-provided RX memory:

```cpp
// 1. Standard string PSK constructor (dynamic internal RX buffer)
explicit USMPClient(const char* psk);

// 2. String PSK with external/static RX buffer (zero dynamic RX allocation)
USMPClient(const char* psk, uint8_t* rx_buffer, size_t rx_buffer_size);

// 3. Binary PSK constructor (prevents strlen truncation on 0x00 bytes)
USMPClient(const uint8_t* psk, size_t psk_len);

// 4. Binary PSK with external/static RX buffer
USMPClient(const uint8_t* psk, size_t psk_len, uint8_t* rx_buffer, size_t rx_buffer_size);
```

* **Binary PSK Support**: When provisioning cryptographically random 256-bit keys (e.g. `os.urandom(32)`), the binary constructors ensure random `0x00` bytes do not prematurely truncate the key.

---

### Zero-Heap Architecture: `USMPClientStatic`

For safety-critical or zero-fragmentation embedded targets, USMP v1.3.0 provides the `USMPClientStatic` template wrapper. It embeds both the receive buffer and cryptographic handshake scratchpad directly inside `.bss` memory:

```cpp
template <size_t RxBufferSize = USMP_MAX_DATA_LEN * USMP_MAX_FRAMES,
          size_t ScratchBufferSize = USMP_HANDSHAKE_SCRATCH_LEN>
class USMPClientStatic : public USMPClient;
```

**Usage Example:**

```cpp
#include <USMP.h>

// Embeds all buffers in object memory (0 bytes heap allocated)
static const uint8_t PSK[32] = { /* 32 cryptographically random bytes */ };
USMPClientStatic<1808, 2048> usmp(PSK, sizeof(PSK));
```

---

### Connection Management

#### `begin` (Synchronous)

```cpp
bool begin(USMPTCPTransport transport, USMPArduinoTcpCtx* static_ctx = nullptr);
bool begin(USMPUDPTransport transport, USMPArduinoUdpCtx* static_ctx = nullptr);
```

Establishes the connection and executes the handshake synchronously.

* Passing `static_ctx` binds a caller-managed static transport context, avoiding heap `new`/`malloc`.

#### `beginAsync` (Non-Blocking Handshake)

```cpp
bool beginAsync(USMPTCPTransport transport, USMPArduinoTcpCtx* static_ctx = nullptr);
bool beginAsync(USMPUDPTransport transport, USMPArduinoUdpCtx* static_ctx = nullptr);
```

Initiates an asynchronous, non-blocking connection. The handshake progresses incrementally inside subsequent `maintain()` calls, eliminating 2–5 second CPU stalls or FreeRTOS watchdog timeouts during setup.

#### State & Status Queries

```cpp
usmp_state_t state() const;
bool isConnecting() const;
usmp_err_t lastError() const;
const char* lastErrorString() const;
```

* **`state()`**: Returns current FSM state (`USMP_STATE_IDLE`, `USMP_STATE_CONNECTING_SOCKET`, `USMP_STATE_AWAITING_CHALLENGE`, `USMP_STATE_CALCULATING_ECDH`, `USMP_STATE_AWAITING_SESSION_OK`, `USMP_STATE_ESTABLISHED`, `USMP_STATE_ERROR`).
* **`isConnecting()`**: Returns `true` while the handshake state machine is actively progressing.
* **`lastError()`**: Returns the latest `usmp_err_t` typed error code.
* **`lastErrorString()`**: Returns a descriptive, human-readable error description (e.g. `"Authentication failed"`, `"Peer closed connection"`).

#### `maintain`

```cpp
void maintain();
```

Performs background driver tasks and watchdog servicing. **You must call this inside your main `loop()` function.**

* Advances asynchronous handshake state progression without blocking.
* Services hardware watchdogs via `usmp_port_wdt_feed()` (`yield()` / `ESP.wdtFeed()`).
* Drains control frames (`PING`, `PONG`, `REKEY`) automatically in the background.
* Triggers registered event callbacks and executes automatic reconnects on socket drop.

#### `keepalive`

```cpp
void keepalive(uint32_t ms);
```

Sets the interval (in milliseconds) for keepalive heartbeat checks (default: `30000` / 30 seconds).

> [!CAUTION]
> **Order of Configuration**
> You must call `keepalive()` **after** calling `begin()` or `beginAsync()`.

#### `alive`

```cpp
bool alive();
```

Checks if your secure session is currently connected and active (`USMP_STATE_ESTABLISHED`).

#### `deviceId` & `sessionId`

```cpp
String deviceId();
String sessionId();
```

* **`deviceId()`**: Returns the station MAC device identifier formatted as a hex string.
* **`sessionId()`**: Returns the active 128-bit session identifier as a hex string (or empty string if disconnected).

#### `setLogLevel`

```cpp
void setLogLevel(usmp_log_level_t level);
```

Configures internal protocol logging thresholds (`USMP_LOG_NONE`, `USMP_LOG_ERROR`, `USMP_LOG_WARN`, `USMP_LOG_INFO`, `USMP_LOG_DEBUG`).

#### `setHandshakeScratch`

```cpp
void setHandshakeScratch(uint8_t* scratch, size_t len);
```

Injects an external scratchpad buffer (minimum size: `USMP_HANDSHAKE_SCRATCH_LEN` / 2048 bytes) for zero-heap handshake calculations.

#### `reconnect`

```cpp
bool reconnect();
```

Manually initiates a socket reconnection and executes a fresh cryptographic handshake.

#### `close`

```cpp
void close();
```

Gracefully closes the session (sends a `BYE` frame) and shuts down the connection.

---

### Standard Arduino `Print` Stream Interface

In USMP v1.3.0, `USMPClient` inherits directly from Arduino's standard `Print` base class. You can print numbers, formatted strings, and floats directly into encrypted USMP packets:

```cpp
// Stream printing
usmp.print("Sensor reading: ");
usmp.print(42.5);
usmp.println(" status=OK");
```

* **Zero-Heap Line Buffering**: Stream writes (`write()`, `print()`) are buffered in an internal zero-heap 452-byte TX buffer until a newline character (`\n`) is encountered or `usmp.flush()` is explicitly called.
* **`usmp.availableForWrite()`**: Returns remaining bytes in the line buffer.

---

### Sending and Receiving Data

#### `send`

```cpp
bool send(const char *str);
bool send(const String &str);
bool send(const uint8_t *data, size_t len);
```

Encrypts and transmits a payload to the gateway.

* Supports automatic fragmentation for payloads up to ~1.8 KB.

---

### Polling API (Simple Style)

If you prefer a simple sequential flow, you can query the client inside your `loop()`:

```cpp
if (usmp.available()) {
    String msg = usmp.read();
    if (msg.length() > 0) {
        Serial.println("Received: " + msg);
    }
}
```

* **`available()`**: Drains background control frames (`PING`, `PONG`, `REKEY`) automatically and returns `true` if a decrypted application packet is ready in the buffer.
* **`read()`**: Reads the next decrypted packet as a `String`. Guard printing with `if (msg.length() > 0)` to avoid empty line prints.
* **`read(buf, max_len)`**: Copies raw decrypted bytes into a buffer and returns the length.

---

### Callback API (Asynchronous Style)

For event-driven sketches, register callbacks in your `setup()`:

```cpp
void onConnect(void (*cb)());
void onDisconnect(void (*cb)());
void onReconnect(void (*cb)());
void onMessage(void (*cb)(const uint8_t *data, size_t len));
```

* **`onConnect`**: Triggered on **every** session establishment — the initial `begin()` **and** every successful reconnect. Use it for work that must run whenever a live session exists (e.g. re-announcing device state to the gateway).
* **`onDisconnect`**: Triggered when a live session is lost (send/receive/keepalive failure, or the gateway sends `BYE`).
* **`onReconnect`**: Triggered **additionally** (just before `onConnect`) when a reconnection handshake completes. Use it for reconnect-specific work.
* **`onMessage`**: Triggered when a new decrypted message arrives.

> [!NOTE]
> A reconnect fires **both** `onReconnect` and `onConnect` (in that order). If you call `send()` in both handlers, a reconnect sends from both — this is intentional, not a bug.

> [!IMPORTANT]
> **Do Not Mix Callbacks and Polling**
> If you register an `onMessage` callback, **do not** call `usmp.available()` or `usmp.read()`. Doing so will interfere with data flow and cause dropped frames.

---

## Transport Configuration Builder

Create your transport adapter configuration using the `USMP::` namespace:

### TCP Transport

```cpp
USMP::TCP(const char *gateway_ip, uint16_t port = 9000);
```

* Configures a TCP socket connection.
* To let USMP manage your Wi-Fi, chain `.wifi("SSID", "Password")`.

### UDP Transport

```cpp
USMP::UDP(const char *gateway_ip, uint16_t port = 9000);
```

* Configures a connectionless UDP socket connection.
* To let USMP manage your Wi-Fi, chain `.wifi("SSID", "Password")`.

---

## Advanced: Bounded Timeouts & Watchdog Protection

To protect against hardware watchdog resets and FreeRTOS task starvation during link outages, USMP v1.3.0 enforces bounded timeouts across all connection phases (overridable via `-D` flags in `platformio.ini` `build_flags`):

* **`USMP_HANDSHAKE_RECV_TIMEOUT_MS`** (default `5000`) — Maximum wait for gateway handshake replies. Replaced unbounded wait loops to prevent CPU stalls, while regularly servicing the hardware watchdog via `usmp_port_wdt_feed()`.
* **`USMP_UDP_RECV_TIMEOUT_MS`** (default `50`) — Per-attempt UDP receive wait. The core retries up to ~10× per read (~500 ms effective budget).
* **`USMP_TCP_RECV_TIMEOUT_MS`** (default `2000`) — TCP stall timeout; trips only when zero progress occurs mid-frame.
