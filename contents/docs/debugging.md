# USMP Debugging Guide

This guide provides developers with instructions and tips for debugging USMP integrations, analyzing packet flows, translating error codes, and tuning log levels in USMP v1.3.0.

## 1. Enabling Debug Logging

### 1.1 Python SDK

The Python SDK provides a built-in logger helper `usmp.setup_logging()` with ANSI-colored terminal output, as well as direct integration with Python's standard `logging` library:

```python
import logging
import usmp

# Fast convenience setup with colored output:
usmp.setup_logging(level="DEBUG")

# Or configure via standard library logging:
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("usmp").setLevel(logging.DEBUG)
```

This outputs real-time frame transitions, socket operations, sequence numbers, and handshake FSM states.

#### Terminal Payload Inspector

When debugging connected sessions, you can visually inspect session metadata and recent activity using `session.print()`:

```python
async def on_client(session):
    # Dumps session ID, peer IP/port, sequence numbers, and cipher status to stdout
    session.print()
```

#### CLI Dev & Echo Server Debugging

You can run the built-in development server with verbose debug logging to test clients against an active endpoint:

```bash
python -m usmp.server --echo --verbose --port 8443
```

### 1.2 C Core (ESP32 / Embedded Platforms)

Debug log macros (like `USMP_LOGD`) are enabled by default in development builds. To disable them for production release builds to reduce code footprint and execution overhead, define the `USMP_DISABLE_DEBUG` preprocessor macro:

```cmake
target_compile_definitions(${PROJECT_NAME} PRIVATE -DUSMP_DISABLE_DEBUG)
```

In your platform's `usmp_port_log` implementation, map `'D'` (Debug) levels to your output log engine (e.g. `ESP_LOGD` or `printf`).

#### Programmatic Error Translation (`usmp_strerror`)

In C, never guess the meaning of a negative return value. Use `usmp_strerror()` to obtain human-readable diagnostic strings:

```c
int ret = usmp_send(&ctx, payload, len);
if (ret < 0) {
    ESP_LOGE("APP", "Send failed (%d): %s", ret, usmp_strerror(ret));
}
```

### 1.3 Arduino SDK

On Arduino, query diagnostic status directly from `USMPClient` or `USMPClientStatic`:

```cpp
if (!usmp.connected()) {
    USMPErrorCode err = usmp.lastError();
    Serial.print("Connection fault: ");
    Serial.println(usmp.lastErrorString());
}
```

---

## 2. Analyzing Frames on the Wire

Since USMP payloads are encrypted with AES-256-GCM, you cannot inspect the plaintext payload directly from Wireshark. However, you can analyze the unencrypted frame headers to verify packet sequencing and packet types:

### 2.1 USMP Frame Header Structure (12 bytes)

* **Magic** (2 bytes): `0xABCD` (Wire Little Endian: `0xCD 0xAB`)
* **Version** (1 byte): `0x02` (USMP v1.3.0 wire format)
* **Type** (1 byte): PacketType:
  * `0x01` = `PKT_HELLO`
  * `0x02` = `PKT_CHALLENGE`
  * `0x03` = `PKT_HELLO_ACK`
  * `0x04` = `PKT_SESSION_OK`
  * `0x05` = `PKT_DATA`
  * `0x06` = `PKT_HELLO_RETRY` (Stateless cookie challenge for UDP)
  * `0x07` = `PKT_PING`
  * `0x08` = `PKT_PONG`
  * `0x09` = `PKT_CLOSE`
* **Sequence Number** (4 bytes): 32-bit sequence counter (Little Endian)
* **Payload Length** (2 bytes): Size of the payload / ciphertext in bytes (Little Endian, max 1024)
* **CRC-16** (2 bytes): CRC-16-CCITT computed over the preceding 10 header bytes and payload (Little Endian)

### 2.2 Table-Driven Early Frame Rejection

In USMP v1.3.0, the receiver runs an optimized 256-entry table-driven CRC-16 check over the header and payload *before* passing buffers to cryptographic or session state machines.

To debug framing issues:
1. Verify the initial two magic bytes: `0xCD 0xAB`.
2. Check wire version byte: must be `0x02` (packets with `0x01` or unknown versions are rejected immediately with `USMP_ERR_PROTOCOL`).
3. Validate monotonic sequence increment: sequence numbers strictly increment on stream sockets, or fall within the 64-bit sliding anti-replay window on UDP datagram sockets.
4. Verify CRC-16: if packet headers or bytes are corrupted on physical links, `usmp_step()` or `usmp_recv()` will return `USMP_ERR_CORRUPT` without spending CPU cycles on AES-GCM decryption.

---

## 3. Simulating Adverse Network Conditions

To test the resilience of USMP keepalive PINGs, non-blocking FSM transitions, and connection timeouts:

* **Simulate Latency**: Introduce artificial lag on loopback interfaces using toolkits like `tc` (Linux Traffic Control) or clumsy (Windows). Verify that CoAP RFC 7252 RTT estimation dynamically adjusts RTO backoffs between 100 ms and 5000 ms.
* **Simulate Disconnections**: Force-close the TCP sockets during active transmission to verify that endpoints successfully detect link loss, clean up session states, and transition to `USMP_STATE_ERROR` before retrying with backoff.
* **Test Concurrency Stress**: Run concurrent FreeRTOS tasks sending high-throughput telemetry while receiving commands to confirm split `tx_mutex` and `rx_mutex` locks prevent deadlocks or nonce collisions.
