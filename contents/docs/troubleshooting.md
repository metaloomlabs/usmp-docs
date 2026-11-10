# USMP Troubleshooting Guide

This document lists common issues encountered when deploying, testing, or developing with the Unified Secure Multi-transport Protocol (USMP), along with their typical causes and resolutions.

## 1. Handshake Failures

### 1.1 Wire Protocol Version Mismatch (`USMP_ERR_PROTOCOL` / `-5`)

* **Symptom**: Handshake is instantly aborted by the peer with error `-5` (`USMP_ERR_PROTOCOL`).
* **Cause**: One endpoint is running an older USMP release (e.g. v1.2.0 with wire version `0x01`), while the peer requires USMP v1.3.0 (wire version `0x02`).
* **Resolution**:
  * Upgrade both client and gateway to USMP v1.3.0.
  * Verify Wireshark / raw header byte 2 (`version`) shows `0x02`.

### 1.2 `Client HMAC verification failed` (Server Side) or `Server HMAC verification failed` (Client Side)

* **Symptom**: The handshake fails at Step 3 or Step 4 with an authentication or HMAC error (`USMP_ERR_AUTH` / `-2`).
* **Cause**:
  * The client and server are not using the exact same Pre-Shared Key (PSK).
  * The PSK loaded at runtime on the device does not match the PSK configured in the server's device registry.
  * String encoding discrepancy (e.g., passing a hex string where a binary 32-byte key is expected).
* **Resolution**:
  * Verify that the PSK is identical on both sides.
  * When using 64-character hex strings in C / Arduino, use `usmp_psk_from_hex()` or binary byte arrays to avoid passing literal ASCII characters.
  * If using dynamic PSK resolution (`Callable` or dictionary registry on the server), check that the device ID parsed from the HELLO packet exactly matches the registration key.

### 1.3 `Device ID not registered` (Server Side)

* **Symptom**: The server rejects the handshake after receiving the client's HELLO frame.
* **Cause**: The server is using a dictionary of PSKs, and the client's device ID is not a key in that dictionary.
* **Resolution**:
  * Register the device's ID in the server configuration.
  * If device IDs are dynamic (e.g., random or MAC-address-based), ensure the server resolves the correct PSK for the incoming device ID.

---

## 2. Mutex & Concurrency Errors

### 2.1 Mutex Lock Acquisition Failed (`USMP_ERR_MUTEX_FAILED` / `-10`)

* **Symptom**: API calls return `-10` (`USMP_ERR_MUTEX_FAILED`).
* **Cause**:
  * An RTOS task attempted to acquire `tx_mutex` or `rx_mutex` with a timeout that expired due to task starvation or another task deadlocking the lock.
  * Attempting to call `usmp_send()` or `usmp_recv()` from an Interrupt Service Routine (ISR), which violates FreeRTOS mutex rules.
* **Resolution**:
  * Ensure USMP functions are called only from standard task contexts, never from ISRs (use RTOS queues to bridge ISR data to an agent task).
  * Check that higher-priority tasks do not monopolize CPU time without yielding (`vTaskDelay`).
  * Remember that in v1.3.0 `tx_mutex` and `rx_mutex` are independent: you can safely run one dedicated TX task and one dedicated RX task simultaneously.

### 2.2 Peer Disconnection (`USMP_ERR_PEER_CLOSED` / `-11`)

* **Symptom**: `usmp_recv()` or `usmp_step()` returns `-11` (`USMP_ERR_PEER_CLOSED`).
* **Cause**: The remote peer closed the TCP socket connection gracefully (sent a FIN or CLOSE frame) or reset the connection (TCP RST).
* **Resolution**:
  * Treat `-11` as a trigger for graceful reconnection with exponential backoff rather than a fatal crypto fault.

---

## 3. Encryption and Connection Errors

### 3.1 `Decryption failed` or `CryptoError` (`USMP_ERR_CRYPTO` / `-3`)

* **Symptom**: Connection is established, but immediately raises a decryption failure error on the first payload frame.
* **Cause**:
  * Mismatched session keys between client and server (usually caused by a handshake sequence mismatch or memory corruption).
  * The frame was modified or corrupted in transit, causing the AES-GCM authentication tag check to fail.
  * Nonce reuse caused by multi-threaded task races without mutex protection (in v1.3.0, `tx_mutex` guarantees thread-safe nonce sequencing).
* **Resolution**:
  * Capture network packets to verify frame integrity.
  * Re-establish the session (re-run handshake) to derive fresh session keys.

### 3.2 `Sequence mismatch` / Replay Window Drops

* **Symptom**: The receiver drops data packets with a sequence number error (`USMP_ERR_REPLAY` / `-4`).
* **Cause**:
  * Out-of-order delivery exceeding the 64-bit sliding anti-replay window on UDP datagrams.
  * Stream (TCP) sequence deviation: packets delivered out of sequence or skipped.
  * A potential replay attack.
* **Resolution**:
  * On TCP, ensure connection drop recovery cleanly resets the session rather than resuming stale sequence numbers.
  * On UDP, ensure network links do not experience extreme packet re-ordering (beyond 64 packets).

### 3.3 TCP Connection Failures & Firewall Blocks

* **Symptom**: The client prints `[USMP] TCP connect failed` or `Unable to connect to <IP>:<Port>` even though Wi-Fi is connected.
* **Cause**:
  * The USMP server is not running or is listening on a different IP/port.
  * The host machine running the server has a firewall blocking incoming traffic. This is extremely common on Windows when network profiles default to "Public".
* **Resolution**:
  * Verify that the server is online and listening on the specified IP and port.
  * Ensure the client's network subnet matches the server's network subnet (especially if using static IP configurations).
  * Open port `8443` (or your custom port) on the host machine's firewall.
  * On Windows, run the following command in an **elevated Command Prompt (Admin)** to allow incoming TCP traffic:

    ```powershell
    netsh advfirewall firewall add rule name="USMP TCP 8443" dir=in action=allow protocol=TCP localport=8443 profile=any
    ```

    Or in **PowerShell (Admin)**:

    ```powershell
    New-NetFirewallRule -DisplayName "USMP TCP 8443" -Direction Inbound -LocalPort 8443 -Protocol TCP -Action Allow -Profile Any
    ```

---

## 4. Embedded & Hardware Limitations

### 4.1 Watchdog Resets (WDT) During Handshake (Arduino / ESP32)

* **Symptom**: The microcontroller resets with a Watchdog Timer timeout (`Task watchdog got triggered`) during connection attempts.
* **Cause**:
  * The handshake process blocked waiting on network sockets longer than the hardware watchdog timeout (typically 3–5 seconds on ESP32/ESP8266).
* **Resolution**:
  * Use the non-blocking state machine: call `usmp_connect_async()` and advance it iteratively in your task loop with `usmp_step(&ctx)`.
  * In Arduino, switch to `usmp.beginAsync()` and allow `usmp.maintain()` to drive the connection in `loop()` without blocking.
  * Ensure platform port implements `usmp_port_wdt_feed()` (which hooks into `esp_task_wdt_reset()`).

### 4.2 Heap Fragmentation & Memory Allocation Crashes

* **Symptom**: Microcontroller crashes or reboots after hours of operation, or fails during transport allocation.
* **Cause**: Dynamic memory allocation (`malloc`, `free`) in repetitive connection cycles fragmented the heap.
* **Resolution**:
  * Use zero-heap static initializers: `usmp_transport_tcp_init_static()` and `usmp_transport_udp_init_static()` in C.
  * On Arduino, instantiate `USMPClientStatic<TxSize, RxSize>` instead of `USMPClient` to eliminate all heap allocation.
  * In USMP v1.3.0, handshake scratchpads (`USMP_HANDSHAKE_SCRATCH_LEN = 2048`) are allocated on stack or caller buffers and securely zeroized.

## 4. Keepalive & Inactivity Timeout Issues

### 4.1 Frequent Disconnects after PING/PONG (Arduino / Polling Wrapper)

* **Symptom**: The client successfully connects, sends/receives data, but immediately disconnects and reconnects 5 seconds after sending a keepalive `PING`.
* **Cause**:
  * The core C function `usmp_recv` loops internally after reading control frames (like `PONG` or `PING`) to look for a `DATA` frame.
  * In polling or non-blocking environments (like the Arduino port), if the transport buffer becomes empty, the transport's read operation blocks waiting for the next packet.
  * If a timeout is enforced (e.g. the default 5-second timeout in `arduino_tcp_recv`), the read times out, which `usmp_recv` treats as a fatal connection drop.
* **Resolution**:
  * Update the library to the latest version where `usmp_recv` checks the transport's `available` hook and returns `0` early if the buffer is empty.
  * Ensure that polling wrappers (like `USMPClient::read()`) are updated to handle `0` return values as normal non-data events instead of connection failures.

### 4.2 Client Keepalive Overridden or Wiped Out

* **Symptom**: You set `usmp.keepalive(15000)` on the client, but it still waits for 30 seconds before sending a PING.
* **Cause**: The `usmp.keepalive(ms)` function was called **before** `usmp.begin()`. Inside `begin()`, the client context structure `_ctx` is fully zeroed out via `memset`, resetting the keepalive timeout to the default 30 seconds.
* **Resolution**:
  * Always call `usmp.keepalive(ms)` **after** `usmp.begin()`.

### 4.3 Optimizing Keepalive Traffic (Reducing Redundant PINGs)

* **Symptom**: The client and server are constantly streaming data, but the client still sends PING packets every 15/30 seconds, causing redundant traffic.
* **Cause**: The client's keepalive timer (`usmp_keepalive_tick`) tracks **transmit inactivity** (time since the last outgoing packet was sent by the client). Even if the client is receiving data constantly, if it doesn't send anything, its transmit timer will expire.
* **Resolution**:
  * Implement **Application-Level Control (ACK)**. Modify the client's message received callback (`onMessage`) to send a small response (e.g. `usmp.send("ACK")`) back to the server.
  * Since the client is now actively transmitting, this resets the client's transmit inactivity timer (`last_tx_ms`), completely suppressing keepalive PINGs during active data streams.
  * If the server stops sending, the client stops ACKing, and after the keepalive interval (e.g. 15s) of complete silence, the client will automatically resume sending PINGs to verify the link.
