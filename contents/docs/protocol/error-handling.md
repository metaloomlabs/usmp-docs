# Error Handling: Our Safety Seatbelts

USMP operates on a very simple, security-first philosophy: **fail fast**.

In some network protocols, if something goes wrong, the systems will try to negotiate, recover, or patch things up on the fly. In a security protocol, **this is extremely dangerous.** If there is a crack in a secure tunnel, we don't try to repair it while it's active. Instead, we immediately shred the session keys, close the connection, and build a brand-new tunnel from scratch.

Think of our error handling rules as safety seatbelts: if they detect any abnormal movement, they lock down instantly to protect your device and your data.

> [!NOTE]
> **Reserved Status of `PKT_ERROR`**
> The `PKT_ERROR` packet type (`0xFF`) and associated binary error codes are currently **reserved** in the protocol specification for future diagnostic telemetry. In the current reference implementation, both client and server immediately close the underlying transport connection without transmitting error frames. This prevents information leakage and timing attacks that could help an attacker map our service.

## The `PKT_ERROR` Frame (0xFF) [Reserved]

When supported in future versions, if one side detects a protocol violation or cryptographic failure, it will attempt to tell the other side *why* it is disconnecting by sending a `PKT_ERROR` packet before closing the socket.

#### Payload Layout (3 bytes)

* **Byte `0` (1 byte)**: `code` — The error code integer.
* **Bytes `1..2` (2 bytes)**: `detail` — Optional supplementary details (u16 little-endian, such as the sequence number that caused a mismatch).

### Standardized Error Codes (Reserved)

| Code | Name | What it means |
|:---|:---|:---|
| `0x01` | `ERR_VERSION` | "You are speaking a protocol version I don't support." |
| `0x02` | `ERR_AUTH` | "The Pre-Shared Key (PSK) signature we exchanged didn't match." |
| `0x03` | `ERR_SEQ` | "A packet arrived out of order! Possible replay attack." |
| `0x04` | `ERR_CRYPTO` | "Decryption failed or the AES-GCM seal was tampered with." |
| `0x05` | `ERR_BAD_FRAME` | "The binary packet structure is invalid or too large." |
| `0x06` | `ERR_TIMEOUT` | "I waited too long for a handshake or keepalive reply." |
| `0x07` | `ERR_INTERNAL` | "An unexpected internal memory or crypto engine error occurred." |

## Safety Rules: How We Handle Violations

Here is exactly how the client and server react to various protocol violations:

| Scenario | State Machine Action | Rationale |
|:---|:---|:---|
| **Bad Magic Bytes** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | If a client sends bad magic bytes, it's either a random port scanner or a corrupted stream. Sending an error frame back could help an attacker map our service. |
| **CRC Check Mismatch** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Protects against line noise or packet tampering. |
| **Wrong Protocol Version** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Protects against version mismatch or scan attempts. |
| **HMAC Signatures Mismatch** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Indicates incorrect PSK or a brute-force authentication attempt. |
| **Sequence Number Mismatch** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Protects against replayed messages. |
| **AES-GCM Decryption Fails** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Indicates key mismatch, corrupted data, or active tampering. |
| **Timeout (No keepalives)** | Close connection instantly without sending `PKT_ERROR`. | Clean up dead connections to free device resources. |
| **Control Packet during Fragmentation** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Interleaving standard packets while reassembling a fragmented payload is a protocol violation. |
| **Max Fragments Exceeded** | Discard frame. Close connection instantly without sending `PKT_ERROR`. | Plaintext payloads are capped at 452 bytes per frame, up to a maximum of 4 frames. |

## Programmatic Status Codes (`usmp_err_t` & `USMPErrorCode`)

USMP operations return strongly typed status codes across the C core, Arduino port, and Python SDK:

| Value | C Enum (`usmp_err_t`) | Python Enum (`USMPErrorCode`) | Description |
| :--- | :--- | :--- | :--- |
| `0` | `USMP_OK` | `OK` | Success. |
| `-1` | `USMP_ERR_INVALID_ARG` | `INVALID_ARG` | NULL argument, buffer too small, or bad parameter. |
| `-2` | `USMP_ERR_TRANSPORT_FAILED` | `TRANSPORT_FAILED` | Socket or underlying interface write/read failure. |
| `-3` | `USMP_ERR_AUTH_FAILED` | `AUTH_FAILED` | PSK HMAC verification mismatch. |
| `-4` | `USMP_ERR_TIMEOUT` | `TIMEOUT` | Inactivity watchdog or handshake timer expired. |
| `-5` | `USMP_ERR_REPLAY_DETECTED` | `REPLAY_DETECTED` | Replayed sequence number detected by sliding window. |
| `-6` | `USMP_ERR_BUFFER_OVERFLOW` | `BUFFER_OVERFLOW` | Declared payload length exceeds buffer allocation. |
| `-7` | `USMP_ERR_SEQ_EXHAUSTED` | `SEQ_EXHAUSTED` | 32-bit sequence counter reached `0xFFFFFFFF`. |
| `-8` | `USMP_ERR_CRYPTO_FAILED` | `CRYPTO_FAILED` | AEAD decryption or authentication tag mismatch. |
| `-9` | `USMP_ERR_NOT_CONNECTED` | `NOT_CONNECTED` | Operation attempted before session was established. |
| `-10` | `USMP_ERR_MUTEX_FAILED` | `MUTEX_FAILED` | FreeRTOS / platform mutex lock or unlock failed. |
| `-11` | `USMP_ERR_PEER_CLOSED` | `PEER_CLOSED` | Peer sent an authenticated `PKT_BYE` for graceful exit. |

---

## Developer Implementation

### C Client Library (ESP-IDF & Core)

On microcontrollers, functions return `usmp_err_t` status codes directly. Translate any code to a human-readable string with `usmp_strerror()`:

```c
usmp_err_t err = usmp_send(&ctx, data, len);
if (err != USMP_OK) {
    ESP_LOGE(TAG, "Transmission failed: %s (code %d)", usmp_strerror(err), err);
    if (err == USMP_ERR_PEER_CLOSED) {
        ESP_LOGI(TAG, "Server shut down gracefully.");
    }
}
```

### Arduino Port

`USMPClient` automatically captures status codes and provides helper getters:

```cpp
if (!usmp.begin(transport)) {
    Serial.printf("Connection failed: %s (error %d)\n",
                  usmp.lastErrorString(), usmp.lastError());
}
```

### Python SDK Exceptions

The Python SDK maps errors into rich exception classes, each providing a `.code: USMPErrorCode` attribute:

```python
from usmp import USMPSession
from usmp.errors import ConnectionClosedError, CryptoError, USMPTimeoutError, USMPError

async def handle_telemetry(session: USMPSession):
    try:
        while True:
            data = await session.recv()
            session.print(data)
    except ConnectionClosedError:
        print(f"Device {session.device_id} disconnected cleanly (sent BYE).")
    except CryptoError as e:
        print(f"Decryption failed ({e.code}): Key mismatch or tampering.")
    except USMPTimeoutError:
        print(f"Session timed out waiting for device heartbeat.")
    except USMPError as e:
        print(f"USMP error ({e.code}): {e}")
```

Here are the exception classes you can catch:

* `USMPError` — Base exception for all USMP errors. Carries `.code: USMPErrorCode`.
* `FrameError` — Malformed binary structure (`ERR_BAD_FRAME`).
* `CRCError` — CRC check failed.
* `MagicError` — Magic bytes (`0xABCD`) mismatch.
* `VersionError` — Unsupported version (`ERR_VERSION`).
* `HandshakeError` — Key negotiation failed.
* `AuthError` — PSK verification failed (`ERR_AUTH`).
* `CryptoError` — Decryption or GCM authentication tag failed (`ERR_CRYPTO`).
* `SequenceError` — Replay protection triggered or sequence overflow (`ERR_SEQ`).
* `USMPTimeoutError` — Keepalive watchdog timer expired (`TimeoutError` alias provided for backward compatibility).
* `ConnectionClosedError` — Remote peer closed or sent `PKT_BYE` (`USMPErrorCode.PEER_CLOSED`).
