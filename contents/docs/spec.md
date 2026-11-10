# USMP Technical Specification | Version v1.3.0

Welcome to the official technical specification for the **Unified Secure Multi-transport Protocol (USMP) v1.3.0**.

This document serves as the canonical reference for developers implementing USMP client libraries, server SDKs, or alternative transport adapters. It covers frame layouts, cryptographic sequences, state machine rules, and resource limits.

## 1. Protocol Philosophy

USMP is a lightweight, binary, session-oriented protocol designed to bridge the "IoT Security Gap." It is built upon five core guidelines:

* **Keep it Simple**: The protocol is small enough to be read, understood, and audited in a single afternoon.
* **Mandatory Encryption**: There is no "plaintext mode." Every byte sent after the handshake is encrypted.
* **Mutual Trust**: Both the device and the gateway must prove identity before a session is established.
* **Ephemeral Keys**: Every session uses fresh Curve25519 keys, providing forward secrecy.
* **Transport Independence**: USMP runs over any reliable byte stream (TCP, Serial UART, UDP, BLE).

## 2. Structural Conventions

* **Endianness**: All multi-byte integer values are transmitted in **little-endian** byte order.
* **Sizes**: All sizes, offsets, and length fields are measured in **bytes**.
* **Data Types**:
  * `u8`: Unsigned 8-bit integer (1 byte)
  * `u16`: Unsigned 16-bit integer (2 bytes, little-endian)
  * `u32`: Unsigned 32-bit integer (4 bytes, little-endian)
  * `u64`: Unsigned 64-bit integer (8 bytes, little-endian)
  * `bytes[N]`: Fixed-length array of $N$ bytes
  * `bytes[*]`: Variable-length byte array

## 3. Frame Layout

Every USMP packet is serialized into a single binary frame. The header occupies exactly **12 bytes**, and the payload is limited to a maximum of **480 bytes** to ensure the entire frame fits within 512 bytes:

```text
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Magic (0xABCD)            | Version       | Type          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Sequence Number (32-bit)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Payload Length            |     CRC-16/IBM                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Payload (N bytes)                                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Field Reference

* **`magic`** *(u16, offset 0)*: Frame boundary marker. Must always be `0xABCD`. If a receiver parses a packet starting with any other value, it must drop the transport connection immediately.
* **`version`** *(u8, offset 2)*: Wire protocol version. Currently `0x02`. If a receiver gets an unsupported version, it terminates the connection immediately.
* **`type`** *(u8, offset 3)*: Packet identifier. Determines the payload structure and processing rules (see Section 4).
* **`seq`** *(u32, offset 4)*: Monotonic sequence number. Starts at `0` for the first post-handshake packet and increments by 1 per frame. Handshake packets always carry `seq = 0`. For TCP, if a receiver receives an out-of-order sequence number, it terminates the session. For UDP, a sliding replay window is used instead (see Section 8.1).
* **`length`** *(u16, offset 8)*: Byte length of the variable `payload` field (maximum `480`).
* **`crc`** *(u16, offset 10)*: CRC-16/IBM error check (polynomial `0xA001`, initial value `0xFFFF`) calculated over bytes `0..9` (the header excluding the CRC field) plus the variable `payload` bytes.
* **`payload`** *(bytes[length], offset 12)*: Handshake payloads are plaintext. Post-handshake payloads are encrypted with AES-256-GCM, containing the ciphertext followed by a 16-byte authentication tag:
    $$\text{payload} = \text{ciphertext} \parallel \text{tag}$$

### 3.1 Fast Table-Driven CRC Engine & Early Packet Rejection

To maximize throughput and prevent CPU exhaustion during network frame bursts, USMP v1.3.0 optimizes the frame validation pipeline:

* **Precomputed Flash Table Lookup**: Replaces legacy 8-iteration bitwise loops with a 256-word precomputed Flash lookup table (`.rodata`, 512 bytes ROM, 0 bytes RAM). Delivers ~8x faster single-cycle per-byte CRC-16 computation on microcontrollers (ESP32, ARM Cortex-M) with 100% wire equivalence.
* **Zero-Copy Early Packet Rejection**: When parsing an inbound wire buffer, `usmp_parse_packet()` computes and validates the frame CRC directly over raw transport memory before executing `memcpy(pkt->payload, ...)`. Malformed, truncated, or corrupted frames are dropped immediately without polluting internal application buffers or consuming CPU cycles on memory copies.

## 4. Packet Types

| Value | Name | Direction | Encrypted? | Description / Role |
| :--- | :--- | :--- | :--- | :--- |
| `0x01` | `PKT_HELLO` | Client → Server | No | Announces Device ID and client public key `pub_C`. Over UDP, may include a return-routability cookie (see Section 5.1). |
| `0x02` | `PKT_CHALLENGE` | Server → Client | No | Pushes server challenge `nonce` and public key `pub_S`. |
| `0x03` | `PKT_HELLO_ACK` | Client → Server | No | Proves client identity via HMAC, binding handshake keys. |
| `0x04` | `PKT_SESSION_OK` | Server → Client | No | Confirms server identity, sends Session ID. |
| `0x05` | `PKT_DATA` | Both | Yes | Application payload (or final frame of a fragmented group). |
| `0x06` | `PKT_PING` | Both | Yes | Keepalive heartbeat. |
| `0x07` | `PKT_PONG` | Both | Yes | Keepalive response. |
| `0x08` | `PKT_BYE` | Both | Yes | Graceful connection exit. |
| `0x09` | `PKT_DATA_FRAG` | Both | Yes | Payload fragment (initial/middle chunks). |
| `0x0A` | `PKT_HELLO_RETRY` | Server → Client | No | UDP return-routability cookie challenge (see Section 5.6). |
| `0x0B` | `PKT_REKEY` | Both | Yes | In-band session key rotation salt exchange (see Section 5.7). |
| `0xFF` | `PKT_ERROR` | Both | No | Reserved (unused diagnostic telemetry). |

## 5. The Handshake Sequence

The handshake is a mutual key-exchange and verification routine. It must complete successfully before any data frames can be sent. Over **TCP**, the handshake is a 4-step sequence. Over **UDP**, an additional return-routability step precedes it (see Section 5.6).

### TCP Handshake (4 steps)

```text
Client (Device)                                      Server (Gateway)
      │                                                     │
      │ ─── 1. PKT_HELLO (device_id, pub_C) ──────────────> │
      │                                                     │
      │ <── 2. PKT_CHALLENGE (nonce, pub_S) ─────────────── │
      │                                                     │
      │      [Both compute shared keys locally]             │
      │                                                     │
      │ ─── 3. PKT_HELLO_ACK (hmac_client) ───────────────> │
      │                                                     │
      │ <── 4. PKT_SESSION_OK (session_id, hmac_server) ─── │
      │                                                     │
      └──────────────── ESTABLISHED Session ────────────────┘
```

### 5.1 `PKT_HELLO` (0x01)

* **Payload Length**: 38 bytes (TCP) or 54 bytes (UDP with cookie)
* **Structure**:
  * `0..5` (6 bytes): `device_id` (Station Wi-Fi MAC address).
  * `6..37` (32 bytes): `pub_C` (client's ephemeral Curve25519 public key).
  * `38..53` (16 bytes, UDP only): `cookie` — return-routability cookie from a prior `PKT_HELLO_RETRY`. Omitted on the initial HELLO over UDP; included on the retry.

### 5.2 `PKT_CHALLENGE` (0x02)

* **Payload Length**: 64 bytes
* **Structure**:
  * `0..31` (32 bytes): `nonce` (cryptographically secure random challenge).
  * `32..63` (32 bytes): `pub_S` (server's ephemeral Curve25519 public key).

### 5.3 Cryptographic Key Derivation

Once both public keys are exchanged, both endpoints perform Diffie-Hellman calculations:

$$\text{shared} = \text{X25519}(\text{priv\_local}, \text{pub\_peer})$$

$$\text{session\_key} = \text{HKDF-SHA256}(\text{ikm}=\text{shared}, \text{salt}=\text{nonce}, \text{info}=\text{"usmp-v1"} \parallel \text{pub\_C} \parallel \text{pub\_S}, \text{len}=32)$$

* *Note: Injected public keys are concatenated to bind the session key to this specific negotiation.*

### 5.4 `PKT_HELLO_ACK` (0x03)

* **Payload Length**: 32 bytes
* **Structure**:
  * `0..31` (32 bytes): `hmac_client` = $\text{HMAC-SHA256}(\text{PSK}, \text{nonce} \parallel \text{device\_id} \parallel \text{pub\_C} \parallel \text{pub\_S})$
* *Validation*: The server computes the expected HMAC. If it fails to match (checked using constant-time comparison), the server immediately closes the connection.

### 5.5 `PKT_SESSION_OK` (0x04)

* **Payload Length**: 48 bytes
* **Structure**:
  * `0..15` (16 bytes): `session_id` (random 128-bit session identifier).
  * `16..47` (32 bytes): `hmac_server` = $\text{HMAC-SHA256}(\text{PSK}, \text{nonce} \parallel \text{session\_id} \parallel \text{pub\_C} \parallel \text{pub\_S})$
* *Validation*: The client computes the expected server HMAC and validates it. If it fails, the connection is aborted immediately.

### 5.6 UDP Return-Routability (`PKT_HELLO_RETRY`, 0x0A)

Over connectionless transports (UDP), the server must verify the client's return address before performing expensive ECDH operations. This prevents amplification attacks from spoofed source IPs.

```text
Client (Device)                                      Server (Gateway)
      │                                                     │
      │ ─── 1. PKT_HELLO (device_id, pub_C) ──────────────> │
      │                                                     │  (server computes
      │ <── 2. PKT_HELLO_RETRY (cookie) ─────────────────── │   stateless cookie)
      │                                                     │
      │ ─── 3. PKT_HELLO (device_id, pub_C, cookie) ──────> │
      │                                                     │  (server verifies
      │ <── 4. PKT_CHALLENGE (nonce, pub_S) ─────────────── │   cookie, proceeds)
      │                                                     │
      │       ... continues as TCP steps 3–4 ...            │
```

* **`PKT_HELLO_RETRY` Payload Length**: 16 bytes
* **Structure**:
  * `0..15` (16 bytes): `cookie` — a server-generated stateless HMAC-based token binding the client's address and `device_id`. The server does **not** allocate any state until the cookie is returned.

### 5.7 In-Band Session Rekeying (`PKT_REKEY`, 0x0B)

USMP supports in-band key rotation (introduced in v1.2.0, hardened in v1.3.0 with split mutex concurrency), allowing either peer to refresh active session keys without disconnecting or re-running the X25519 handshake.

```text
Initiator (Client or Server)                         Peer (Server or Client)
      │                                                         │
      │ ─── 1. PKT_REKEY (salt: 32 bytes) ────────────────────> │
      │                                                         │
      │   [Both derive new_tx_key, new_rx_key via HKDF-SHA256]  │
      │   [Reset sequence numbers: tx_seq = 0, rx_seq = 0]      │
      │   [Reset sliding replay window: rx_window_bitmap = 0]   │
      │                                                         │
      └──────────────── REKEYED Session ────────────────────────┘
```

* **Payload**: Exactly 32 bytes of cryptographically secure random entropy (`salt`).
* **Key Derivation**:
  $$\text{secret} = \begin{cases} \text{tx\_key} \parallel \text{rx\_key} & \text{if initiator} \\ \text{rx\_key} \parallel \text{tx\_key} & \text{if peer} \end{cases}$$
  $$\text{key\_material} = \text{HKDF-SHA256}(\text{ikm}=\text{secret}, \text{salt}=\text{salt}, \text{info}=\text{"usmp-rekey"} \parallel \text{session\_id}, \text{len}=64)$$
* **Sequence Counter & Bitmap Reset**: Following key update, both sequence numbers (`tx_seq`, `rx_seq`) and the 64-bit sliding anti-replay bitmap are reset to `0`.

### 5.8 Asynchronous Non-Blocking Handshake State Machine & Watchdog Servicing

USMP v1.3.0 replaces blocking 2–5 second handshake loops with an explicit non-blocking finite state machine (`usmp_state_t`):

* **State Progression**:
  1. `USMP_STATE_IDLE` (`0`): Session context initialized or closed.
  2. `USMP_STATE_CONNECTING_SOCKET` (`1`): Transport connection in progress.
  3. `USMP_STATE_AWAITING_CHALLENGE` (`2`): Sent `PKT_HELLO`; awaiting server `PKT_CHALLENGE`.
  4. `USMP_STATE_CALCULATING_ECDH` (`3`): Performing Curve25519 shared secret calculation and HKDF derivation.
  5. `USMP_STATE_AWAITING_SESSION_OK` (`4`): Sent `PKT_HELLO_ACK`; awaiting server `PKT_SESSION_OK`.
  6. `USMP_STATE_ESTABLISHED` (`5`): Cryptographic handshake complete; session active and ready for AEAD payloads.
  7. `USMP_STATE_ERROR` (`6`): Handshake or link error encountered.

* **Non-Blocking Tick (`usmp_step`)**:
  Callers drive connection bring-up and reconnects incrementally by invoking `usmp_step(&ctx)` (or `usmp.maintain()` in Arduino). Each tick processes pending socket data without blocking, advances the state machine, and feeds the platform hardware watchdog timer via the `usmp_port_wdt_feed()` HAL hook.
* **Bounded Handshake Timeouts**:
  Replaces unbounded receive loops with `USMP_HANDSHAKE_RECV_TIMEOUT_MS` (default 5000 ms), preventing MCU hangs when the server is unreachable or silent.

## 6. Authenticated Encryption (AES-256-GCM & ChaCha20-Poly1305)

All packets after the handshake are protected using an Authenticated Encryption with Associated Data (AEAD) cipher suite. USMP v1.3.0 supports two standardized cipher suites:

* **`USMP_CIPHER_AES_256_GCM` (`0x01`, Default)**: Hardware-accelerated AES-256 in Galois/Counter Mode.
* **`USMP_CIPHER_CHACHA20_POLY1305` (`0x02`)**: High-performance ChaCha20 stream cipher with Poly1305 authenticator, ideal for platforms without dedicated AES hardware.

### 6.1 Nonce Construction

To prevent nonce reuse, the 12-byte GCM nonce is constructed deterministically from the 32-bit sequence number and the Session ID:

$$\text{nonce} = \text{seq (4 bytes, Little-Endian)} \parallel \text{session\_id[0..7] (8 bytes)}$$

This guarantees uniqueness per frame and session, avoiding the speed penalty of random number generators.

### 6.2 Additional Authenticated Data (AAD)

To prevent header metadata spoofing, the first 10 bytes of the header are fed into the AES-GCM engine as AAD:

$$\text{aad} = \text{magic (2 bytes)} \parallel \text{version (1 byte)} \parallel \text{type (1 byte)} \parallel \text{seq (4 bytes)} \parallel \text{length (2 bytes)}$$

### 6.3 Split RTOS Mutex Concurrency Architecture

In multi-threaded embedded operating systems (such as FreeRTOS on ESP32) or multi-core environments, USMP embeds dedicated transmission (`tx_mutex`) and reception (`rx_mutex`) synchronization primitives directly in `usmp_t`:

* **`tx_mutex`**: Guards sequence number reservation (`tx_seq`), AEAD encryption, and wire transmission. Strictly serializes all concurrent calls to `usmp_send()`, eliminating race conditions and preventing AES-GCM nonce reuse under any circumstances.
* **`rx_mutex`**: Guards receive sequence validation (`rx_seq`), the 64-bit sliding anti-replay bitmap, and message defragmentation.
* **Full-Duplex Freedom**: Because egress and ingress locks are decoupled, a long-running or blocking receive call (`usmp_recv`) does not lock out or stall egress transmissions (`usmp_send`), completely eliminating full-duplex socket deadlocks.
* **Hierarchical Lock Order**: Operations requiring both mutexes — namely in-band session rekeying (`usmp_rekey`) and session teardown (`usmp_close`) — enforce a strict lock acquisition hierarchy: `tx_mutex` is always acquired first, followed by `rx_mutex`. This mathematical ordering guarantees deadlock freedom across all RTOS tasks.
* **HAL Mutex Abstractions**: Platforms provide mutex implementations via `usmp_port_mutex_create()`, `usmp_port_mutex_lock()`, `usmp_port_mutex_unlock()`, and `usmp_port_mutex_destroy()`. If a mutex lock fails, the operation returns `USMP_ERR_MUTEX_FAILED` (`-10`).

## 7. Dynamic Payload Fragmentation & Reassembly

Plaintext capacity per frame is limited:

* **Frame Capacity**: Header (12 bytes) + Payload (480 bytes max) = 492 bytes.
* **Plaintext Capacity**: GCM payload contains a 12-byte nonce, the ciphertext, and a 16-byte tag. This leaves **452 bytes** for plaintext application data (`USMP_MAX_DATA_LEN`).

### Fragmentation Rules

If an outgoing payload exceeds 452 bytes:

1. The sender splits the data into multiple sequential chunks of up to 452 bytes.
2. The first $N-1$ frames are transmitted with type `PKT_DATA_FRAG` (`0x09`).
3. The final frame is transmitted with type `PKT_DATA` (`0x05`).
4. **Limits**: Payloads are capped at a maximum of **4 frames** (`USMP_MAX_FRAMES`). The absolute maximum reassembled plaintext size is $452 \times 4 = 1808$ bytes (~1.8 KB). Payloads exceeding this are rejected immediately before transmission.

### Reassembly Constraints

The receiver decrypts and appends each chunk sequentially. Reassembly is complete once a frame of type `PKT_DATA` is processed.

* If a control frame (`PING`, `PONG`, `BYE`) is interleaved while reassembly is in progress, the session is terminated due to a protocol violation (`ERR_SEQ`).
* If the fragment count exceeds 4 frames before completion, the session is dropped (`ERR_BAD_FRAME`).

## 8. Keepalive, Timeout Watchdogs & Anti-Replay

### 8.1 Keepalive Timers

USMP uses asymmetrical timers to verify connections:

* **Client Keepalive (TX-driven)**: The client monitors its own **transmit inactivity** (time elapsed since the client last sent a frame). It sends a `PKT_PING` frame every 30 seconds if it has been idle. **Incoming packets do not reset this timer.**
* **Server Watchdog (RX-driven)**: The server tracks **receive inactivity** (time elapsed since the server last received a packet from the client). If a client fails to transmit a packet (telemetry or PING) within the configured session timeout (default 60 seconds), the server closes the session. **Outgoing packets sent to the client do not reset this timer.**

### 8.2 UDP Sliding Replay Window

Over connectionless transports, strict monotonic sequence enforcement is impractical because packets may arrive out-of-order. USMP uses a 64-bit sliding bitmap window for UDP anti-replay protection:

* The receiver tracks the **highest authenticated sequence number** (`rx_seq`) and a 64-bit bitmap (`rx_window_bitmap`) representing the acceptance state of the 64 most recent sequence numbers.
* **Acceptance rules**:
  1. If `pkt.seq > rx_seq`: the packet is **ahead** of the window — accept, slide the window forward, and mark as received.
  2. If `pkt.seq >= rx_seq - 63` and `pkt.seq <= rx_seq`: the packet is **within** the window — check the corresponding bit. Accept only if the bit is unset (not a duplicate).
  3. If `pkt.seq < rx_seq - 63`: the packet is **too old** (behind the window) — drop silently.
* **Critical**: the replay window bitmap is updated **only after** successful AES-GCM authentication, preventing an attacker from advancing the window with forged packets.

### 8.3 Receive Iteration Cap

To mitigate CPU exhaustion from floods of malformed or unauthenticated packets, `usmp_recv` limits the number of receive-and-parse attempts to **10 per call**. If 10 consecutive packets fail validation (parse error, decryption failure, replay duplicate), the call returns 0 (no data) rather than looping indefinitely. This bounds worst-case CPU time on UDP transports.

### 8.4 Adaptive CoAP RTT Estimation & Watchdog Protection for UDP ARQ

Over connectionless UDP transport, USMP v1.3.0 implements RFC 7252 (CoAP) / Jacobson-Karn smoothed round-trip time estimation to adapt to variable latency and packet loss:

* **RTT Estimation**: Tracked via smoothed RTT ($\text{SRTT}$, default 200 ms) and RTT variation ($\text{RTTVAR}$, default 100 ms) updated strictly on first-attempt ACKs:
  $$\text{err} = \text{sample\_rtt} - \text{SRTT}$$
  $$\text{RTTVAR} = \text{RTTVAR} + 0.25 \times (|\text{err}| - \text{RTTVAR})$$
  $$\text{SRTT} = \text{SRTT} + 0.125 \times \text{err}$$
* **Retransmission Ambiguity Exclusion**: Samples are measured exclusively on frames acknowledged on their first transmission attempt, preventing ambiguity between initial frames and retransmissions.
* **Dynamic RTO Bounds**: Retransmission Timeout ($\text{RTO}$) is clamped between 100 ms and 5000 ms:
  $$\text{RTO} = \max\left(100\text{ ms}, \min\left(5000\text{ ms}, \text{SRTT} + 4.0 \times \text{RTTVAR}\right)\right)$$
* **Binary Exponential Backoff**: Up to 5 transmission attempts are executed per frame, doubling the timeout on each successive loss up to 5000 ms max before returning a transport failure.
* **Watchdog Integration**: During retransmission wait loops, `usmp_port_wdt_feed()` is invoked regularly to protect against hardware watchdog timer resets during link outages.

## 9. Pre-Shared Key (PSK) Requirements

USMP authenticates both endpoints using a **Pre-Shared Key (PSK)** that must be provisioned at runtime:

* **Minimum length**: 16 bytes (128-bit).
* **Recommended**: 32 bytes generated via a CSPRNG (e.g., `os.urandom(32)` or hardware RNG).
* **Binary PSK Support**: APIs support explicit byte pointers and lengths (`(const uint8_t* psk, size_t psk_len)`), ensuring high-entropy random keys containing `0x00` null bytes are never prematurely truncated by string terminators.
* **Compile-time PSK is not supported**: Attempting to define `USMP_PSK` at compile time will produce a build `#error`. The PSK must be loaded from secure storage, an HSM, or secure boot provisioning.
* **Lifetime**: The PSK pointer (`ctx.psk`) must remain valid for the entire session lifetime.

> **⚠️ Known Limitation**: USMP relies on offline-provisioned symmetric PSKs. If the PSK is compromised, an attacker can impersonate either endpoint. A PAKE-based key agreement upgrade is planned for a future version to eliminate this gap.

## 10. Programmatic Error Codes & Status Reference

USMP provides typed status codes (`usmp_err_t` in C and `USMPErrorCode` in Python) returned directly by all library operations:

| Code | Enumeration Constant | Python ErrorCode | Description / Cause |
| :--- | :--- | :--- | :--- |
| `0` | `USMP_OK` | `OK` | Operation completed successfully. |
| `-1` | `USMP_ERR_INVALID_ARG` | `INVALID_ARG` | Invalid argument passed (e.g., NULL pointer, invalid length). |
| `-2` | `USMP_ERR_TRANSPORT_FAILED` | `TRANSPORT_FAILED` | Underlying socket or transport send/receive operation failed. |
| `-3` | `USMP_ERR_AUTH_FAILED` | `AUTH_FAILED` | HMAC signature mismatch during handshake verification. |
| `-4` | `USMP_ERR_TIMEOUT` | `TIMEOUT` | Inactivity watchdog or handshake timer expired without progress. |
| `-5` | `USMP_ERR_REPLAY_DETECTED` | `REPLAY_DETECTED` | Inbound frame duplicated or rejected by anti-replay sliding window. |
| `-6` | `USMP_ERR_BUFFER_OVERFLOW` | `BUFFER_OVERFLOW` | Frame or application payload exceeds buffer allocation boundaries. |
| `-7` | `USMP_ERR_SEQ_EXHAUSTED` | `SEQ_EXHAUSTED` | Monotonic 32-bit sequence counter reached `0xFFFFFFFF`. |
| `-8` | `USMP_ERR_CRYPTO_FAILED` | `CRYPTO_FAILED` | AEAD decryption failed or authentication tag check did not match. |
| `-9` | `USMP_ERR_NOT_CONNECTED` | `NOT_CONNECTED` | Send or receive attempted on an unestablished session context. |
| `-10` | `USMP_ERR_MUTEX_FAILED` | `MUTEX_FAILED` | RTOS synchronization primitive failed to create, acquire, or unlock. |
| `-11` | `USMP_ERR_PEER_CLOSED` | `PEER_CLOSED` | Remote peer sent an authenticated `PKT_BYE` frame for clean exit. |

### Human-Readable Error Translation

* **C Core**: `const char* usmp_strerror(usmp_err_t err)` maps any library error code to a static, human-readable string literal.
* **Arduino Port**: `usmp.lastError()` returns the raw `usmp_err_t` code, and `usmp.lastErrorString()` returns the translated status string.

## 11. Zero-Heap Embedded Architecture & Memory Footprint

USMP v1.3.0 implements a **pure zero-heap memory architecture** for microcontrollers:

### Handshake Scratchpad Memory (`USMP_HANDSHAKE_SCRATCH_LEN`)

* By setting `ctx.scratch` to a caller-managed memory buffer of at least `USMP_HANDSHAKE_SCRATCH_LEN` (2048 bytes), `usmp_handshake()` operates with **zero dynamic heap allocations (`malloc`/`calloc`)**.
* The scratchpad accommodates the handshake context (mbedTLS ECDH/DRBG state) and 1024-byte TX/RX frame buffers.
* Upon handshake completion, the scratchpad contents are securely erased via `mbedtls_platform_zeroize()` to protect ephemeral state.
* The scratchpad buffer pointer is preserved across `usmp_connect()` and `usmp_reconnect()`.
* Compiling with `#define USMP_ZERO_HEAP` strictly asserts zero dynamic memory usage across the build.

### Static Transport Contexts

* Microcontroller transports support caller-managed static/BSS allocation via `usmp_transport_tcp_init_static()` and `usmp_transport_udp_init_static()` with `usmp_tcp_ctx_t` and `usmp_udp_ctx_t`.
* In Arduino, `USMPClientStatic<RxBufferSize, ScratchBufferSize>` embeds all frame and handshake buffers directly in `.bss` memory.
* Static transports install safe teardown hooks (`destroy_static`) that shut down sockets without calling `free()` or `delete`.

### Persistent Footprint (`usmp_t` Session Context)

* **32-bit (ESP32)**: **~240 bytes** persistent RAM (incorporates keys, split mutex handles, FSM state, and error fields).
* **64-bit**: **~320 bytes** persistent RAM.
* **Stack Bounding**: Standard `usmp_send` and `usmp_recv` allocate transient frame buffers (~492 bytes) on the stack, consuming under 1 KB of stack space.

## 12. Transport Layer Summary

| Transport | Reliability | Handshake | Replay Protection | Session Cap |
| :--- | :--- | :--- | :--- | :--- |
| **TCP** | Stream-ordered | 4-step (Section 5) | Strict monotonic `seq` | Per-IP + global |
| **UDP** | Datagram, CoAP ARQ | 5-step with cookie (Section 5.6) | 64-bit sliding window (Section 8.2) | Per-IP + global |
| **Serial/UART** | Stream-ordered | 4-step (Section 5) | Strict monotonic `seq` | N/A (point-to-point) |
| **BLE** | Stream-ordered | 4-step (Section 5) | Strict monotonic `seq` | N/A (point-to-point) |

---

*USMP v1.3.0 — Released 2026-09-26. Licensed under Apache-2.0.*
