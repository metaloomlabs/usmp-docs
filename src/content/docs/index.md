# USMP | Unified Secure Multi-transport Protocol

> Secure, lightweight, transport-agnostic communication for embedded devices.

USMP is a binary application-layer protocol that gives your ESP32 (or any embedded device) a **secure, authenticated, encrypted session** with a gateway  -  with three function calls.

```c
usmp_transport_tcp_init(&transport, "192.168.137.1", 9000);
usmp_connect(&ctx, &transport);
usmp_send(&ctx, data, len);
```

---

## Why USMP?

Most IoT protocols make you choose between **simple** and **secure**:

| Protocol | Simple | Secure | Embedded-friendly |
|---|---|---|---|
| Raw TCP | Yes | No | Yes |
| MQTT | Yes | Needs TLS | Partial |
| TLS | No | Yes | Heavy |
| CoAP | Yes | Needs DTLS | Yes |
| **USMP** | **Yes** | **Yes** | **Yes** |

USMP is **secure by default**. There is no insecure mode. Every session is:

- **Mutually authenticated**  -  both device and gateway verify each other
- **Encrypted**  -  AES-256-GCM, mandatory
- **Forward secret**  -  X25519 ephemeral keys, new per session
- **Replay protected**  -  nonces + monotonic sequence numbers

---

## How it works

Refer to the interactive **Handshake Sequence Flow** diagram at the bottom of this page to see how a secure session is initialized, authenticated, and established.

The handshake takes **~200ms** on ESP32. After that, sending a frame takes **<5ms**.

---

## Features

- **Mutual authentication**  -  PSK-based HMAC, both sides verified
- **Forward secrecy**  -  X25519 ephemeral key exchange per session
- **AES-256-GCM encryption**  -  mandatory, authenticated
- **Replay protection**  -  per-session nonces + sequence numbers
- **Transport agnostic**  -  TCP now, UART and UDP coming
- **Simple API**  -  connect, send, recv, close
- **Cross-platform**  -  ESP32, Arduino (ESP32 cores), STM32 coming
- **Python SDK**  -  asyncio server and client

---

## Status

**Active Development  -  v0.2.0**

| Component | Status |
|---|---|
| Protocol spec | Complete |
| Frame layer | Working |
| Handshake | Working |
| AES-256-GCM encryption | Working |
| Mutual authentication | Working |
| ESP32 port | Working |
| Arduino port | Working |
| Python SDK | Working |
| Transport abstraction | Working |
| UART transport | In Progress |
| CLI tool | In Progress |
| mDNS discovery | In Progress |
| Cloud bridge | Planned |

---

## Quickstart Guides

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-8">
  <a href="/docs/getting-started/quickstart-esp32" class="group flex flex-col p-5 border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-900/40 hover:border-neutral-500 rounded-lg no-underline transition-all duration-300">
    <div class="flex items-center gap-2 mb-2 text-white font-semibold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white transition-colors"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>
      <span>Quick Start (ESP32)</span>
    </div>
    <span class="text-xs text-neutral-400 font-sans leading-normal">Connect constrained ESP32 hardware using C++ bindings.</span>
  </a>

  <a href="/docs/getting-started/quickstart-arduino" class="group flex flex-col p-5 border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-900/40 hover:border-neutral-500 rounded-lg no-underline transition-all duration-300">
    <div class="flex items-center gap-2 mb-2 text-white font-semibold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white transition-colors"><circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/><path d="M12 12h.01M6 12h4M14 12h4"/></svg>
      <span>Quick Start (Arduino)</span>
    </div>
    <span class="text-xs text-neutral-400 font-sans leading-normal">Deploy sessions on Arduino compatible boards easily.</span>
  </a>

  <a href="/docs/getting-started/quickstart-python" class="group flex flex-col p-5 border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-900/40 hover:border-neutral-500 rounded-lg no-underline transition-all duration-300">
    <div class="flex items-center gap-2 mb-2 text-white font-semibold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white transition-colors"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Quick Start (Python)</span>
    </div>
    <span class="text-xs text-neutral-400 font-sans leading-normal">Implement gateway interfaces using async Python SDK.</span>
  </a>

  <a href="/docs/getting-started/installation" class="group flex flex-col p-5 border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-900/40 hover:border-neutral-500 rounded-lg no-underline transition-all duration-300">
    <div class="flex items-center gap-2 mb-2 text-white font-semibold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      <span>Installation</span>
    </div>
    <span class="text-xs text-neutral-400 font-sans leading-normal">Download and build USMP libraries for your environment.</span>
  </a>

  <a href="/docs/spec" class="group flex flex-col p-5 border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-900/40 hover:border-neutral-500 rounded-lg no-underline transition-all duration-300">
    <div class="flex items-center gap-2 mb-2 text-white font-semibold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white transition-colors"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span>Protocol Specification</span>
    </div>
    <span class="text-xs text-neutral-400 font-sans leading-normal">Deep dive into the binary framing and cryptographic layer.</span>
  </a>

  <a href="/docs/security/model" class="group flex flex-col p-5 border border-neutral-900 bg-neutral-950/40 hover:bg-neutral-900/40 hover:border-neutral-500 rounded-lg no-underline transition-all duration-300">
    <div class="flex items-center gap-2 mb-2 text-white font-semibold">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 group-hover:text-white transition-colors"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M12 11V9a1.5 1.5 0 0 0-3 0v2"/></svg>
      <span>Security Model</span>
    </div>
    <span class="text-xs text-neutral-400 font-sans leading-normal">Analyze replay protections and key exchange design.</span>
  </a>
</div>
