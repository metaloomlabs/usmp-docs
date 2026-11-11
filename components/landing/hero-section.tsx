'use client'

import { useEffect, useState } from 'react'
import { FaDiscord } from 'react-icons/fa6'
import { LuArrowRight, LuArrowUpRight, LuLock, LuShieldCheck, LuTerminal } from 'react-icons/lu'

import { buttonVariants } from '@/components/ui/button'
import { PageRoutes } from '@/lib/pageroutes'
import { Link } from '@/lib/transition'
import { cn } from '@/lib/utils'

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

export function HeroSection() {
  const [activeHandshakeStep, setActiveHandshakeStep] = useState(0)
  const [telemetryInput, setTelemetryInput] = useState('{"temp":24.5,"status":"OK"}')
  const [encryptedHex, setEncryptedHex] = useState('')

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

  return (
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
        USMP (Unified Secure Multi-transport Protocol) brings end-to-end encrypted, mutually
        authenticated, and forward-secret communication tunnels to{' '}
        <span className="text-foreground font-semibold">ESP32</span>,{' '}
        <span className="text-foreground font-semibold">Arduino</span>, and{' '}
        <span className="text-foreground font-semibold">Python</span> without the massive flash and
        RAM overhead of a full TLS stack.
      </p>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href={`/docs${PageRoutes[0].href}`}
          className={cn(
            buttonVariants({ size: 'lg' }),
            'gap-2 px-8 py-6 bg-black dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-bold transition-all duration-200 shadow-lg shadow-black/10 dark:shadow-white/10 text-base rounded-xl border border-black dark:border-white active:translate-y-px'
          )}
        >
          Get Started with SDKs
          <LuArrowRight className="size-5" />
        </Link>
        <a
          href="https://discord.gg/NsNzt6Psj5"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'gap-2 px-8 py-6 bg-black dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 font-bold transition-all duration-200 shadow-lg shadow-black/10 dark:shadow-white/10 text-base rounded-xl border border-black dark:border-white active:translate-y-px'
          )}
        >
          <FaDiscord className="size-5 text-white dark:text-[#5865F2]" />
          Join Community
        </a>
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
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono ml-2">
                USMP Handshake Trace
              </span>
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
                    <div
                      className={`text-sm font-semibold font-mono leading-tight ${activeHandshakeStep === idx ? 'text-foreground' : 'text-neutral-700 dark:text-neutral-300'}`}
                    >
                      {step.title}
                    </div>
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
              <label
                htmlFor="live-telemetry-input"
                className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono block mb-1"
              >
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
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono">
                    Encrypted USMP Frame:
                  </span>
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
                {handshakeSteps[activeHandshakeStep].direction === 'forward'
                  ? 'Client -> Server'
                  : 'Server -> Client'}
              </span>
            </div>

            {/* Console log outputs */}
            <div className="space-y-2 font-mono text-xs leading-relaxed text-neutral-800 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950/40 p-4 rounded-lg border border-border/40 mb-6">
              {handshakeSteps[activeHandshakeStep].terminalLogs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-neutral-400 dark:text-neutral-600 select-none">&gt;</span>
                  <span
                    className={
                      log.startsWith('[System]')
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : log.includes('VERIFIED')
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-neutral-800 dark:text-neutral-300'
                    }
                  >
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
  )
}
