# Sequence Numbers: Keeping Things in Order

In any secure protocol, it's not enough to encrypt the data. You also have to make sure an attacker cannot record a valid packet and replay it later to trick your device. This is called a **replay attack**.

USMP uses **monotonic sequence numbers** to defend against replay attacks. Think of them as a numbering system on pages of a book: if a page is missing, duplicated, or out of order, you notice it immediately!

## How Sequence Numbers Work

Both the client and the server maintain two independent 32-bit counters:

* **TX Sequence Counter**: Increments by 1 every time a packet is sent.
* **RX Sequence Counter**: Tracks the expected sequence number of the next incoming packet.

When a session starts, both counters are set to `0`. As data begins to flow, the sequence numbers increment independently in each direction:

```text
Client (TX: 0, RX: 0)  ====== DATA (seq=0) =====>  Server (TX: 0, RX: 1)
Client (TX: 1, RX: 0)  <===== DATA (seq=0) ======  Server (TX: 1, RX: 1)
Client (TX: 1, RX: 1)  ====== DATA (seq=1) =====>  Server (TX: 1, RX: 2)
Client (TX: 2, RX: 1)  <===== DATA (seq=1) ======  Server (TX: 2, RX: 2)
```

## Transport Ordering Modes

USMP adapts sequence number verification to match the characteristics of the underlying transport layer:

### 1. Stream Transports (TCP & UART): Strict Monotonic Equality

Over reliable stream transports (TCP sockets and UART with COBS), the physical layer guarantees in-order delivery. Therefore, **any out-of-order sequence number is a critical error**:

* If a frame arrives with `seq = 5` when the receiver is expecting `seq = 4`, it indicates a replay attack, a corrupted socket stream, or a fatal counter bug.
* Rather than trying to guess or patch up the stream, USMP immediately tears down the session keys and resets the connection.

### 2. Connectionless Transports (UDP): 64-Bit Sliding Anti-Replay Window

Over UDP, network routing can cause valid datagrams to be delayed or arrive slightly out-of-order. USMP uses an efficient **64-bit sliding replay window**:

* The receiver maintains the highest authenticated sequence number (`rx_seq`) and a 64-bit bitmask (`rx_window_bitmap`).
* **Frame Acceptance Rules**:
  * **Ahead of window (`seq > rx_seq`)**: Accept the packet, slide the bitmap window forward by `seq - rx_seq`, and set bit 0.
  * **Inside window (`rx_seq - 63 <= seq <= rx_seq`)**: Check bit `rx_seq - seq`. If unset, mark as received and accept. If already set, drop silently as a duplicate.
  * **Behind window (`seq < rx_seq - 63`)**: Packet is too old; drop silently.
* **Integrity Guard**: The replay bitmap is updated **only after** successful AEAD authentication, preventing unauthenticated packets from shifting the window.

---

## CoAP RTT Estimation & UDP ARQ Retransmissions

In USMP v1.3.0, UDP transport reliability implements RFC 7252 (CoAP) / Jacobson-Karn smoothed round-trip time tracking:

* **Smoothed RTT ($\text{SRTT}$) & Variation ($\text{RTTVAR}$)**: Dynamically calculated using first-attempt frame acknowledgments.
* **Dynamic Timeout ($\text{RTO}$)**: Clamped between **100 ms** and **5000 ms** with binary exponential backoff on packet loss.
* **Watchdog Protection**: In-flight ARQ wait loops service `usmp_port_wdt_feed()` regularly to protect against MCU watchdog timer resets during poor link conditions.

## Cryptographic Binding

To prevent header manipulation, USMP tightly integrates the sequence number into the cryptographic layer:

1. **Nonce Construction**: The sequence number forms the first 4 bytes of the AES-GCM nonce: `seq (4 bytes, LE) || session_id[0..7]`. Because the sequence increments by 1 per frame, the nonce is guaranteed to be unique for every frame.
2. **Header Authentication (AAD)**: The sequence number is fed into the AES-GCM engine as Additional Authenticated Data. If an attacker tries to change the sequence number of a packet in transit, the GCM tag verification will fail, and the receiver will reject it.

## Handshakes and Overflow Protection

### Handshake Sequence

During the 4-step handshake (`PKT_HELLO` through `PKT_SESSION_OK`), the sequence number in the header is always set to `0`. Once the handshake is complete and the session becomes active, the data sequence counter starts fresh at `0`.

### Overflow Protection

What happens if the sequence counter wraps around after hitting its maximum value? The sequence number is a 32-bit unsigned integer, meaning it wraps at $2^{32} - 1$ (4,294,967,295 frames).

If your device sends one frame every second, it would take **136 years** to overflow! In practice, your session will be closed or re-keyed long before this limit is reached. However, as a safeguard, if the sequence number ever reaches `0xFFFFFFFF`, the session is terminated and a new handshake is forced.
