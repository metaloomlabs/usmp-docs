---
title: "Testing USMP on AWS EC2"
description: "Comprehensive deployment guide to setup a public USMP gateway server on AWS EC2 and connect ESP32 microcontrollers over the public Internet."
---

# Testing USMP on AWS EC2

This guide walks you through setting up a public test server on an **AWS EC2** instance and connecting a local **ESP32** microcontroller (using either the **Arduino IDE** or native **ESP-IDF** framework) to establish a secure, end-to-end encrypted USMP session over the Internet.

```text
┌──────────────────────┐             Public Internet             ┌──────────────────┐
│ ESP32 Client         │ ──────────────────────────────────────> │  AWS EC2 Server  │
│ (Arduino or ESP-IDF) │    TCP Port 9000 (AES-GCM-256 Secure)   │ (Python Gateway) │
└──────────────────────┘                                         └──────────────────┘
```

---

## 1. AWS EC2 Server Code (`server.py`)

Save the following Python script as `server.py` on your Ubuntu EC2 instance:

```python
import asyncio
import logging
from usmp import USMPServer, USMPSession, USMPProtocol

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] %(message)s")

DEV_PSK = b"usmp-dev-psk-change-me-before-prod"

server = USMPServer(
    host="0.0.0.0",
    port=9000,
    psk=DEV_PSK,
    protocol=USMPProtocol.TCP
)

@server.on_session
async def handle_ec2_client(session: USMPSession):
    print("=" * 60)
    print("                USMP SECURE SERVER (EC2)")
    print("=" * 60)
    print(f"[SESSION ESTABLISHED]")
    print(f"  Device ID:  {session.device_id}")
    print(f"  Session ID: {session.session_id}")
    print("=" * 60)

    try:
        async for data in session:
            text = data.decode("utf-8", errors="replace")
            print(f"[RX from {session.device_id}]: {text}")

            reply = f"Echo from EC2: {text}"
            await session.send(reply.encode("utf-8"))
            print(f"[TX to {session.device_id}]: {reply}")

    except Exception as err:
        print(f"[SESSION EXCEPTION] {session.device_id}: {err}")

async function main():
    print("============================================================")
    print("                USMP SECURE SERVER (EC2)")
    print("============================================================")
    print("Listening on: 0.0.0.0:9000")
    print("Protocol:     TCP")
    print("============================================================")
    print("Starting server... Press Ctrl+C to stop.\n")
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 2. Arduino IDE Client Code (`arduino.ino`)

Below is the Arduino IDE sketch configured for connecting across the public Internet to your EC2 instance:

```cpp
#include <WiFi.h>
#include <USMP.h>

// Enter your AWS EC2 Public IP and Wi-Fi Details
#define EC2_PUBLIC_IP "13.62.222.96"  // Replace with your EC2 Public IPv4
#define EC2_PORT 9000
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"

const char *DEV_PSK = "usmp-dev-psk-change-me-before-prod";

USMPClient usmp(DEV_PSK);
unsigned long lastPing = 0;
int pingCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("   ESP32 USMP EC2 Public Cloud Client");
  Serial.println("==========================================");

  Serial.printf("Connecting to Wi-Fi: %s\n", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\nWi-Fi Connected! IP: %s\n", WiFi.localIP().toString().c_str());

  Serial.printf("Connecting to USMP EC2 Server: %s:%d\n", EC2_PUBLIC_IP, EC2_PORT);
  USMPTCPTransport transport = USMP::TCP(EC2_PUBLIC_IP, EC2_PORT);

  usmp.onConnect([]() {
    Serial.println("\n[SUCCESS] Secure USMP session established with AWS EC2!");
  });

  usmp.onMessage([](const uint8_t *data, size_t len) {
    String msg = String((char*)data).substring(0, len);
    Serial.printf("Received from EC2: %s\n", msg.c_str());
  });

  if (!usmp.begin(transport)) {
    Serial.println("[ERROR] Failed to connect to AWS EC2.");
  }
}

void loop() {
  usmp.loop();

  if (millis() - lastPing > 5000) {
    lastPing = millis();
    pingCount++;

    if (usmp.isConnected()) {
      String msg = "ESP32 Ping #" + String(pingCount) + " (Uptime: " + String(millis()/1000) + "s)";
      Serial.printf("Sending: %s\n", msg.c_str());
      usmp.send((const uint8_t*)msg.c_str(), msg.length());
    }
  }
}
```

---

## 3. ESP-IDF Native Client Code (`main/app.c`)

Below is the ESP-IDF client source file `main/app.c`:

```c
#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "nvs_flash.h"

#include "usmp.h"
#include "usmp_transport_tcp.h"

static const char *TAG = "EC2_CLIENT";
#define EC2_PUBLIC_IP "13.62.222.96"  // Replace with your EC2 Public IPv4
#define EC2_PORT 9000
#define DEV_PSK "usmp-dev-psk-change-me-before-prod"

void app_main(void) {
    ESP_ERROR_CHECK(nvs_flash_init());

    ESP_LOGI(TAG, "Starting EC2 Client application...");

    usmp_context_t ctx;
    usmp_transport_t transport;

    usmp_init(&ctx, DEV_PSK);
    usmp_transport_tcp_init(&transport, EC2_PUBLIC_IP, EC2_PORT);

    ESP_LOGI(TAG, "Connecting to EC2 server %s:%d...", EC2_PUBLIC_IP, EC2_PORT);
    if (usmp_connect(&ctx, &transport) != USMP_OK) {
        ESP_LOGE(TAG, "Failed to connect to EC2!");
        return;
    }

    ESP_LOGI(TAG, "[SUCCESS] Secure USMP session established with EC2!");

    char ping_msg[64] = "Hello EC2, this is ESP32 via USMP!";
    if (usmp_send(&ctx, &transport, (const uint8_t*)ping_msg, strlen(ping_msg)) == USMP_OK) {
        uint8_t rx_buf[256];
        size_t rx_len = 0;

        if (usmp_recv(&ctx, &transport, rx_buf, sizeof(rx_buf), &rx_len, 5000) == USMP_OK) {
            rx_buf[rx_len] = '\0';
            ESP_LOGI(TAG, "Received from EC2: %s", (char*)rx_buf);
        }
    }

    usmp_close(&ctx, &transport);
}
```

---

## Deployment & Execution Steps

### 1. Configure Inbound Rules on AWS EC2
In the AWS EC2 Console, open your Security Group inbound rules and add a rule allowing **Custom TCP**, Port **9000**, Source `0.0.0.0/0`.

### 2. Run the EC2 Server
```bash
pip install usmp
python3 server.py
```

### 3. Flash and Monitor Microcontroller
Upload `arduino.ino` in Arduino IDE or flash `app.c` in ESP-IDF:
```bash
idf.py -p COMx flash monitor
```

### 4. Verify Output Logs
Upon boot, your ESP32 serial monitor will display:
```text
Connecting to USMP EC2 Server: 13.62.222.96:9000
[SUCCESS] Secure USMP session established!
Sending: ESP32 Ping #1 (Uptime: 5s)
Received from EC2: Echo from EC2: ESP32 Ping #1 (Uptime: 5s)
```
