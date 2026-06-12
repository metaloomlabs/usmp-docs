# Protocol Simulator & Telemetry

USMP features a live Protocol Analyzer and Handshake Simulator to inspect frame layouts, monitor sequence numbers, and view binary hex payloads in real-time.

This page provides an interactive environment to simulate a microcontroller device establishing a secure connection with a gateway server, completing the mutual handshake, and transmitting encrypted sensor frames.

## Simulator Features

### 1. Secure Link Visualization
The simulator shows the connection status between the client device (e.g. ESP32, Arduino) and the gateway server (Python). As the handshake executes, the link path transitions from **Establishing** (Key Exchange) to **Secured** (Active Session).

### 2. Live Transaction Logs
The transaction logger captures every frame passing over the link. You can toggle between two modes:
- **Decoded Mode:** Displays human-readable message logs, including packet type names, frame fields, and descriptive metadata.
- **Raw Hex Mode:** Displays the raw binary byte stream (in hexadecimal formatting) exactly as it travels over the wire.

### 3. Metrics & Counters
- **TX_FRAMES:** Number of data frames transmitted from the client to the gateway.
- **RX_FRAMES:** Number of control or acknowledgement frames received by the client.
- **Transport Interface:** Choose between TCP/IP Socket, UDP Socket, or UART Serial interfaces to see how transport settings affect initializations.

---

## Interactive Protocol Simulator

The live protocol analyzer simulation is running below. Click **Restart Handshake** to witness the complete X25519 key exchange, HMAC mutual verification, and encrypted payload transactions.
