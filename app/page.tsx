'use client'

import { useState, useEffect } from 'react'
import {
  LuActivity,
  LuArrowRight,
  LuArrowUpRight,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuCpu,
  LuDownload,
  LuGithub,
  LuLock,
  LuShieldCheck,
  LuTerminal,
  LuWorkflow,
  LuZap,
  LuCopy,
  LuKey,
  LuHistory,
  LuShieldAlert,
  LuRefreshCw,
  LuGlobe,
  LuDatabase,
  LuLayers,
} from 'react-icons/lu'

import { buttonVariants } from '@/components/ui/button'
import { PageRoutes } from '@/lib/pageroutes'
import { Link } from '@/lib/transition'
import { Settings } from '@/types/settings'

// Handshake Visualizer Steps
const handshakeSteps = [
  {
    title: '1. Client Hello (PKT_HELLO)',
    desc: 'The client announces its device_id and sends its ephemeral Curve25519 public key (pub_C) to start the handshake.',
    sender: 'ESP32 (Device)',
    receiver: 'Gateway (Server)',
    direction: 'forward',
    terminalLogs: [
      '[ESP32] Initializing TCP connection to gateway.io:9000...',
      '[ESP32] TCP socket connected successfully.',
      '[ESP32] Generating ephemeral Curve25519 keypair...',
      '[ESP32] Keypair generated. Public Key pub_C derived.',
      '[ESP32] Sending PKT_HELLO (Type: 0x01, Length: 38 bytes) to Server...',
    ],
    payload: {
      header: {
        magic: '0xABCD',
        version: '0x01',
        type: 'PKT_HELLO (0x01)',
        seq: 0,
      },
      payload: {
        device_id: '04:a8:b1:f2:e9:6d',
        pub_C: '4a28f89d10e5d9203e8a11f48c2b9a4f...',
      },
    },
  },
  {
    title: '2. Server Challenge (PKT_CHALLENGE)',
    desc: 'The server generates its own ephemeral keypair and responds with a cryptographically secure random challenge (nonce) and its public key (pub_S).',
    sender: 'Gateway (Server)',
    receiver: 'ESP32 (Device)',
    direction: 'reverse',
    terminalLogs: [
      '[Gateway] Received PKT_HELLO from device 04:a8:b1:f2:e9:6d.',
      '[Gateway] Generating ephemeral Curve25519 keypair for session...',
      '[Gateway] Generating 32-byte secure random challenge nonce...',
      '[Gateway] Sending PKT_CHALLENGE (Type: 0x02, Length: 64 bytes) to Client...',
    ],
    payload: {
      header: {
        magic: '0xABCD',
        version: '0x01',
        type: 'PKT_CHALLENGE (0x02)',
        seq: 0,
      },
      payload: {
        nonce: '7fa093c4a28f89d10e5d9203eb8f521c...',
        pub_S: '04c2b9a4f78eb8f521c7fa093c4a28f8...',
      },
    },
  },
  {
    title: '3. Client Proof (PKT_HELLO_ACK)',
    desc: 'Both client and server derive the session keys locally using ECDH. The client then sends an HMAC proof of the PSK to verify its identity.',
    sender: 'ESP32 (Device)',
    receiver: 'Gateway (Server)',
    direction: 'forward',
    terminalLogs: [
      '[ESP32] Received PKT_CHALLENGE from server.',
      '[ESP32] Performing Elliptic-Curve Diffie-Hellman (ECDH) key exchange...',
      '[ESP32] Shared secret derived. Mixing with master Pre-Shared Key (PSK)...',
      '[ESP32] Session keys generated locally. Computing HMAC-SHA256 client proof...',
      '[ESP32] Sending PKT_HELLO_ACK (Type: 0x03, Length: 32 bytes) to Server...',
    ],
    payload: {
      header: {
        magic: '0xABCD',
        version: '0x01',
        type: 'PKT_HELLO_ACK (0x03)',
        seq: 0,
      },
      payload: {
        hmac_client: 'b8f521c7fa093c4a28f89d10e5d9203e...',
      },
    },
  },
  {
    title: '4. Session OK (PKT_SESSION_OK)',
    desc: 'The server verifies the client proof, generates a unique session_id, and returns its own server HMAC proof to complete the mutual authentication.',
    sender: 'Gateway (Server)',
    receiver: 'ESP32 (Device)',
    direction: 'reverse',
    terminalLogs: [
      '[Gateway] Received PKT_HELLO_ACK from device.',
      '[Gateway] Verifying client HMAC proof using local PSK & Shared Secret...',
      '[Gateway] Client proof VERIFIED. Mutual authentication successful.',
      '[Gateway] Generating random 8-byte session_id...',
      '[Gateway] Computing Server HMAC-SHA256 proof...',
      '[Gateway] Sending PKT_SESSION_OK (Type: 0x04, Length: 48 bytes) to Client...',
      '[System] SECURE USMP SESSION ESTABLISHED. Ready for telemetry transmission.',
    ],
    payload: {
      header: {
        magic: '0xABCD',
        version: '0x01',
        type: 'PKT_SESSION_OK (0x04)',
        seq: 0,
      },
      payload: {
        session_id: 'a8b1f2e96d04c2b9',
        hmac_server: 'f3c8a901bd76a8d9e20fb31c77f0ae29...',
      },
    },
  },
]

// Code tabs
const codeSnippets = {
  esp32: `// 1. Initialize TCP or UDP transport
usmp_transport_tcp_init(&transport, "gateway.io", 9000);

// 2. Load credentials and connect
ctx.psk = my_secure_psk;
ctx.psk_len = 32;
usmp_connect(&ctx, &transport);

// 3. Send encrypted payloads safely
usmp_send(&ctx, (uint8_t *)"hello", 5);`,

  arduino: `#include <USMP.h>

USMPClient usmp("my-secure-psk");

void setup() {
    // Connect transport & handshake automatically
    usmp.begin(USMP::TCP("gateway.io"));
    usmp.send("Hello from Arduino!");
}

void loop() {
    usmp.maintain(); // Keeps session alive
}`,

  python: `from usmp import USMPServer

server = USMPServer(host="0.0.0.0", port=9000, psk=b"my-secure-psk")

@server.on_session
async def handle_device(session):
    print(f"Device authenticated: {session.device_id}")
    payload = await session.recv()
    await session.send(b"Decrypted successfully!")`
}

export default function Home() {
  const [activeHandshakeStep, setActiveHandshakeStep] = useState(0)
  const [activeCodeTab, setActiveCodeTab] = useState<'esp32' | 'arduino' | 'python'>('esp32')
  const [benchmarkMetric, setBenchmarkMetric] = useState<'rom' | 'ram'>('rom')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  // Real-time encryption demo states
  const [telemetryInput, setTelemetryInput] = useState('{"temp":24.5,"status":"OK"}')
  const [encryptedHex, setEncryptedHex] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedCli, setCopiedCli] = useState<string | null>(null)
  const [activeCliPlatform, setActiveCliPlatform] = useState<'python' | 'esp32' | 'arduino'>('python')

  // Simple pseudo-encryption effect based on telemetryInput
  useEffect(() => {
    if (!telemetryInput) {
      setEncryptedHex('')
      return
    }
    // Generate a consistent pseudo-random hex string based on text contents
    let hash = 0
    for (let i = 0; i < telemetryInput.length; i++) {
      hash = (hash << 5) - hash + telemetryInput.charCodeAt(i)
      hash |= 0
    }
    const seed = Math.abs(hash).toString(16).padEnd(8, 'a')
    const iv = 'f8e9a1b2c3d4'
    const tag = '8fd32c1b7a9f0e4d'
    let cipherText = ''
    for (let i = 0; i < Math.min(24, telemetryInput.length); i++) {
      const code = (telemetryInput.charCodeAt(i) ^ (hash >> (i % 4))) & 0xff
      cipherText += code.toString(16).padStart(2, '0')
    }
    if (cipherText.length < 16) {
      cipherText = cipherText.padEnd(16, 'f')
    }
    setEncryptedHex(`ABCD | 00000005 | ${iv} | ${cipherText} | ${tag}`)
  }, [telemetryInput])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyCliCommand = (command: string, platform: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCli(platform)
    setTimeout(() => setCopiedCli(null), 2000)
  }

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${Settings.metadataBase}/#software`,
        'name': 'USMP (Unified Secure Multi-transport Protocol)',
        'description': 'A secure, lightweight, and transport-agnostic session-layer communication protocol for resource-constrained microcontrollers (ESP32, Arduino) and Python.',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'ESP32, Arduino, Linux, Windows, macOS',
        'license': 'https://github.com/metaloomlabs/usmp/blob/main/LICENSE',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        }
      },
      {
        '@type': 'FAQPage',
        '@id': `${Settings.metadataBase}/#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'Why not just use TLS / DTLS?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'TLS is excellent but too heavy for resource-constrained controllers. It occupies 60–100 KB of Flash and requires up to 40 KB of active RAM, along with complex root certificate (CA) verification. USMP was built specifically for microcontrollers, requiring under 10 KB of Flash and exactly 112 bytes of persistent RAM while maintaining comparable cryptographic guarantees.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Is it secure without asymmetric certificates?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes. USMP uses Mutual Pre-Shared Key (PSK) authentication via HMAC-SHA256. To ensure secrecy, an ephemeral X25519 key exchange occurs at the start of each session. Even if the pre-shared key is leaked later, past sessions cannot be decrypted (Perfect Forward Secrecy).'
            }
          },
          {
            '@type': 'Question',
            'name': 'How should I provision the PSK in production?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Do not hardcode the PSK in your source code. We recommend writing the PSK to the ESP32\'s secure, encrypted Non-Volatile Storage (NVS) partition or a dedicated hardware security module (HSM) during manufacturing.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the battery/power consumption impact?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Extremely low. Once the 4-step handshake completes, USMP uses symmetric AES-256-GCM encryption. The ESP32\'s on-chip hardware cryptographic engines accelerate this math, allowing packets to be encrypted/decrypted in under 1 millisecond with negligible battery draw.'
            }
          },
          {
            '@type': 'Question',
            'name': 'Does it support packet fragmentation?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes. USMP automatically fragments payloads larger than 452 bytes into up to 4 sequential frames (maxing out at ~1.8 KB) and reassembles them transparently on the receiving side.'
            }
          }
        ]
      }
    ]
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-background">
      {/* Structured SEO Data for AI & Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Premium background grid visual */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.25)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-35" />

      {/* Futuristic ambient light glows */}
      <div className="absolute top-0 left-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-emerald-500/5 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[50rem] w-[50rem] rounded-full bg-teal-500/5 blur-3xl opacity-50 pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 text-center sm:pt-32 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Pre-Headline */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase mb-6 animate-pulse">
          <LuShieldCheck className="size-3.5" /> UNIFIED SECURE MULTI-TRANSPORT PROTOCOL
        </span>

        {/* Main Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl lg:text-8xl max-w-4xl">
          <span className="bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent dark:from-white dark:via-neutral-100 dark:to-neutral-500">
            Bridge the IoT Security Gap.
          </span>
        </h1>

        {/* Sub-Headline */}
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-normal">
          USMP (Unified Secure Multi-transport Protocol) brings end-to-end encrypted, mutually authenticated, and forward-secret communication tunnels to{' '}
          <span className="text-foreground font-semibold">ESP32</span>,{' '}
          <span className="text-foreground font-semibold">Arduino</span>, and{' '}
          <span className="text-foreground font-semibold">Python</span> without the massive flash and RAM overhead of a full TLS stack.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/docs${PageRoutes[0].href}`}
            className={buttonVariants({
              className:
                'gap-2 px-8 py-6 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-bold transition-all duration-200 shadow-lg shadow-emerald-500/10 text-base rounded-xl border border-emerald-400/20 active:translate-y-px',
              size: 'lg',
            })}
          >
            Get Started with SDKs
            <LuArrowRight className="size-5" />
          </Link>
          <Link
            href="/docs/protocol/overview"
            className={buttonVariants({
              variant: 'outline',
              className:
                'gap-2 px-8 py-6 border-border/80 bg-card hover:bg-muted/70 transition-colors duration-200 text-base rounded-xl font-semibold text-foreground',
              size: 'lg',
            })}
          >
            Read Security Specs
            <LuArrowUpRight className="size-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Visual Asset: Interactive Handshake & Telemetry Encryption Terminal */}
        <div className="mt-20 w-full max-w-5xl rounded-2xl border border-border bg-neutral-50 dark:bg-neutral-950/80 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-12 text-left">
          {/* Handshake steps navigator (Left column: 5 cols) */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-border/80 bg-neutral-100/30 dark:bg-neutral-950/40 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono ml-2">USMP Handshake Trace</span>
              </div>
              <div className="space-y-3">
                {handshakeSteps.map((step, idx) => (
                  <button
                    key={idx}
                    id={`handshake-step-btn-${idx}`}
                    type="button"
                    onClick={() => setActiveHandshakeStep(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                      activeHandshakeStep === idx
                        ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground shadow-md shadow-emerald-500/5'
                        : 'border-border/40 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900/40 text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    <div
                      className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg text-xs font-mono font-bold ${
                        activeHandshakeStep === idx
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold font-mono leading-tight ${activeHandshakeStep === idx ? 'text-foreground' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {step.title}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-normal line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Encryptor Box */}
            <div className="mt-8 border-t border-border/40 pt-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-bold block mb-2">
                Live Telemetry Encrypter
              </span>
              <div className="bg-neutral-50 dark:bg-black/60 rounded-lg p-3 border border-border/40">
                <label className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono block mb-1">
                  Type telemetry payload:
                </label>
                <input
                  type="text"
                  id="live-telemetry-input"
                  value={telemetryInput}
                  onChange={(e) => setTelemetryInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-emerald-600 dark:text-emerald-400 font-mono focus:outline-none border-b border-border/40 pb-1"
                />
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">Encrypted USMP Frame:</span>
                    <LuLock className="size-3 text-emerald-500 animate-pulse" />
                  </div>
                  <div className="bg-neutral-100/80 dark:bg-black/90 p-2 rounded text-[10px] font-mono text-neutral-700 dark:text-neutral-300 break-all select-all select-none border border-border/30">
                    {encryptedHex}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal details (Right column: 7 cols) */}
          <div className="md:col-span-7 bg-white dark:bg-black p-6 flex flex-col justify-between h-full min-h-[460px]">
            {/* Terminal Top */}
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-border/40 pb-3">
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <LuTerminal className="size-4" /> debug_session_monitor
                </span>
                <span className="text-[10px] uppercase font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">
                  {handshakeSteps[activeHandshakeStep].direction === 'forward' ? 'Client -> Server' : 'Server -> Client'}
                </span>
              </div>

              {/* Console log outputs */}
              <div className="space-y-2 font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950/40 p-4 rounded-lg border border-border/40 mb-6">
                {handshakeSteps[activeHandshakeStep].terminalLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-neutral-400 dark:text-neutral-600 select-none">&gt;</span>
                    <span className={log.startsWith('[System]') ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : log.includes('VERIFIED') ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Packet Wire Structure */}
            <div className="border-t border-border/40 pt-4 mt-auto">
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono block mb-2">
                Wire Frame Payload JSON:
              </span>
              <pre className="p-4 overflow-x-auto text-[11px] leading-5 font-mono text-emerald-600 dark:text-emerald-400 bg-neutral-50 dark:bg-neutral-950 border border-border/40 rounded-xl">
                <code>{JSON.stringify(handshakeSteps[activeHandshakeStep].payload, null, 2)}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM (The Compromise) */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Problem description text */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
              THE PROBLEM (The Compromise)
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Stop choosing between performance and security.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              For too long, IoT developers have been forced to compromise when connecting hardware.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-xs mt-1">
                  ✗
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground font-sans">Raw Sockets (TCP/UDP)</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Extremely fast and lightweight, but completely open to eavesdropping, spoofing, and tampering.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-xs mt-1">
                  ✗
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground font-sans">Full TLS / DTLS</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Rock-solid security, but massive. It consumes 60–100 KB of flash, wastes precious active RAM, slows down handshakes, and requires complex certificate authority (CA) infrastructures that are painful to manage on fleets of microcontrollers.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 pt-6">
              <p className="text-base font-semibold text-foreground">
                <span className="text-emerald-500 font-bold">USMP fills this gap.</span> It gives you production-grade cryptographic tunnels using a memory footprint so small it runs on standard breadboard controllers.
              </p>
            </div>
          </div>

          {/* Matrix table container */}
          <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-neutral-50 dark:bg-neutral-950/40 p-1 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/60 bg-neutral-100 dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300">
                    <th className="p-4 font-bold text-neutral-900 dark:text-neutral-200">Feature</th>
                    <th className="p-4 font-semibold">Raw Sockets</th>
                    <th className="p-4 font-semibold">TLS / DTLS</th>
                    <th className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">USMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-neutral-600 dark:text-neutral-400">
                  <tr>
                    <td className="p-4 font-bold text-foreground font-sans">Authentication</td>
                    <td className="p-4 text-red-600 dark:text-red-400 font-medium">None (Vulnerable)</td>
                    <td className="p-4">Certificate-based (Complex CA)</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">Mutual Pre-Shared Key (HMAC-SHA256)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground font-sans">Confidentiality</td>
                    <td className="p-4 text-red-600 dark:text-red-400 font-medium">None (Plaintext)</td>
                    <td className="p-4">Enforced</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">Enforced (AES-256-GCM)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground font-sans">Flash Footprint</td>
                    <td className="p-4">~0 KB</td>
                    <td className="p-4">60 - 100 KB</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10 text-sm">&lt; 10 KB</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground font-sans">Persistent RAM</td>
                    <td className="p-4">~0 KB</td>
                    <td className="p-4">20 - 40 KB</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10 text-sm">112 Bytes</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-foreground font-sans">Handshake Speed</td>
                    <td className="p-4">Instant</td>
                    <td className="p-4 font-sans text-neutral-600 dark:text-neutral-500">Slow (Multiple Roundtrips)</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">Fast (4-step, 10-30ms)</td>
                  </tr>
                  <tr className="border-b-0">
                    <td className="p-4 font-bold text-foreground font-sans">Forward Secrecy</td>
                    <td className="p-4 text-red-600 dark:text-red-400">No</td>
                    <td className="p-4">Yes</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">Yes (X25519)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE CRYPTOGRAPHIC GUARANTEES */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
            SECURITY ASSURANCE
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
            Built-in Hardening. No "Insecure Mode."
          </h2>
          <p className="mt-4 text-muted-foreground">
            Unlike other IoT protocols that treat encryption as an optional flag, USMP enforces modern cryptographic pipelines by default.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mutual Authentication */}
          <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
              <LuKey className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground font-sans">Mutual Authentication (HMAC-SHA256)</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
                Both the device and the gateway prove their identity before a session is active. By using HMAC-SHA256 proofs bound to the handshake, you prevent Man-in-the-Middle (MITM) attacks. The pre-shared key (PSK) is never sent over the wire.
              </p>
            </div>
          </div>

          {/* Perfect Forward Secrecy */}
          <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
              <LuHistory className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground font-sans">Perfect Forward Secrecy (X25519)</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
                A new, ephemeral X25519 key exchange occurs at the start of every session. If the master PSK is leaked in the future, past recorded traffic remains completely secure and undecipherable.
              </p>
            </div>
          </div>

          {/* Authenticated Encryption */}
          <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
              <LuLock className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground font-sans">Authenticated Encryption (AES-256-GCM)</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
                All post-handshake payload data is encrypted. The GCM authentication tag ensures that if any part of the frame is modified or tampered with in transit, decryption fails instantly and the session drops.
              </p>
            </div>
          </div>

          {/* Replay and Nonce Collision Protection */}
          <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
              <LuActivity className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground font-sans">Replay and Nonce Collision Protection</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
                Strict, monotonic 32-bit sequence numbers are verified for every frame. AES-GCM nonces are constructed as <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">seq (4 bytes) || session_id[0..7]</code> to eliminate any risks of nonce collisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ONE PROTOCOL. EVERY TRANSPORT. */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
            PHYSICAL LAYER AGNOSTIC
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
            Decoupled from the network. Build once, run anywhere.
          </h2>
          <p className="mt-4 text-muted-foreground">
            USMP runs at the session layer. It is designed to be completely transport-agnostic, wrapping your payloads inside a secure cryptographic envelope before handing it down to your interface.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* TCP Sockets */}
          <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                <LuGlobe className="size-5" />
              </div>
              <h3 className="font-bold text-base text-foreground font-sans">TCP Sockets</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-normal">
                Run secure, stream-oriented connections over standard TCP networks. Ideal for constant gateway reporting.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">Production-Ready</span>
              <span className="text-[9px] font-mono text-neutral-500">Wi-Fi / Ethernet</span>
            </div>
          </div>

          {/* UDP Sockets */}
          <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                <LuWorkflow className="size-5" />
              </div>
              <h3 className="font-bold text-base text-foreground font-sans">UDP Sockets</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-normal">
                Secure your connectionless UDP packets. USMP includes transparent packet fragmentation, reassembly, and reliability overlays to ensure smooth delivery.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">Production-Ready</span>
              <span className="text-[9px] font-mono text-neutral-500">Lossy Networks</span>
            </div>
          </div>

          {/* Hot-Swappable Transports */}
          <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                <LuRefreshCw className="size-5" />
              </div>
              <h3 className="font-bold text-base text-foreground font-sans">Hot-Swappable</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-normal">
                Swap physical transport layers dynamically at runtime (e.g. fallback from Wi-Fi TCP to cellular UDP, or wired UART) without changing a single line of your application logic or session state configuration.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
              <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">Runtime Interchange</span>
              <span className="text-[9px] font-mono text-neutral-500">Failover Ready</span>
            </div>
          </div>

          {/* UART, BLE & RF */}
          <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-neutral-950/20 flex flex-col justify-between hover:border-indigo-500/20 transition-colors group">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <LuCpu className="size-5" />
              </div>
              <h3 className="font-bold text-base text-foreground font-sans">UART, BLE & RF</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 font-normal">
                Secure local serial buses and wireless Bluetooth smart devices. You can wrap UART or BLE packets with the exact same cryptographic envelope using only 5 platform hooks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Coming Soon</span>
              <span className="text-[9px] font-mono text-neutral-600">Local Serial / RF</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEVELOPER EXPERIENCE (Interactive Code Tabs) */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
            DEVELOPER EXPERIENCE
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
            Three function calls to secure your sockets.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Zero boilerplate. USMP handles state machines, key derivation, and cryptographic wrapping under the hood.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls / explanation on left (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-bold block">
                Platform Drivers
              </span>
              <h3 className="text-2xl font-bold font-sans text-foreground">
                Consistently simple APIs across targets.
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground font-normal">
                USMP is built in clean, portable C99 and compiled natively into wrappers for Arduino (C++) and Python (asyncio). This allows the gateway and the device to share a symmetrical, highly optimized protocol layer.
              </p>
            </div>

            {/* Selector buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setActiveCodeTab('esp32')}
                className={`w-full text-left px-4 py-3.5 rounded-xl border font-mono text-xs flex justify-between items-center transition-all ${
                  activeCodeTab === 'esp32'
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground font-bold shadow-md shadow-emerald-500/5'
                    : 'border-border bg-neutral-50 dark:bg-card hover:bg-muted/65 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span>ESP32 (C / ESP-IDF)</span>
                <LuChevronRight className={`size-4 transition-transform ${activeCodeTab === 'esp32' ? 'text-emerald-500 translate-x-0.5' : 'text-neutral-500'}`} />
              </button>
              
              <button
                type="button"
                onClick={() => setActiveCodeTab('arduino')}
                className={`w-full text-left px-4 py-3.5 rounded-xl border font-mono text-xs flex justify-between items-center transition-all ${
                  activeCodeTab === 'arduino'
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground font-bold shadow-md shadow-emerald-500/5'
                    : 'border-border bg-neutral-50 dark:bg-card hover:bg-muted/65 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span>Arduino (C++ / ESP32)</span>
                <LuChevronRight className={`size-4 transition-transform ${activeCodeTab === 'arduino' ? 'text-emerald-500 translate-x-0.5' : 'text-neutral-500'}`} />
              </button>

              <button
                type="button"
                onClick={() => setActiveCodeTab('python')}
                className={`w-full text-left px-4 py-3.5 rounded-xl border font-mono text-xs flex justify-between items-center transition-all ${
                  activeCodeTab === 'python'
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-foreground font-bold shadow-md shadow-emerald-500/5'
                    : 'border-border bg-neutral-50 dark:bg-card hover:bg-muted/65 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <span>Gateway Server (Python Async)</span>
                <LuChevronRight className={`size-4 transition-transform ${activeCodeTab === 'python' ? 'text-emerald-500 translate-x-0.5' : 'text-neutral-500'}`} />
              </button>
            </div>
          </div>

          {/* High-fidelity Editor Window on right (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-border/80 bg-neutral-100 dark:bg-neutral-950 p-1 shadow-2xl flex flex-col justify-between">
            {/* Header / Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-neutral-200/50 dark:bg-neutral-900/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                {/* Mac buttons */}
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 ml-3">
                  {activeCodeTab === 'esp32' ? 'main.c' : activeCodeTab === 'arduino' ? 'device_node.ino' : 'server.py'}
                </span>
              </div>

              {/* Copy button */}
              <button
                type="button"
                onClick={() => copyToClipboard(codeSnippets[activeCodeTab])}
                className="flex items-center gap-1 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 px-2.5 py-1 rounded transition-colors"
              >
                {copiedCode ? (
                  <>
                    <LuCheck className="size-3 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <LuCopy className="size-3" /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-6 overflow-auto bg-neutral-50 dark:bg-neutral-950 font-mono text-xs md:text-sm leading-6 md:leading-7 text-neutral-800 dark:text-neutral-300 rounded-b-xl flex-1 max-h-[350px]">
              <pre>
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. RESOURCE FOOTPRINT & PERFORMANCE */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Comparison benchmarks on left (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/40 pb-4">
              <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
                RESOURCE BENCHMARKS
              </span>
              <div className="flex gap-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 p-1 border border-border">
                <button
                  type="button"
                  id="benchmark-toggle-rom"
                  onClick={() => setBenchmarkMetric('rom')}
                  className={`px-3 py-1.5 text-[10px] font-mono font-semibold rounded transition-all ${
                    benchmarkMetric === 'rom'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-border/20 dark:border-none'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
                  }`}
                >
                  Flash Footprint
                </button>
                <button
                  type="button"
                  id="benchmark-toggle-ram"
                  onClick={() => setBenchmarkMetric('ram')}
                  className={`px-3 py-1.5 text-[10px] font-mono font-semibold rounded transition-all ${
                    benchmarkMetric === 'ram'
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-border/20 dark:border-none'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
                  }`}
                >
                  Persistent RAM
                </button>
              </div>
            </div>

            {/* Benchmark display box */}
            <div className="p-6 rounded-2xl border border-border/60 bg-neutral-50 dark:bg-neutral-950/40 space-y-6">
              {benchmarkMetric === 'rom' ? (
                <>
                  <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono tracking-wider">
                    Compiled Binary Size on MCU (Flash bytes)
                  </h4>
                  {/* Bar 1: USMP */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>USMP Core Driver</span>
                      <span className="text-emerald-500">&lt; 10 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden border border-border/30">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '8%' }} />
                    </div>
                  </div>
                  {/* Bar 2: TinyDTLS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      <span>TinyDTLS Stack</span>
                      <span>48 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                      <div className="h-full bg-neutral-400 dark:bg-neutral-700 rounded-full transition-all duration-500" style={{ width: '48%' }} />
                    </div>
                  </div>
                  {/* Bar 3: Standard TLS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      <span>MbedTLS Stack (Full TLS Client)</span>
                      <span>100 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                      <div className="h-full bg-neutral-500 dark:bg-neutral-800 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono tracking-wider">
                    Persistent Stack/Heap Memory Overhead (Active RAM)
                  </h4>
                  {/* Bar 1: USMP */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>USMP Session State Context</span>
                      <span className="text-emerald-500">112 Bytes (0 dynamic allocations)</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden border border-border/30">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: '2.5%' }} />
                    </div>
                  </div>
                  {/* Bar 2: TinyDTLS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      <span>TinyDTLS Context (Handshake buffers)</span>
                      <span>8 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                      <div className="h-full bg-neutral-400 dark:bg-neutral-700 rounded-full transition-all duration-500" style={{ width: '25%' }} />
                    </div>
                  </div>
                  {/* Bar 3: Standard TLS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      <span>MbedTLS (Min Handshake Allocation)</span>
                      <span>40 KB</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                      <div className="h-full bg-neutral-500 dark:bg-neutral-800 rounded-full transition-all duration-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </>
              )}
              <div className="text-[11px] text-muted-foreground mt-4 leading-relaxed font-sans">
                * ROM sizes calculated using stripped release-optimized GCC compiler on Xtensa LX7 cores. 
                RAM usage represents persistent active memory required to maintain connection states.
              </div>
            </div>
          </div>

          {/* Performance copy on right (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
              PERFORMANCE OVERVIEW
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Engineered for resource-constrained environments.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Low-power microcontrollers lack the multi-megabyte pools of RAM required to maintain active TLS sockets. We built USMP to guarantee security targets within strict memory boundaries.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <LuCpu className="size-5.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground font-sans">112 Bytes Persistent RAM</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    The entire session context uses just 112 bytes of SRAM. Once the handshake is complete, the driver performs <strong>zero dynamic heap allocations</strong>, completely eliminating the risk of memory fragmentation on long-running devices.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <LuZap className="size-5.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground font-sans">Zero CPU Idle Cost</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    All post-handshake encryption and decryption is backed by the ESP32’s hardware-accelerated cryptographic engine, completing operations in under 1 millisecond.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <LuLayers className="size-5.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-foreground font-sans">Built-in Fragmentation</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Transparently chunk large payloads (up to ~1.8 KB) into 4 sequential 452-byte frames and reassemble them at the destination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
            FAQ
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Clear up common questions about integration, security properties, and protocol operations.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Why not just use TLS / DTLS?',
              a: 'TLS is excellent but too heavy for resource-constrained controllers. It occupies 60–100 KB of Flash and requires up to 40 KB of active RAM, along with complex root certificate (CA) verification. USMP was built specifically for microcontrollers, requiring under 10 KB of Flash and exactly 112 bytes of persistent RAM while maintaining comparable cryptographic guarantees.',
            },
            {
              q: 'Is it secure without asymmetric certificates?',
              a: 'Yes. USMP uses Mutual Pre-Shared Key (PSK) authentication via HMAC-SHA256. To ensure secrecy, an ephemeral X25519 key exchange occurs at the start of each session. Even if the pre-shared key is leaked later, past sessions cannot be decrypted (Perfect Forward Secrecy).',
            },
            {
              q: 'How should I provision the PSK in production?',
              a: 'Do not hardcode the PSK in your source code. We recommend writing the PSK to the ESP32\'s secure, encrypted Non-Volatile Storage (NVS) partition or a dedicated hardware security module (HSM) during manufacturing.',
            },
            {
              q: 'What is the battery/power consumption impact?',
              a: 'Extremely low. Once the 4-step handshake completes, USMP uses symmetric AES-256-GCM encryption. The ESP32\'s on-chip hardware cryptographic engines accelerate this math, allowing packets to be encrypted/decrypted in under 1 millisecond with negligible battery draw.',
            },
            {
              q: 'Does it support packet fragmentation?',
              a: 'Yes. USMP automatically fragments payloads larger than 452 bytes into up to 4 sequential frames (maxing out at ~1.8 KB) and reassembles them transparently on the receiving side.',
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card/40 overflow-hidden hover:border-emerald-500/10 transition-colors">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-foreground hover:bg-neutral-900/10 transition-colors duration-150 font-sans"
              >
                <span>{item.q}</span>
                <LuChevronDown
                  className={`size-4 text-neutral-500 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openFaq === idx ? 'max-h-60 border-t border-border/30 p-5' : 'max-h-0'
                } overflow-hidden bg-neutral-50 dark:bg-neutral-950/20 text-sm text-muted-foreground leading-relaxed`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. INTEGRATION & CALL-TO-ACTION */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative text-center">
        <div className="p-8 sm:p-16 rounded-3xl bg-neutral-50 dark:bg-neutral-950 border border-border relative overflow-hidden flex flex-col items-center">
          <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-500 font-bold block mb-4">
            QUICK INSTALLATION
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl max-w-2xl font-sans">
            Securing your fleet is just a command away.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Import the client library into your embedded compiler or spin up a server gateway in minutes.
          </p>

          {/* Interactive Install Widget */}
          <div className="mt-10 w-full max-w-lg bg-neutral-100 dark:bg-black rounded-xl border border-border/80 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-border/40 bg-neutral-200/50 dark:bg-neutral-900/60 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCliPlatform('python')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeCliPlatform === 'python' ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
                }`}
              >
                Python Server
              </button>
              <button
                type="button"
                onClick={() => setActiveCliPlatform('esp32')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeCliPlatform === 'esp32' ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
                }`}
              >
                ESP-IDF
              </button>
              <button
                type="button"
                onClick={() => setActiveCliPlatform('arduino')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeCliPlatform === 'arduino' ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
                }`}
              >
                Arduino
              </button>
            </div>

            {/* CLI Command Line */}
            <div className="p-5 flex justify-between items-center text-xs font-mono text-neutral-800 dark:text-neutral-300 text-left">
              {activeCliPlatform === 'python' && (
                <>
                  <span className="text-emerald-600 dark:text-emerald-400 select-none mr-2">$</span>
                  <span className="flex-1">pip install usmp</span>
                  <button
                    type="button"
                    onClick={() => copyCliCommand('pip install usmp', 'python')}
                    className="ml-3 text-[10px] text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded shrink-0 transition-colors"
                  >
                    {copiedCli === 'python' ? 'Copied' : 'Copy'}
                  </button>
                </>
              )}

              {activeCliPlatform === 'esp32' && (
                <>
                  <span className="text-emerald-600 dark:text-emerald-400 select-none mr-2">$</span>
                  <span className="flex-1 break-all">idf.py add-dependency "metaloomlabs/usmp"</span>
                  <button
                    type="button"
                    onClick={() => copyCliCommand('idf.py add-dependency "metaloomlabs/usmp"', 'esp32')}
                    className="ml-3 text-[10px] text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded shrink-0 transition-colors"
                  >
                    {copiedCli === 'esp32' ? 'Copied' : 'Copy'}
                  </button>
                </>
              )}

              {activeCliPlatform === 'arduino' && (
                <>
                  <span className="flex-1 flex items-center gap-2">
                    <LuDownload className="size-4 text-emerald-600 dark:text-emerald-500" />
                    <span>Download standard ZIP library package</span>
                  </span>
                  <a
                    href="https://github.com/metaloomlabs/usmp/archive/refs/tags/v1.0.0.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-500 bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded shrink-0 transition-colors"
                  >
                    Download ZIP
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Primary CTA */}
          <div className="mt-10">
            <Link
              href="/docs/getting-started/installation"
              className={buttonVariants({
                className:
                  'gap-2 px-8 py-5.5 bg-foreground text-background hover:bg-foreground/90 font-bold rounded-xl text-sm transition-all',
                size: 'lg',
              })}
            >
              Read Getting Started Guide
              <LuArrowRight className="size-4" />
            </Link>
          </div>

          {/* Symmetrical footer-like layout for integration links */}
          <div className="mt-12 pt-6 border-t border-border/20 w-full flex flex-wrap justify-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
            <a
              href="https://github.com/metaloomlabs/usmp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-500 transition-colors flex items-center gap-1.5"
            >
              <LuGithub className="size-3.5" /> Github Repository
            </a>
            <span className="text-neutral-350 dark:text-neutral-800 select-none">|</span>
            <Link
              href="/docs/sdk/python"
              className="hover:text-emerald-500 transition-colors"
            >
              API Reference
            </Link>
            <span className="text-neutral-350 dark:text-neutral-800 select-none">|</span>
            <Link
              href="/docs/protocol/overview"
              className="hover:text-emerald-500 transition-colors"
            >
              Security Whitepaper
            </Link>
            <span className="text-neutral-350 dark:text-neutral-800 select-none">|</span>
            <a
              href="https://github.com/metaloomlabs/usmp/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-500 transition-colors"
            >
              Apache 2.0 License
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
