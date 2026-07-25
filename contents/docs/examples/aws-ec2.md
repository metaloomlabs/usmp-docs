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

## Directory Structure

```text
examples/aws_ec2_test/
├── README.md               # Setup and deployment guide
├── server/
│   └── server.py           # Python server running on EC2
├── arduino/
│   └── arduino.ino         # Arduino IDE client sketch for ESP32
└── esp32/                  # ESP-IDF project files for ESP32
    ├── CMakeLists.txt
    └── main/
        ├── app.c           # Main ESP-IDF client logic
        └── wifi.c          # Wi-Fi helper implementation
```

---

## Prerequisites

Before starting, make sure you have:

1. An active **AWS Account**.
2. An **ESP32 development board** connected to your local machine.
3. Depending on your preferred framework:
   - **Arduino IDE**: Install the IDE and download the prepackaged Arduino library zip `usmp-1.1.0-arduino.zip` from our [Downloads](/downloads) page.
   - **ESP-IDF**: Install the ESP-IDF toolchain (v5.0+) and make sure `idf.py` is available in your path.

---

## Step 1: Launch an AWS EC2 Instance

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2. Navigate to the **EC2 Dashboard** and click **Launch instance**.
3. Configure the following settings:
   - **Name**: `usmp-test-server`
   - **Application and OS Image (AMI)**: Select **Ubuntu** (e.g., *Ubuntu Server 24.04 LTS*, Free tier eligible).
   - **Architecture**: `x86_64` (default).
   - **Instance type**: `t2.micro` or `t3.micro` (Free tier eligible).
   - **Key pair (login)**: Choose an existing key pair or click **Create new key pair** (download and save the `.pem` file safely).
4. Click **Launch instance**.

---

## Step 2: Configure Security Group (Port 9000)

By default, AWS blocks all incoming traffic to your EC2 instance except SSH (Port 22). To allow the ESP32 to communicate with the USMP server, you must open TCP port `9000`.

1. In the EC2 Dashboard, select your running instance `usmp-test-server`.
2. Select the **Security** tab and click on the **Security groups** link.
3. Click **Edit inbound rules**.
4. Click **Add rule** and configure:
   - **Rule 1 (SSH)**: Type `SSH`, Port `22`, Source `My IP` or `0.0.0.0/0`.
   - **Rule 2 (USMP Server)**: Type `Custom TCP`, Port `9000`, Source `Anywhere-IPv4` (`0.0.0.0/0`).
5. Click **Save rules**.

---

## Step 3: Prepare the EC2 Instance

Connect to your EC2 instance via SSH:

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

Install Python 3:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv git -y
```

---

## Step 4: Run the USMP Server on EC2

Create a directory and virtual environment, install `usmp`, and start the server:

```bash
mkdir usmp-server && cd usmp-server
python3 -m venv .venv
source .venv/bin/activate
pip install usmp
```

Create `server.py` and run it:

```bash
python3 server.py
```

*You should see a message indicating the server is listening on port 9000.*

---

## Step 5: Configure and Upload Client Firmware

### Option A: Using Arduino IDE

1. Download `usmp-1.1.0-arduino.zip` from our [Downloads](/downloads) page.
2. In **Arduino IDE**, click **Sketch** ➔ **Include Library** ➔ **Add .ZIP Library...** and select `usmp-1.1.0-arduino.zip`.
3. Set your parameters:
   - **`EC2_PUBLIC_IP`**: Put the **Public IPv4 address** of your running EC2 instance.
   - **`WIFI_SSID`**: Enter your local Wi-Fi name.
   - **`WIFI_PASS`**: Enter your local Wi-Fi password.
   - **`PSK`**: Match this with your server key (default: `usmp-dev-psk-change-me-before-prod`).
4. Select your ESP32 board and click **Upload**.

---

## Step 6: Verify Connection & Logs

### ESP32 Serial Monitor Output

```text
Connecting to Wi-Fi: YourNetwork
Connecting to USMP EC2 Server: 13.62.222.96:9000
[INFO] Connecting to 13.62.222.96 on port 9000...
[INFO] Socket connected. Sending handshake initiator...
[INFO] Handshake response received. Validating peer...
[SUCCESS] Secure USMP session established!
  Device ID:  device_xxxxxxxxxxxx
  Session ID: session_xxxxxxxxxxxx
Sending: ESP32 Ping #1 (Uptime: 5s)
```

### EC2 Terminal Output

```text
============================================================
                USMP SECURE SERVER (EC2)
============================================================
Listening on: 0.0.0.0:9000
Protocol:     TCP
============================================================
[SESSION ESTABLISHED]
  Device ID:  device_xxxxxxxxxxxx
  Session ID: session_xxxxxxxxxxxx
  Client IP:  73.14.XX.XX
[RX from device_xxxxxxxxxxxx]: Hello EC2, this is ESP32 via USMP!
```
