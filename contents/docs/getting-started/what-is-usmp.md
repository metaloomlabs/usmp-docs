# Introduction to USMP

Secure communication for IoT devices shouldn't be complex. Yet today, developers are forced to choose between two extremes:

* **Raw Sockets (Simple but insecure)**: Packets are sent in plaintext, vulnerable to eavesdropping, manipulation, and spoofing.
* **Full TLS / DTLS (Secure but heavy)**: Requires extensive RAM and flash storage, calls for complex public-key infrastructure (PKI) certificates, involves slow handshakes, and is difficult to compile and debug on constrained microcontrollers.

**USMP (Unified Secure Multi-transport Protocol) bridges this gap.** It gives your hardware production-grade security (mutual authentication, perfect forward secrecy, and AES-256-GCM encryption) with zero-configuration runtime setup, zero-heap static memory guarantees, and split RTOS concurrency.

---

## Architecture Overview

USMP operates as a lightweight session layer. It wraps your application-level payloads (like JSON sensor readings or binary control logs) inside a secure, encrypted envelope, which is then serialized and passed down to an underlying transport layer.

```text
+-------------------------------------------------------------+
|                   Your Application Data                     |  <-- JSON, logs, bytes, telemetry
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     USMP Session Layer                      |  <-- Non-blocking FSM, AES-256-GCM,
|          (Mutual Auth, PFS, Split RTOS Mutexes)             |      and sequence tracking
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    Transport Abstraction                    |  <-- Stream / Datagram interface
|          (Zero-Heap Static or Heap-Allocated Buffers)       |      (TCP / UDP)
+-------------------------------------------------------------+
                               |
               +---------------+---------------+
               |                               |
               v                               v
+-----------------------------+ +-----------------------------+
| TCP Sockets (Monotonic Seq) | | UDP Sockets (Sliding Window)|  <-- Physical networking layers
+-----------------------------+ +-----------------------------+
```

---

## Core Guarantees: How USMP Protects Your Data

Every USMP session provides seven critical security and runtime guarantees:

1. **Identity Verification**: Mutual authentication is achieved using a Pre-Shared Key (PSK). During the handshake, both the client and the gateway prove knowledge of the PSK using HMAC-SHA256 proofs without sending the key over the air.
2. **Ephemeral Confidentiality**: All data is encrypted using AES-256-GCM. An eavesdropper sniffing the network will see only randomized ciphertext.
3. **Data Integrity & Authenticity**: The AES-GCM tag ensures that if any part of the frame is modified in transit, decryption fails instantly and the session drops immediately. Table-driven CRC-16 checks provide early wire-buffer validation before crypto execution.
4. **Perfect Forward Secrecy (PFS)**: An ephemeral X25519 key exchange occurs during the initial handshake. Once the session ends, the temporary keys are discarded. If the master Pre-Shared Key is leaked in the future, past recorded sessions remain completely secure.
5. **Replay and Collision Protection**: Strict sequence tracking prevents attackers from capturing and replaying valid command frames. Stream sessions use monotonic 32-bit sequence numbers, while datagram (UDP) transports enforce a 64-bit sliding anti-replay window. AES-GCM nonces are constructed as `seq (4 bytes, Little-Endian) || session_id[0..7]` to eliminate any risks of nonce collisions.
6. **Zero-Heap Static Memory**: On resource-constrained microcontrollers, USMP can run with zero dynamic allocations (`malloc`/`new`). Handshake crypto utilizes stack or caller-provided scratchpads (`USMP_HANDSHAKE_SCRATCH_LEN = 2048`) that are securely wiped with `mbedtls_platform_zeroize()` upon completion.
7. **Split RTOS Concurrency**: Independent transmit (`tx_mutex`) and receive (`rx_mutex`) mutexes decouple sending from receiving in multi-threaded RTOS environments (FreeRTOS, Zephyr). This eliminates socket deadlocks and prevents nonce reuse across concurrent tasks.

---

## The Handshake Sequence

USMP establishes secure sessions using a 4-message handshake:

```text
Device (Client)                                          Gateway (Server)
       │                                                         │
       │ ─── 1. HELLO (device_id, pub_C) ──────────────────────> │
       │                                                         │
       │ <── 2. CHALLENGE (nonce, pub_S) ─────────────────────── │
       │                                                         │ [Derive Shared Secret X25519]
       │                                                         │ [Derive HKDF Session Keys]
       │ ─── 3. HELLO_ACK (HMAC_client) ───────────────────────> │
       │                                                         │ [Verify Client HMAC]
       │ <── 4. SESSION_OK (session_id, HMAC_server) ─────────── │
       │                                                         │
       ├────────────────── Secure Session Active ────────────────┤
       │                                                         │
       │ ═══ DATA Frame (AES-256-GCM encrypted) ═══════════════> │
```

1. **`HELLO`**: The client initiates by sending its unique Hardware ID alongside its ephemeral X25519 public key (`pub_C`).
2. **`CHALLENGE`**: The gateway responds with a random salt (`nonce`) and its own ephemeral X25519 public key (`pub_S`).
3. **`HELLO_ACK`**: Both endpoints calculate the X25519 shared secret. Using HKDF-SHA256, they derive temporary keys. The client then calculates an HMAC using the Pre-Shared Key (PSK), cryptographically binding `pub_C` and `pub_S` to prove identity and prevent Man-in-the-Middle (MITM) key-swapping.
4. **`SESSION_OK`**: The gateway verifies the client's proof, computes its own binding HMAC, and returns a unique Session ID.

From this point forward, both sides communicate using symmetric AES-256-GCM session keys. The master PSK was never sent over the transport layer!

---

## Next Steps

Now that you understand the concepts, let's install the libraries:

* **[Installation & Setup](installation.md)** — Install the Python, ESP32, or Arduino SDKs.
