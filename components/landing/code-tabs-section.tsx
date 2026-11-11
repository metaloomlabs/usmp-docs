'use client'

import { useState } from 'react'
import { LuCheck, LuChevronRight, LuCopy } from 'react-icons/lu'

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
    await session.send(b"Decrypted successfully!")`,
}

export function CodeTabsSection() {
  const [activeCodeTab, setActiveCodeTab] = useState<'esp32' | 'arduino' | 'python'>('esp32')
  const [copiedCode, setCopiedCode] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
          DEVELOPER EXPERIENCE
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
          Three function calls to secure your sockets.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Zero boilerplate. USMP handles state machines, key derivation, and cryptographic wrapping
          under the hood.
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
              USMP is built in clean, portable C99 and compiled natively into wrappers for Arduino
              (C++) and Python (asyncio). This allows the gateway and the device to share a
              symmetrical, highly optimized protocol layer.
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
              <LuChevronRight
                className={`size-4 transition-transform ${activeCodeTab === 'esp32' ? 'text-emerald-500 translate-x-0.5' : 'text-neutral-500'}`}
              />
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
              <LuChevronRight
                className={`size-4 transition-transform ${activeCodeTab === 'arduino' ? 'text-emerald-500 translate-x-0.5' : 'text-neutral-500'}`}
              />
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
              <LuChevronRight
                className={`size-4 transition-transform ${activeCodeTab === 'python' ? 'text-emerald-500 translate-x-0.5' : 'text-neutral-500'}`}
              />
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
                {activeCodeTab === 'esp32'
                  ? 'main.c'
                  : activeCodeTab === 'arduino'
                    ? 'device_node.ino'
                    : 'server.py'}
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
  )
}
