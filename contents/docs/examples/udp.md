---
title: "Project UDP Example"
description: "USMP over reliable UDP transport layer with Python UDP Server, ESP32 ESP-IDF client, and Arduino client."
---

# USMP UDP Example Project

This example demonstrates how to establish a secure session using USMP over a reliable UDP transport layer, featuring:
* **Python UDP Server**: Listens on UDP port 9000, manages multiple clients via `(IP, Port)` address demultiplexing.
* **ESP32 Client (ESP-IDF)**: Connects to server via UDP transport and sends secure telemetry.
* **Arduino Client**: Connects via UDP transport and sends secure messages.

---

## 1. Running the Python Server

Ensure you have the Python SDK installed:

```bash
pip install usmp
```

Start the UDP server:

```bash
python server.py
```

---

## 2. ESP32 Client Setup (ESP-IDF)

Ensure the server IP address is configured in `main/app.c` (defaults to `192.168.1.100`), and configure your Wi-Fi SSID and password in `main/wifi.c`.

To build and flash the ESP32 project:

```bash
idf.py build
idf.py -p <PORT> flash monitor
```

---

## 3. Arduino Client Setup

Open your Arduino sketch in the Arduino IDE. Replace the network config placeholders with your Wi-Fi credentials:

```cpp
#define WIFI_SSID "YourSSID"
#define WIFI_PASS "YourPassword"
#define SERVER_IP "192.168.1.100"
```

Upload it to your ESP32 board and check the Serial Monitor for session handshake completion.
