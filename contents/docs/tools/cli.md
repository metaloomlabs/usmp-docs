# CLI Tools & Development Server

USMP provides command-line tooling to simplify testing, rapid prototyping, and device simulation without writing server code.

---

## 1. Built-in Development & Echo Server (`usmp.server`)

Included directly in the `usmp` Python SDK, `usmp.server` (invoked via `python -m usmp.server` or `usmp-server`) provides an instant gateway server with ANSI colored logs, interactive startup banners, and terminal payload inspection.

### Quick Start

```bash
# 1. Generate a cryptographically random 32-byte (256-bit) Pre-Shared Key (PSK):
python -m usmp.server --generate-psk

# 2. Launch an instant auto-echo server on TCP port 9000:
python -m usmp.server --echo --port 9000 --psk "usmp-dev-psk-change-me-before-prod"

# 3. Or launch over connectionless UDP using a hexadecimal PSK:
python -m usmp.server --protocol udp --echo --port 9000 --psk hex:2a8d56b3e410ff02ad84620ea1901a88b50df3651c4a0910bc4f794d21e8e4bc
```

### Command-Line Options

| Flag | Shorthand | Default | Description |
| :--- | :--- | :--- | :--- |
| `--port` | `-p` | `9000` | Port to listen on. |
| `--host`, `--bind` | `-b` | `0.0.0.0` | Network interface to bind to. |
| `--psk` | `-k` | `""` | Pre-Shared Key (plain string, `raw:<string>`, or `hex:<hexbytes>`). Minimum 16 bytes. |
| `--protocol` | | `tcp` | Transport protocol (`tcp` or `udp`). |
| `--echo` | `-e` | `false` | Automatically echo received application payloads back to the sender. |
| `--log-level` | `-l` | `INFO` | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `--generate-psk` | | | Generate a random 32-byte hex/Python PSK and exit immediately. |

### PSK Format Flexibility

The `--psk` argument automatically recognizes three input formats:

* **Plain text string**: `--psk "my-secret-key-16b"` (encoded as UTF-8 bytes).
* **Explicit raw string**: `--psk raw:my-raw-string`
* **Hex-encoded bytes**: `--psk hex:a1b2c3d4...` or any raw 64-character hex string.

### Terminal Output Preview

When launched, the server outputs an ANSI banner and logs incoming sessions and decrypted payloads:

```text
╔══════════════════════════════════════════════════════════╗
║                 USMP Development Server                  ║
╠══════════════════════════════════════════════════════════╣
║  • Protocol:   TCP                                       ║
║  • Address:    0.0.0.0:9000                              ║
║  • Mode:       Echo Server (replies to all data)         ║
║  • PSK:        configured (32 bytes)                     ║
╚══════════════════════════════════════════════════════════╝
Listening for incoming device connections... (Ctrl+C to stop)

18:15:22 [server] INFO Device connected: 24:0a:c4:00:11:22 (session 8f192b...)
18:15:23 [session] [24:0a:c4:00:11:22] (18 bytes): 'Sensor: 24.5C OK'
18:15:23 [server] INFO [24:0a:c4:00:11:22] Echoed (18 bytes)
```

---

## 2. Interactive Device Manager (`usmp` CLI)

> [!NOTE]
> The interactive LAN manager tool (`usmp scan`, `usmp connect`) is under active development.

The standalone `usmp` CLI tool lets you interact with USMP devices on your local network directly from the terminal — like SSH for IoT hardware:

```bash
# Scan LAN for USMP devices
usmp scan

# Connect to a device (interactive shell)
usmp connect aa:bb:cc:dd:ee:ff

# Stream logs from a device
usmp logs aa:bb:cc:dd:ee:ff

# Send a one-shot command
usmp send aa:bb:cc:dd:ee:ff "reboot"

# Monitor all devices
usmp monitor
```

### Planned Output

```bash
$ usmp scan
Scanning LAN for USMP devices...
  aa:bb:cc:dd:ee:ff  192.168.1.60  ESP32  USMP v1.3  online
  aa:bb:cc:dd:ee:00  192.168.1.61  ESP32  USMP v1.3  online

$ usmp connect aa:bb:cc:dd:ee:ff
Connecting to aa:bb:cc:dd:ee:ff (192.168.1.60)...
[USMP] Handshake complete — session a3f1b2c4
> get_sensor
temperature: 23.4C
> exit
```

### Installation (when available)

```bash
pip install usmp-cli
```
