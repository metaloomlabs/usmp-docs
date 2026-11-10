# Installation & Environment Setup

This tutorial guides you through installing the USMP development libraries and generating the Pre-Shared Keys (PSK) required to secure your devices.

USMP has two primary components:

1. **Pure C Core**: Compiled on the microcontrollers (available via the ESP Component Registry and a pre-packaged Arduino ZIP).
2. **Python asyncio SDK**: Runs on your gateway or server (available via PyPI).

---

## 1. Install the Python asyncio SDK (Gateway / Server)

The Python SDK manages the server gateways, registers connected devices, and performs the heavy lifting for decryption and key management. It requires **Python 3.11 or later**.

=== "Using pip"
    ```bash
    pip install usmp
    ```

=== "Using uv (Recommended)"
    ```bash
    uv add usmp
    ```

To verify the installation succeeded:

```bash
python -c "import usmp; print(usmp.__version__)"
```

---

## 2. Install the ESP32 Component (ESP-IDF)

For native C development on Espressif chips using ESP-IDF (v5.0 or later), USMP is published directly in the Espressif Component Registry.

Open your ESP-IDF project terminal and run:

```bash
idf.py add-dependency "metaloomlabs/usmp"
```

This will automatically download and append USMP to your project's `main/idf_component.yml` dependency declaration. When you next run `idf.py build`, the compiler will automatically fetch and compile the component.

---

## 3. Install the Arduino Library (ESP32 Cores)

For Arduino C++ development, you can install USMP directly via the official Arduino Library Manager (recommended) or import the offline ZIP archive.

### Option A: Via Arduino Library Manager (Recommended)

1. Open the **Arduino IDE** (v1.8.x or v2.x).
2. Open the Library Manager: go to **Tools** ➔ **Manage Libraries...** (or click the Library Manager icon on the left sidebar in Arduino IDE 2.x).
3. In the search bar, type `USMP`.
4. Locate the **USMP** library by MetaLoom Labs and click **Install** (select version `1.3.0`).

Alternatively, install via the **Arduino CLI**:

```bash
arduino-cli lib install "USMP"
```

### Option B: Via Offline ZIP Archive

1. Download the pre-built ZIP package: `usmp-1.3.0-arduino.zip` (available on the [Downloads Portal](/downloads)).
2. In Arduino IDE, go to **Sketch** ➔ **Include Library** ➔ **Add .ZIP Library...**
3. Navigate to and select the `usmp-1.3.0-arduino.zip` file.
4. Click **Open** to import the library.

To verify installation in your sketch:

```cpp
#include <USMP.h>
```

---

## 4. Generate a Secure Pre-Shared Key (PSK)

USMP requires both the client device and the server to share a Pre-Shared Key (PSK) to establish the initial handshake trust.

> [!WARNING]
> **Never use generic or weak keys (such as `123456` or `my-psk`) in production.**
> Use cryptographically strong random bytes.

### Option A: Using the USMP Built-in CLI (Recommended)

```bash
python -m usmp.server --generate-psk
```

This outputs both the raw hex string and formatted Python literal:

```text
Generated random 32-byte (256-bit) Pre-Shared Key (PSK):
  Hex:    2a8d56b3e410ff02ad84620ea1901a88b50df3651c4a0910bc4f794d21e8e4bc
  Python: b'*\x8dV\xb3\xe4\x10\xff\x02\xad\x84b\x0e\xa1\x90\x1a\x88\xb5\r\xf3e\x1cJa\t\x10\xb4OyM!\xe8\xe4\xbc'
```

### Option B: Using Python's Secrets Module

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

This will output a 64-character hexadecimal string, for example:
`2a8d56b3e410ff02ad84620ea1901a88b50df3651c4a0910bc4f794d21e8e4bc`

Keep this key secure. You will pass it to both your gateway server and your microcontrollers in the next tutorials.

---

## Next Steps

Now that your tools are installed and you have a secure PSK, proceed to build your first connection:

* **[Tutorial 1: Your First TCP Tunnel](tutorial-tcp.md)** — Connect your ESP32 or Arduino to a Python server using TCP sockets.
* **[Tutorial 2: Going Connectionless (UDP)](tutorial-udp.md)** — Learn how to set up and run USMP over UDP.
