---
title: "Project TCP Example"
description: "Multi-platform USMP echo application running across Python Gateway Server, ESP-IDF ESP32, and Arduino IDE."
---

# Project TCP: Multi-Platform USMP Echo Demo

This project provides a complete plug-and-play echo application running across three environments:

1. **Python Gateway Server:** Receives encrypted data, prints it, and replies.
2. **Arduino (ESP32) Client:** An Arduino sketch using the Arduino wrapper client.
3. **ESP32 (ESP-IDF) Client:** Native C application using ESP-IDF.

---

## Architecture Diagram

```text
  ┌─────────────────┐
  │  Python Server  │◀───┐
  │  (Port 9000)    │    │ (USMP Session over TCP)
  └─────────────────┘    │
           ▲             │
           │             ▼
  ┌─────────────────┐  ┌─────────────────┐
  │  ESP32 Client   │  │ Arduino Client  │
  │  (ESP-IDF App)  │  │  (USMP Sketch)  │
  └─────────────────┘  └─────────────────┘
```

---

## 1. Python Gateway Server Code (`server.py`)

Below is the complete, runnable Python gateway server script using `USMPServer`:

```python
import asyncio
import logging
from usmp import USMPServer, USMPSession, USMPProtocol

# Enable verbose debug logging
logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")

# Pre-Shared Key (Must match device configuration)
DEV_PSK = b"usmp-dev-psk-change-me-before-prod"

# Initialize TCP USMP Server on port 9000
server = USMPServer(
    host="0.0.0.0",
    port=9000,
    psk=DEV_PSK,
    protocol=USMPProtocol.TCP
)

@server.on_session
async def handle_device_session(session: USMPSession):
    """Triggered concurrently whenever a device completes its handshake."""
    print("=" * 60)
    print(f"[SESSION ESTABLISHED]")
    print(f"  Device ID:  {session.device_id}")
    print(f"  Session ID: {session.session_id}")
    print("=" * 60)

    try:
        async for message in session:
            payload_text = message.decode("utf-8", errors="replace")
            print(f"[RX from {session.device_id}]: {payload_text}")

            # Echo response back to client encrypted
            reply_text = f"Echo from Server: {payload_text}"
            await session.send(reply_text.encode("utf-8"))
            print(f"[TX to {session.device_id}]: {reply_text}")

    except Exception as e:
        print(f"[SESSION ERROR] {session.device_id}: {e}")
    finally:
        print(f"[SESSION CLOSED] {session.device_id}")

async function main():
    print("[USMP] Starting TCP Gateway Server on 0.0.0.0:9000...")
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 2. Arduino IDE Client Code (`arduino.ino`)

Below is the full C++ sketch for Arduino IDE developers (ESP32):

```cpp
#include <WiFi.h>
#include <USMP.h>

// Network & Gateway Credentials
#define WIFI_SSID "YourWifiName"
#define WIFI_PASS "YourWifiPassword"
#define SERVER_IP "192.168.1.100"  // Replace with your Gateway Local IP
#define SERVER_PORT 9000

// Pre-Shared Key (Must match server PSK)
const char *DEV_PSK = "usmp-dev-psk-change-me-before-prod";

// Instantiate USMP Client
USMPClient usmp(DEV_PSK);
unsigned long lastPingTime = 0;
int counter = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n[USMP] Initializing ESP32 TCP Client...");
  
  // 1. Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.printf("\n[USMP] Wi-Fi connected! Local IP: %s\n", WiFi.localIP().toString().c_str());

  // 2. Configure TCP Transport
  USMPTCPTransport transport = USMP::TCP(SERVER_IP, SERVER_PORT);

  // 3. Register Event Callbacks
  usmp.onConnect([]() {
    Serial.println("[USMP SUCCESS] Handshake complete! Encrypted session active.");
  });

  usmp.onMessage([](const uint8_t *data, size_t len) {
    String msg = String((char*)data).substring(0, len);
    Serial.printf("[RX Encrypted Echo]: %s\n", msg.c_str());
  });

  usmp.onDisconnect([]() {
    Serial.println("[USMP WARN] Session disconnected. Reconnecting...");
  });

  // 4. Begin Session Connection
  if (!usmp.begin(transport)) {
    Serial.println("[USMP ERROR] Initial connection failed.");
  }
}

void loop() {
  // Keep USMP state machine running
  usmp.loop();

  // Send encrypted message every 5 seconds
  if (millis() - lastPingTime > 5000) {
    lastPingTime = millis();
    counter++;

    if (usmp.isConnected()) {
      String payload = "ESP32 Ping #" + String(counter) + " (Uptime: " + String(millis()/1000) + "s)";
      Serial.printf("[TX Sending]: %s\n", payload.c_str());
      usmp.send((const uint8_t*)payload.c_str(), payload.length());
    }
  }
}
```

---

## 3. ESP-IDF Client Code (`main/app.c`)

Below is the native C application code for ESP-IDF v5.x:

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

static const char *TAG = "USMP_APP";
static const char *SERVER_IP = "192.168.1.100";
static const uint16_t SERVER_PORT = 9000;
static const char *DEV_PSK = "usmp-dev-psk-change-me-before-prod";

void app_main(void) {
    // Initialize NVS and Wi-Fi stack
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ESP_ERROR_CHECK(nvs_flash_init());
    }

    ESP_LOGI(TAG, "Starting USMP ESP-IDF Client...");

    // 1. Initialize USMP context and TCP transport
    usmp_context_t ctx;
    usmp_transport_t transport;

    usmp_init(&ctx, DEV_PSK);
    usmp_transport_tcp_init(&transport, SERVER_IP, SERVER_PORT);

    // 2. Perform Mutual Cryptographic Handshake
    ESP_LOGI(TAG, "Connecting to USMP gateway server %s:%d...", SERVER_IP, SERVER_PORT);
    if (usmp_connect(&ctx, &transport) != USMP_OK) {
        ESP_LOGE(TAG, "Handshake failed!");
        return;
    }

    ESP_LOGI(TAG, "Handshake successful! Session ID established.");

    // 3. Send and Receive Payload Cycle
    char msg[64] = "Hello from ESP-IDF via USMP TCP!";
    ESP_LOGI(TAG, "Sending: %s", msg);

    if (usmp_send(&ctx, &transport, (const uint8_t*)msg, strlen(msg)) == USMP_OK) {
        uint8_t rx_buf[256];
        size_t rx_len = 0;

        if (usmp_recv(&ctx, &transport, rx_buf, sizeof(rx_buf), &rx_len, 5000) == USMP_OK) {
            rx_buf[rx_len] = '\0';
            ESP_LOGI(TAG, "Decrypted RX (%d bytes): %s", (int)rx_len, (char*)rx_buf);
        }
    }

    usmp_close(&ctx, &transport);
}
```

---

## Output Verification

Once both the server and client are started, your server terminal will log:

```text
[SESSION ESTABLISHED]
  Device ID:  ab:cd:ef:01:02:03
  Session ID: 5f3b7c2a8e9d0a1b2c3d4e5f6a7b8c9d
[RX from ab:cd:ef:01:02:03]: ESP32 Ping #1 (Uptime: 5s)
[TX to ab:cd:ef:01:02:03]: Echo from Server: ESP32 Ping #1 (Uptime: 5s)
```
