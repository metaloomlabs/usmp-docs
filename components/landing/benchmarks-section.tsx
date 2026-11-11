'use client'

import { useState } from 'react'
import { LuCpu, LuLayers, LuZap } from 'react-icons/lu'

export function BenchmarksSection() {
  const [benchmarkMetric, setBenchmarkMetric] = useState<'rom' | 'ram'>('rom')

  return (
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
                <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono tracking-wider">
                  Compiled Binary Size on MCU (Flash bytes)
                </div>
                {/* Bar 1: USMP */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>USMP Core Driver</span>
                    <span className="text-emerald-500">&lt; 10 KB</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden border border-border/30">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: '8%' }}
                    />
                  </div>
                </div>
                {/* Bar 2: TinyDTLS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                    <span>TinyDTLS Stack</span>
                    <span>48 KB</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-neutral-400 dark:bg-neutral-700 rounded-full transition-all duration-500"
                      style={{ width: '48%' }}
                    />
                  </div>
                </div>
                {/* Bar 3: Standard TLS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                    <span>MbedTLS Stack (Full TLS Client)</span>
                    <span>100 KB</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-neutral-500 dark:bg-neutral-800 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300 font-mono tracking-wider">
                  Persistent Stack/Heap Memory Overhead (Active RAM)
                </div>
                {/* Bar 1: USMP */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span>USMP Session State Context</span>
                    <span className="text-emerald-500">112 Bytes (0 dynamic allocations)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden border border-border/30">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: '2.5%' }}
                    />
                  </div>
                </div>
                {/* Bar 2: TinyDTLS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                    <span>TinyDTLS Context (Handshake buffers)</span>
                    <span>8 KB</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-neutral-400 dark:bg-neutral-700 rounded-full transition-all duration-500"
                      style={{ width: '25%' }}
                    />
                  </div>
                </div>
                {/* Bar 3: Standard TLS */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                    <span>MbedTLS (Min Handshake Allocation)</span>
                    <span>40 KB</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                    <div
                      className="h-full bg-neutral-500 dark:bg-neutral-800 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="text-[11px] text-muted-foreground mt-4 leading-relaxed font-sans">
              * ROM sizes calculated using stripped release-optimized GCC compiler on Xtensa LX7
              cores. RAM usage represents persistent active memory required to maintain connection
              states.
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
            Low-power microcontrollers lack the multi-megabyte pools of RAM required to maintain
            active TLS sockets. We built USMP to guarantee security targets within strict memory
            boundaries.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <LuCpu className="size-5.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  112 Bytes Persistent RAM
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  The entire session context uses just 112 bytes of SRAM. Once the handshake is
                  complete, the driver performs <strong>zero dynamic heap allocations</strong>,
                  completely eliminating the risk of memory fragmentation on long-running devices.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <LuZap className="size-5.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground font-sans">Zero CPU Idle Cost</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  All post-handshake encryption and decryption is backed by the ESP32’s
                  hardware-accelerated cryptographic engine, completing operations in under 1
                  millisecond.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <LuLayers className="size-5.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-foreground font-sans">
                  Built-in Fragmentation
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Transparently chunk large payloads (up to ~1.8 KB) into 4 sequential 452-byte
                  frames and reassemble them at the destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
