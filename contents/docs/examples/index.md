---
title: "USMP Examples Overview"
description: "Explore plug-and-play USMP codebases showcasing end-to-end encrypted sessions between IoT devices (ESP32, Arduino) and servers."
---

# USMP Code Examples & Demos

Welcome to the USMP examples collection. These fully functional, open-source codebases show how to implement end-to-end encrypted sessions between IoT devices (ESP32, Arduino) and backend servers.

---

## Available Examples

### 1. Unified TCP Demo (`project_tcp`)
A complete plug-and-play USMP implementation over **TCP** featuring:
- A Python gateway/echo server.
- An ESP-IDF (ESP32) client application.
- An Arduino (ESP32) sketch using the Arduino wrapper client.

👉 **[View TCP Example Guide](/docs/examples/tcp)**

---

### 2. Unified UDP Demo (`project_udp`)
A complete USMP implementation over **UDP** with built-in transport-level reliability:
- A Python gateway/echo server.
- An ESP-IDF (ESP32) client application.
- An Arduino (ESP32) sketch.

👉 **[View UDP Example Guide](/docs/examples/udp)**

---

### 3. Public Cloud Deployment (AWS EC2)
Step-by-step setup to deploy a public USMP server on **AWS EC2** and connect local microcontrollers over the public Internet:
- EC2 Ubuntu server setup with systemd / Python gateway.
- Inbound Security Group rule configuration (Port 9000).
- Remote Wi-Fi client connection from ESP32 & Arduino.

👉 **[View AWS EC2 Guide](/docs/examples/aws-ec2)**

---

## Notes on Development Keys

All development examples are preconfigured with the development PSK:
`usmp-dev-psk-change-me-before-prod`

> [!WARNING]
> This key is public and must **never** be used in production firmware or servers.
> Generate a secure random 32-byte key for production deployments:
>
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```
