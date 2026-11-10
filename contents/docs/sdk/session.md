# Python SDK: Session Reference (`USMPSession`)

Welcome! An instance of `USMPSession` represents a fully established, secure USMP connection.

On the server side, a session object is passed directly into your registered `@server.on_session` callback handler. On the client side, the session logic is wrapped under the hood inside `USMPClient`. This guide explains the properties, interactive methods, and reassembly features of the session object.

## Properties

You can query these properties to identify the connected device and monitor session health:

* **`session.device_id`** *(str)*: The client's unique hardware address, formatted as a hexadecimal string with colons (e.g., `"00:11:22:33:44:55"`).
* **`session.session_id`** *(str)*: A unique session ID generated during the handshake, formatted as a 32-character hex string.
* **`session.is_connected`** *(bool)*: Returns `True` if the session is currently established and active; `False` if closed or torn down.
* **`session.info`** *(SessionInfo)*: Access underlying session metadata (negotiated cipher suite, active sequence counters, transport type).

## Interactive Methods

### `await session.send(data: bytes | str)`

Encrypts and transmits a payload to the device.

* **String & Binary Support**: Accepts raw `bytes` or a `str` (which is automatically encoded as UTF-8).
* **Payload Fragmentation**: If your payload exceeds the single-frame plaintext limit of 452 bytes, `send()` automatically fragments it into multiple chunks. The initial chunks are transmitted as `PKT_DATA_FRAG` frames, followed by a final `PKT_DATA` frame.
* **Size Constraint**: The dynamic fragmenter supports up to 4 frames, giving an absolute maximum payload size of **1808 bytes** (~1.8 KB). Attempting to send a larger payload raises a `PayloadError` exception.

### `await session.recv(timeout: float | None = None) -> bytes`

Blocks until the next decrypted message payload is received and verified.

* **Payload Reassembly**: Transparently accumulates `PKT_DATA_FRAG` frames, decrypts each piece, and joins them back together once the final `PKT_DATA` frame arrives.
* **Control Frame Filtering**: Intercepts `PING` frames and automatically replies with `PONG` frames in the background without waking application code.
* **Timeout**: If a custom `timeout` (in seconds) is specified and no frame arrives, `USMPTimeoutError` is raised.

### `await session.recv_str(timeout: float | None = None, encoding: str = "utf-8", errors: str = "strict") -> str`

Convenience wrapper that awaits `session.recv()` and directly decodes the decrypted payload into a string using the specified encoding.

### `session.print(data: Any, *, tag: str | None = None, stream: Any = None)`

Built-in terminal payload inspector. Formats incoming or outgoing data with ANSI timestamps, device ID badges, and byte counts. Automatically detects UTF-8 strings versus binary data (displaying readable text in quotes or a formatted `hex:<hexbytes>` dump):

```python
# Displays: 18:20:15 [session] [00:11:22:33:44:55] (14 bytes): 'Device Status'
session.print("Device Status")

# Displays: 18:20:15 [session] [00:11:22:33:44:55] [SENSOR] (4 bytes): hex:01020304
session.print(b"\x01\x02\x03\x04", tag="SENSOR")
```

### `await session.ping()`

Pushes an encrypted `PKT_PING` frame to the device. This is useful for checking if a device is still online and resetting the socket watchdog.

### `await session.rekey()`

Performs transparent in-band session key rotation.

* **Key Derivation**: Generates 32 bytes of random entropy (`salt`), sends an encrypted `PKT_REKEY` (`0x0B`) frame, and derives fresh transmit and receive keys using `HKDF-SHA256`.
* **State Reset**: Resets both sequence numbers (`tx_seq = 0`, `rx_seq = 0`) and the 64-bit sliding anti-replay bitmap to `0`.
* **Non-Disruptive**: Rotates keys while keeping the socket established, eliminating the overhead of a full X25519 handshake.

### `await session.bye()`

Sends an encrypted `PKT_BYE` frame to notify the device of a clean shutdown, then closes the TCP connection.

## Complete Session Reader/Writer Example

The standard way to manage a session is to run `session.recv()` inside a structured `while True` loop to process commands and handle timeouts:

```python title="session_handler.py"
from usmp import USMPSession
from usmp.errors import ConnectionClosedError, CryptoError, TimeoutError

async def handle_device_session(session: USMPSession):
    print(f"[START] Monitoring session for device: {session.device_id}")
    
    try:
        while True:
            # Set a 60-second read timeout. If the client goes silent (fails
            # to send telemetry or a PING) for 60 seconds, we close the link.
            data = await session.recv(timeout=60.0)
            
            # Simple command parser
            if data == b"GET_STATUS":
                await session.send(b"STATUS_OK")
            elif data == b"SHUTDOWN":
                print(f"[{session.device_id}] Requested graceful exit.")
                await session.send(b"BYE_ACK")
                await session.bye()
                break
            else:
                print(f"[{session.device_id}] Received data: {data!r}")
                
    except TimeoutError:
        print(f"[TIMEOUT] Device {session.device_id} went offline (no keepalives).")
    except ConnectionClosedError:
        print(f"[CLOSED] Device {session.device_id} disconnected cleanly.")
    except CryptoError as e:
        print(f"[CRYPTO ERROR] Decryption failed for {session.device_id}: {e}")
    finally:
        print(f"[STOP] Session handler terminated for {session.device_id}")
```
