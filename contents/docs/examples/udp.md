---
title: "Project UDP Example"
description: "USMP over reliable UDP transport layer with Python UDP Server, ESP32 ESP-IDF client, and Arduino client."
---

# USMP UDP Example Project

This example demonstrates how to establish a secure session using USMP over a reliable UDP transport layer with built-in sliding-window acknowledgments and packet-level demultiplexing.

---

## 1. Python UDP Server Code (`server.py`)

Below is the complete, runnable Python UDP server using `USMPServer(..., protocol=USMPProtocol.UDP)`:

```python
import asyncio
import logging
from usmp import USMPServer, USMPSession, USMPProtocol

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

DEV_PSK = b"usmp-dev-psk-change-me-before-prod"

# Initialize UDP USMP Server on port 9000
server = USMPServer(
    host="0.0.0.0",
    port=9000,
    psk=DEV_PSK,
    protocol=USMPProtocol.UDP
)

@server.on_session
async def handle_udp_session(session: USMPSession):
    print("=" * 60)
    print(f"[UDP SESSION ESTABLISHED]")
    print(f"  Device ID:  {session.device_id}")
    print(f"  Session ID: {session.session_id}")
    print("=" * 60)

    try:
        async for message in session:
            text = message.decode("utf-8", errors="replace")
            print(f"[UDP RX from {session.device_id}]: {text}")

            # Send encrypted UDP acknowledgment/reply
            reply = f"UDP Echo ACK: {text}"
            await session.send(reply.encode("utf-8"))
            print(f"[UDP TX to {session.device_id}]: {reply}")

    except Exception as e:
        print(f"[UDP SESSION ERROR] {session.device_id}: {e}")

async function main():
    print("[USMP] Starting UDP Gateway Server on 0.0.0.0:9000...")
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 2. Arduino UDP Client Code (`arduino.ino`)

Below is the complete Arduino sketch for ESP32 UDP client:

```cpp
#include <WiFi.h>
#include <USMP.h>

#define WIFI_SSID "YourWifiName"
#define WIFI_PASS "YourWifiPassword"
#define SERVER_IP "192.168.1.100"
#define SERVER_PORT 9000

const char *DEV_PSK = "usmp-dev-psk-change-me-before-prod";

USMPClient usmp(DEV_PSK);
unsigned long lastSend = 0;
int count = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n[USMP] Initializing ESP32 UDP Client...");

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[USMP] Wi-Fi connected! Local IP: %s\n", WiFi.localIP().toString().c_str());

  // 1. Configure UDP Transport
  USMPUDPTransport transport = USMP::UDP(SERVER_IP, SERVER_PORT);

  // 2. Set Callbacks
  usmp.onConnect([]() {
    Serial.println("[USMP SUCCESS] UDP Encrypted Session Established!");
  });

  usmp.onMessage([](const uint8_t *data, size_t len) {
    String msg = String((char*)data).substring(0, len);
    Serial.printf("[UDP RX Reply]: %s\n", msg.c_str());
  });

  // 3. Connect via UDP
  if (!usmp.begin(transport)) {
    Serial.println("[USMP ERROR] UDP Connect failed.");
  }
}

void loop() {
  usmp.loop();

  if (millis() - lastSend > 4000) {
    lastSend = millis();
    count++;

    if (usmp.isConnected()) {
      String msg = "UDP Telemetry Packet #" + String(count);
      Serial.printf("[UDP TX Sending]: %s\n", msg.c_str());
      usmp.send((const uint8_t*)msg.c_str(), msg.length());
    }
  }
}
```

---

## 3. ESP-IDF UDP Client Code (`main/app.c`)

Below is the native C application code for ESP-IDF UDP transport:

```c
#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "nvs_flash.h"

#include "usmp.h"
#include "usmp_transport_udp.h"

static const char *TAG = "USMP_UDP_APP";
static const char *SERVER_IP = "192.168.1.100";
static const uint16_t SERVER_PORT = 9000;
static const char *DEV_PSK = "usmp-dev-psk-change-me-before-prod";

void app_main(void) {
    ESP_ERROR_CHECK(nvs_flash_init());

    ESP_LOGI(TAG, "Starting USMP UDP Client...");

    usmp_context_t ctx;
    usmp_transport_t transport;

    usmp_init(&ctx, DEV_PSK);
    usmp_transport_udp_init(&transport, SERVER_IP, SERVER_PORT);

    ESP_LOGI(TAG, "Connecting UDP session to %s:%d...", SERVER_IP, SERVER_PORT);
    if (usmp_connect(&ctx, &transport) != USMP_OK) {
        ESP_LOGE(TAG, "UDP Handshake failed!");
        return;
    }

    ESP_LOGI(TAG, "UDP Session Connected!");

    char payload[64] = "Hello Server from ESP32 UDP!";
    if (usmp_send(&ctx, &transport, (const uint8_t*)payload, strlen(payload)) == USMP_OK) {
        uint8_t rx_buf[256];
        size_t rx_len = 0;

        if (usmp_recv(&ctx, &transport, rx_buf, sizeof(rx_buf), &rx_len, 3000) == USMP_OK) {
            rx_buf[rx_len] = '\0';
            ESP_LOGI(TAG, "Decrypted UDP RX: %s", (char*)rx_buf);
        }
    }

    usmp_close(&ctx, &transport);
}
```
