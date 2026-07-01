'use client'

import { useState } from 'react'
import {
  LuArrowRight,
  LuGithub,
  LuTerminal,
  LuDownload,
  LuShieldCheck,
  LuCpu,
  LuWorkflow,
  LuZap,
  LuLayers,
  LuKey,
  LuArrowUpRight,
  LuCheck,
  LuChevronRight,
  LuChevronDown,
  LuLock,
  LuActivity
} from 'react-icons/lu'

import { buttonVariants } from '@/components/ui/button'
import { PageRoutes } from '@/lib/pageroutes'
import { Link } from '@/lib/transition'
import { Settings } from '@/types/settings'

// Handshake visualizer data
const handshakeSteps = [
  {
    title: '1. Client Hello (Session Init)',
    desc: 'The client generates an ephemeral ECDH keypair and transmits its public key in a Client Hello frame. This initiates key agreement without exposing device identities.',
    sender: 'Client (ESP32/Arduino)',
    receiver: 'Gateway Server (Python)',
    direction: 'forward', // client -> server
    payload: {
      frame_type: 'HANDSHAKE_HELLO',
      protocol_version: '1.0.0',
      client_ephemeral_pub: '04a8b1f2e96d...',
      nonce: '4a28f89d10e5'
    }
  },
  {
    title: '2. Mutual Authentication',
    desc: 'The server verifies the request, generates its own ephemeral keypair, derives the shared secret, generates a strong auth tag using the Pre-Shared Key (PSK), and returns them.',
    sender: 'Gateway Server (Python)',
    receiver: 'Client (ESP32/Arduino)',
    direction: 'reverse', // server -> client
    payload: {
      frame_type: 'HANDSHAKE_AUTH',
      server_ephemeral_pub: '04c2b9a4f78e...',
      server_auth_tag: 'b8f521c7fa09...',
      nonce: 'd9203e8a11f4'
    }
  },
  {
    title: '3. Shared Key Derivation (ECDH + HKDF)',
    desc: 'Both endpoints compute the Elliptic-Curve Diffie-Hellman (ECDH) secret, mixing it with the PSK using HKDF-SHA256. Symmetric keys are derived locally; keys are never transmitted.',
    sender: 'Local Derivation',
    receiver: 'Local Derivation',
    direction: 'local',
    payload: {
      shared_secret: 'ecdh_secret = client_priv * server_pub',
      kdf_hash: 'HKDF-SHA256(shared_secret, salt, PSK)',
      derived_keys: {
        tx_encryption_key: 'AES-256-GCM [32 bytes]',
        rx_encryption_key: 'AES-256-GCM [32 bytes]'
      }
    }
  },
  {
    title: '4. Encrypted Tunnel Established',
    desc: 'Subsequent frames are encrypted via authenticated AES-256-GCM or ChaCha20-Poly1305. Sequence numbers guard against replay attacks; GCM tags ensure integrity.',
    sender: 'Client (ESP32/Arduino)',
    receiver: 'Gateway Server (Python)',
    direction: 'forward', // client -> server
    payload: {
      frame_type: 'PAYLOAD_ENCRYPTED',
      sequence_number: 104,
      iv: '6a8d9e20fb31c9a4',
      ciphertext: '4b92afc83d102fe8...',
      gcm_tag: 'f3c8a901bd76'
    }
  }
]

// Code snippets data
const codeSnippets = {
  c: `// Initialize a USMP session (ESP-IDF / Pure C)
UsmpSession session;
usmp_init(&session, my_transport_write_callback);

// Perform secure mutual handshake
if (usmp_handshake(&session) != USMP_SUCCESS) {
    printf("Security handshake failed!\\n");
    return;
}

// Send encrypted frames over any transport (UART, BLE, Sockets)
uint8_t payload[] = "telemetry_data";
usmp_send(&session, payload, sizeof(payload));`,

  cpp: `#include <USMP.h>

// Initialize client with Pre-Shared Key
USMPClient usmp("f3c54d89a2b10e9f...");

void setup() {
  // Bind to TCP transport driver (or UDP, BLE, Serial)
  usmp.begin(USMP::TCP("192.168.1.10", 8080));
}

void loop() {
  usmp.maintain(); // Keepalives, ticks & auto-reconnects
  
  if (usmp.connected()) {
    usmp.send("Hello Gateway from Arduino TCP!");
  }
}`,

  python: `import asyncio
from usmp import USMPServer

# Handle incoming authenticated sessions
async def handle_client(session):
    print(f"Authenticated connection: {session.peer_id}")
    await session.send(b"Welcome to secure tunnel")
    async for message in session.recv_iter():
        print(f"Decrypted payload: {message}")

async def main():
    # Instantiate server with PSK
    server = USMPServer(psk="f3c54d89a2b10e9f...", port=8080)
    await server.start(handle_client)

asyncio.run(main())`
}

export default function Home() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeCodeTab, setActiveCodeTab] = useState<'c' | 'cpp' | 'python'>('c')
  const [benchmarkMetric, setBenchmarkMetric] = useState<'rom' | 'ram'>('rom')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background">
      {/* Sleek Grid Overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Decorative ambient flares */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div
          className="relative left-[calc(50%-15rem)] aspect-1155/678 w-[40rem] -translate-x-1/2 rotate-[10deg] bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center sm:pt-28 lg:px-8 flex flex-col items-center">
        {/* Minimalist Tech Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-semibold text-emerald-500 backdrop-blur-md dark:border-emerald-500/30">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>New Release: v1.0.1 (Stable)</span>
        </div>

        {/* Chrome / Metallic Centered Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          <span className="bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent dark:from-white dark:via-neutral-100 dark:to-neutral-500">
            USMP Protocol
          </span>
        </h1>

        {/* Centered Subtitle */}
        <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-xl sm:leading-8">
          <strong>Unified Secure Multi-transport Protocol</strong>. Highly optimized, secure, and transport-agnostic 
          communication protocol. Designed from scratch for resource-constrained microcontrollers, 
          bringing mutual authentication and AES-256-GCM encryption with just three function calls.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/docs${PageRoutes[0].href}`}
            className={buttonVariants({
              className:
                'gap-2 px-6 py-6 bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all duration-200 shadow-md shadow-foreground/5 text-base rounded-xl',
              size: 'lg',
            })}
          >
            Get Started
            <LuArrowRight className="size-5" />
          </Link>
          <a
            href="/usmp-0.5.1-arduino.zip"
            download
            className={buttonVariants({
              variant: 'outline',
              className:
                'gap-2 px-6 py-6 border-border bg-card hover:bg-muted/80 transition-colors duration-200 text-base rounded-xl',
              size: 'lg',
            })}
          >
            <LuDownload className="size-5 text-emerald-500" />
            Download Arduino ZIP
          </a>
          <Link
            href={Settings.link}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: 'outline',
              className:
                'gap-2 px-6 py-6 border-border bg-card hover:bg-muted/80 transition-colors duration-200 text-base rounded-xl',
              size: 'lg',
            })}
          >
            <LuGithub className="size-5 text-muted-foreground" />
            GitHub
          </Link>
        </div>

        {/* Dynamic Key Stats Grid */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-4xl border-y border-border/40 py-10">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl">11.2 KB</span>
            <span className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-mono">ROM Footprint</span>
          </div>
          <div className="flex flex-col items-center border-l border-border/40">
            <span className="text-3xl font-extrabold text-emerald-500 sm:text-4xl">0 Bytes</span>
            <span className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-mono">Dynamic Heap RAM</span>
          </div>
          <div className="flex flex-col items-center border-l border-border/40">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl">3 Frames</span>
            <span className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-mono">Handshake Duration</span>
          </div>
          <div className="flex flex-col items-center border-l border-border/40">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl">AES-GCM</span>
            <span className="mt-1 text-xs text-muted-foreground uppercase tracking-widest font-mono">Hardware Safe</span>
          </div>
        </div>
      </section>

      {/* CORE TECHNICAL PILLARS GRID */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Extreme Environments
          </h2>
          <p className="mt-4 text-muted-foreground">
            Standard security protocols (TLS, SSH) are too heavy for low-power MCUs. 
            USMP fills this gap, offering robust modern cryptography with minimal resource overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-5">
                <LuCpu className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Zero Heap Allocation</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Relies entirely on statically-sized static/stack buffers. Prevents heap fragmentation, ensuring year-round MCU uptime.
              </p>
            </div>
            <div className="mt-4 text-xs font-mono text-emerald-500">malloc() -&gt; NULL safe</div>
          </div>

          <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-5">
                <LuWorkflow className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Transport Agnostic</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Operates smoothly over TCP sockets, UDP datagrams, BLE attributes, raw UART, RS-485, or CAN bus.
              </p>
            </div>
            <div className="mt-4 text-xs font-mono text-emerald-500">Stream & Packet support</div>
          </div>

          <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-5">
                <LuShieldCheck className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Mutual Authentication</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Ensures both the server and client cryptographically verify each other before establishing a shared ephemeral session key.
              </p>
            </div>
            <div className="mt-4 text-xs font-mono text-emerald-500">Prevents Spoofing & MITM</div>
          </div>

          <div className="flex flex-col justify-between p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-5">
                <LuZap className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Hardware Accelerable</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Designed to map directly onto hardware acceleration blocks (AES/GCM) present on ESP32, STM32, and other SOCs.
              </p>
            </div>
            <div className="mt-4 text-xs font-mono text-emerald-500">AES-256-GCM / ChaCha20</div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE HANDSHAKE VISUALIZER */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-border/30">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Interactive Handshake Explorer
          </h2>
          <p className="mt-4 text-muted-foreground">
            USMP initiates a secure session using Elliptic-Curve Diffie-Hellman (ECDH) mixed with a Pre-Shared Key (PSK). 
            Click through the steps below to inspect how a session is established.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Steps selector (left) */}
          <div className="lg:col-span-5 space-y-4">
            {handshakeSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                  activeStep === idx
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground shadow-lg shadow-emerald-500/5'
                    : 'border-border/60 bg-card hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                    activeStep === idx
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  0{idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-base ${activeStep === idx ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Visualization & Payload Panel (right) */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl border border-border/80 bg-neutral-950 p-6 shadow-2xl dark:border-border/40 h-full justify-between">
            {/* Visual client-server representation */}
            <div className="mb-8 border-b border-border/40 pb-6">
              <div className="flex items-center justify-between px-6 text-sm font-semibold tracking-wider uppercase font-mono text-muted-foreground">
                <span className="flex items-center gap-2">
                  <LuCpu className="text-emerald-500 size-4" /> Client
                </span>
                <span className="flex items-center gap-2">
                  Server <LuLock className="text-emerald-500 size-4" />
                </span>
              </div>

              {/* Dynamic Flow Arrow */}
              <div className="my-8 flex items-center justify-center px-4 relative">
                <div className="absolute left-6 h-3 w-3 rounded-full bg-emerald-500" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-emerald-500/40 via-emerald-500 to-emerald-500/40" />
                <div className="absolute right-6 h-3 w-3 rounded-full bg-emerald-500" />

                {/* Sender/Receiver labels & Direction indicator */}
                <div className="absolute bg-neutral-900 border border-border/40 rounded-full px-4 py-1 text-xs font-mono text-neutral-300 flex items-center gap-2 shadow-lg">
                  {handshakeSteps[activeStep].direction === 'forward' && (
                    <>
                      <span>{handshakeSteps[activeStep].sender}</span>
                      <LuChevronRight className="text-emerald-500 size-3 animate-pulse" />
                      <span>{handshakeSteps[activeStep].receiver}</span>
                    </>
                  )}
                  {handshakeSteps[activeStep].direction === 'reverse' && (
                    <>
                      <span>{handshakeSteps[activeStep].receiver}</span>
                      <LuChevronRight className="text-emerald-500 size-3 rotate-180 animate-pulse" />
                      <span>{handshakeSteps[activeStep].sender}</span>
                    </>
                  )}
                  {handshakeSteps[activeStep].direction === 'local' && (
                    <span className="flex items-center gap-1.5">
                      <LuActivity className="text-emerald-500 size-3" />
                      <span>Derived locally on both devices</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Simulated frame / cryptographic state */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <LuTerminal className="size-4 text-emerald-500" />
                  <span>
                    {handshakeSteps[activeStep].direction === 'local'
                      ? 'Cryptographic State'
                      : 'Simulated Frame Payload'}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                  JSON Representation
                </span>
              </div>
              <pre className="p-4 overflow-x-auto text-xs leading-5 font-mono text-emerald-400 bg-black border border-border/20 rounded-xl">
                <code>{JSON.stringify(handshakeSteps[activeStep].payload, null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CODE SHOWCASE PANEL */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-border/30">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Integrates in Minutes
          </h2>
          <p className="mt-4 text-muted-foreground">
            USMP is designed for simplicity. Initialize the session, bind to your transport, and start sending secure data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Context content (left) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-500 tracking-widest font-mono">Developer Experience</span>
              <h3 className="text-2xl font-bold text-foreground">Clean, Expressive APIs</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Whether you are compiling for pure C targets (like ESP-IDF or STM32), writing C++ sketches in Arduino, 
              or setting up a gateway server in Python, USMP offers consistent APIs.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <LuCheck className="text-emerald-500 size-4" />
                No dependency on huge standard libraries
              </li>
              <li className="flex items-center gap-2">
                <LuCheck className="text-emerald-500 size-4" />
                Simple callback binding for custom physical transports
              </li>
              <li className="flex items-center gap-2">
                <LuCheck className="text-emerald-500 size-4" />
                Includes built-in auto-retry & packet serialization
              </li>
            </ul>

            <Link
              href={`/docs/getting-started/installation`}
              className={buttonVariants({
                variant: 'outline',
                className: 'gap-2 w-fit mt-4 border-border/85 bg-card hover:bg-muted/80',
              })}
            >
              Read Installation Guide
              <LuArrowUpRight className="size-4" />
            </Link>
          </div>

          {/* Tabs Selector & Code Display (right) */}
          <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-neutral-950 p-1 shadow-2xl dark:border-border/40">
            {/* Custom styled tabs headers */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-neutral-900/50 rounded-t-xl flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  id="tab-c"
                  onClick={() => setActiveCodeTab('c')}
                  className={`px-3 py-1.5 text-xs font-semibold font-mono rounded-md transition-all ${
                    activeCodeTab === 'c'
                      ? 'bg-neutral-800 text-white border border-border/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  ESP-IDF (C)
                </button>
                <button
                  id="tab-cpp"
                  onClick={() => setActiveCodeTab('cpp')}
                  className={`px-3 py-1.5 text-xs font-semibold font-mono rounded-md transition-all ${
                    activeCodeTab === 'cpp'
                      ? 'bg-neutral-800 text-white border border-border/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Arduino (C++)
                </button>
                <button
                  id="tab-python"
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-3 py-1.5 text-xs font-semibold font-mono rounded-md transition-all ${
                    activeCodeTab === 'python'
                      ? 'bg-neutral-800 text-white border border-border/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Python (Gateway)
                </button>
              </div>

              {/* Mac-like window controls */}
              <div className="hidden sm:flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-neutral-800" />
                <span className="w-3 h-3 rounded-full bg-neutral-800" />
                <span className="w-3 h-3 rounded-full bg-neutral-800" />
              </div>
            </div>

            {/* Pre/Code */}
            <pre className="p-6 overflow-x-auto text-[13px] leading-6 font-mono text-neutral-300 bg-neutral-950 rounded-b-xl max-h-[400px]">
              <code>
                {codeSnippets[activeCodeTab]}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* INTERACTIVE BENCHMARKS / COMPARISON */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 border-t border-border/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Visual Benchmark charts (left) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex gap-2 rounded-xl bg-muted p-1 w-fit mb-6">
              <button
                id="btn-metric-rom"
                onClick={() => setBenchmarkMetric('rom')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  benchmarkMetric === 'rom'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Compiled Size (ROM)
              </button>
              <button
                id="btn-metric-ram"
                onClick={() => setBenchmarkMetric('ram')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  benchmarkMetric === 'ram'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dynamic Heap (RAM)
              </button>
            </div>

            <div className="space-y-6 p-6 rounded-2xl border border-border/50 bg-card">
              {benchmarkMetric === 'rom' ? (
                <>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
                    Flash ROM Usage (Kilobytes)
                  </h4>
                  {/* Bar 1: USMP */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>USMP (Core C)</span>
                      <span className="text-emerald-500">11.2 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '6.2%' }} />
                    </div>
                  </div>
                  {/* Bar 2: TinyDTLS + CoAP */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>TinyDTLS + CoAP</span>
                      <span>48.0 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-neutral-600 rounded-full transition-all duration-500" style={{ width: '26.6%' }} />
                    </div>
                  </div>
                  {/* Bar 3: MbedTLS (v1.3 TLS) */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>MbedTLS (v1.3 Client)</span>
                      <span>180.0 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-neutral-800 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
                    Dynamic Memory Allocation (Heap Bytes)
                  </h4>
                  {/* Bar 1: USMP */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>USMP (Core C)</span>
                      <span className="text-emerald-500">0 Bytes (Fully Static)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '0.5%' }} />
                    </div>
                  </div>
                  {/* Bar 2: TinyDTLS + CoAP */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>TinyDTLS + CoAP</span>
                      <span>8.5 KB (Heap allocations)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-neutral-600 rounded-full transition-all duration-500" style={{ width: '24.2%' }} />
                    </div>
                  </div>
                  {/* Bar 3: MbedTLS (v1.3 TLS) */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>MbedTLS (v1.3 Client)</span>
                      <span>35.0 KB (Minimum Handshake Buffer)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-neutral-800 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </>
              )}
              <div className="text-[11px] text-muted-foreground mt-4 leading-relaxed font-sans">
                * ROM figures represent stripped release-optimized GCC compilations for the Xtensa LX7 (ESP32-S3) target. 
                RAM figures are captured during active crypto payload framing cycles.
              </div>
            </div>
          </div>

          {/* Description (right) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs uppercase font-bold text-emerald-500 tracking-widest font-mono">Performance Benchmarks</span>
            <h3 className="text-3xl font-bold text-foreground">A Fraction of the Resource Cost</h3>
            <p className="text-muted-foreground leading-relaxed">
              Standard TLS implementations require huge memory allocations for handshake buffers and crypt-state structures, 
              which can trigger Out-Of-Memory crashes on small systems.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              USMP bypasses the dynamic allocation altogether. Its static buffers fit comfortably in internal SRAM, 
              even on low-cost microcontrollers.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-4xl px-6 py-20 lg:px-8 border-t border-border/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Clear up common questions about integration, security properties, and protocol operations.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can USMP be ported to serial buses like UART, RS-485, or CAN?',
              a: 'Yes, absolutely. USMP is completely transport-agnostic. It does not expect a socket connection. Instead, you register a simple write callback to transmit frames and call the receive handler when bytes arrive on your physical interface.'
            },
            {
              q: 'How does the protocol prevent Replay and Man-in-the-Middle attacks?',
              a: 'Replay protection is enforced via strict, cryptographically bound sequence numbering and session nonces. MITM is blocked by mutual authentication: during the handshake, both devices must prove ownership of the Pre-Shared Key (PSK) to successfully complete the ECDH key exchange.'
            },
            {
              q: 'What is the packet size overhead for each message?',
              a: 'Each encrypted frame adds exactly 28 bytes of overhead (12-byte IV for AES-GCM, 16-byte cryptographic authentication tag, and a 4-byte sequence identifier). This is drastically smaller than a TLS record or DTLS envelope.'
            },
            {
              q: 'Can it run on 8-bit AVR microcontrollers?',
              a: 'Yes. While hardware-accelerated AES is most efficient on 32-bit cores (like ESP32 or ARM Cortex), USMP supports modular crypto backends. By swap-in ChaCha20-Poly1305 or light software routines, it runs efficiently on low-spec AVR/PIC devices.'
            }
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                id={`faq-btn-${idx}`}
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:bg-muted/50 transition-colors duration-150"
              >
                <span>{item.q}</span>
                <LuChevronDown
                  className={`size-4 text-muted-foreground transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openFaq === idx ? 'max-h-40 border-t border-border p-5' : 'max-h-0'
                } overflow-hidden bg-neutral-900/10 text-sm text-muted-foreground leading-relaxed`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center lg:px-8 border-t border-border/30">
        <div className="p-8 sm:p-16 rounded-3xl bg-neutral-950 border border-border/80 dark:border-border/40 relative overflow-hidden flex flex-col items-center">
          {/* Subtle glow behind CTA */}
          <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Secure Your Embedded Sockets Today
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Get started by reading our Quick Start guides, importing the library, or exploring the protocol design specs.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href={`/docs${PageRoutes[0].href}`}
              className={buttonVariants({
                className: 'gap-2 px-6 py-5 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-xl',
                size: 'lg',
              })}
            >
              Start Integration
              <LuArrowRight className="size-4" />
            </Link>
            <Link
              href="/docs/spec"
              className={buttonVariants({
                variant: 'outline',
                className: 'gap-2 px-6 py-5 border-border bg-card hover:bg-muted/80 rounded-xl',
                size: 'lg',
              })}
            >
              Read Specification
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
