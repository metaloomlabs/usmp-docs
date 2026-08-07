'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LuDownload,
  LuSparkles,
  LuCpu,
  LuTerminal,
  LuCheck,
  LuCopy,
  LuExternalLink,
  LuBox,
  LuArchive,
  LuTag,
  LuCalendar,
  LuLayers,
  LuShieldCheck,
  LuLock,
  LuZap,
  LuCode,
  LuHash,
  LuArrowRight,
} from 'react-icons/lu'
import { buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

const V110_SHA256 = '54aa90c05e2729d5f3f9cc8974340f043de29e082d18babe542f04604fcf7278'

export function DownloadsView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => {
      setCopiedKey(null)
    }, 2000)
  }

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shadow-xs">
          <LuSparkles className="w-3.5 h-3.5 shrink-0" />
          <span>v1.1.0 • Recommended Production Release</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Downloads & Releases
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Official production packages, offline Arduino ZIP libraries, PyPI SDKs, and ESP-IDF component registries for USMP.
        </p>

        {/* Quick Navigation Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium">
          <a
            href="#featured-release"
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors"
          >
            v1.1.0 Latest Release
          </a>
          <a
            href="#package-managers"
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors"
          >
            Package Managers
          </a>
          <a
            href="#release-matrix"
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors"
          >
            Release Matrix
          </a>
          <a
            href="#integrity-verification"
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors"
          >
            SHA-256 Verification
          </a>
        </div>
      </div>

      {/* Featured Flagship Release Banner - v1.1.0 */}
      <section
        id="featured-release"
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/5 p-6 sm:p-8 shadow-md transition-all hover:border-primary/50"
      >
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground shadow-xs">
                RECOMMENDED STABLE
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                <LuTag className="w-4 h-4 text-primary" /> v1.1.0
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <LuCalendar className="w-3.5 h-3.5" /> Released July 25, 2026
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                Apache-2.0 / MIT
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              USMP v1.1.0 — Reliable UDP & Enhanced Hardware Support
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              <strong>v1.1.0</strong> is the recommended stable release line (v1.1.0). It introduces reliable connectionless UDP transport layer support with automatic sliding-window acknowledgments, key rotation safety enhancements, and updated Arduino wrapper libraries without breaking API changes.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-foreground/90 font-medium">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuZap className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">Reliable UDP Session Demultiplexing</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuCpu className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">ESP32 Hardware AES-GCM Acceleration</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">Zero-Dynamic-Allocation Memory Footprint</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuBox className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">ESP-IDF v5.x Native Component Support</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="flex flex-col gap-3 shrink-0 lg:w-80 bg-background/90 p-5 rounded-xl border border-border shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Primary Download Target
            </div>
            
            <a
              href="/usmp-1.1.0-arduino.zip"
              download
              className={buttonVariants({
                variant: 'default',
                size: 'lg',
                className: 'w-full gap-2.5 font-bold text-sm shadow-sm hover:scale-[1.01] transition-transform',
              })}
            >
              <LuDownload className="w-5 h-5" />
              <span>Download v1.1.0 ZIP</span>
            </a>

            <div className="text-center text-xs text-muted-foreground font-medium">
              Arduino & PlatformIO Offline Library (35.0 KB)
            </div>

            <div className="border-t border-border pt-3 mt-1 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold flex items-center gap-1">
                  <LuHash className="w-3.5 h-3.5 text-primary" /> SHA-256 Checksum:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(V110_SHA256, 'hero-sha')}
                  className="text-xs text-primary hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'hero-sha' ? (
                    <>
                      <LuCheck className="w-3 h-3 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <LuCopy className="w-3 h-3" /> Copy Hash
                    </>
                  )}
                </button>
              </div>

              <div className="p-2 rounded bg-muted/80 font-mono text-[11px] text-foreground break-all border border-border select-all">
                {V110_SHA256}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Managers & Quick Install Guide (Tabbed Interface) */}
      <section id="package-managers" className="space-y-6">
        <div className="border-b pb-4">
          <div className="flex items-center gap-2">
            <LuTerminal className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Package Managers & Integration</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Integrate USMP v1.1.0 into your build system or package environment with standard dependency commands.
          </p>
        </div>

        <Tabs defaultValue="arduino" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-muted/80 border border-border rounded-xl">
            <TabsTrigger value="arduino" className="gap-2 py-2.5 font-semibold text-xs sm:text-sm">
              <LuCpu className="w-4 h-4" /> Arduino IDE
            </TabsTrigger>
            <TabsTrigger value="pypi" className="gap-2 py-2.5 font-semibold text-xs sm:text-sm">
              <LuTerminal className="w-4 h-4" /> Python PyPI
            </TabsTrigger>
            <TabsTrigger value="espidf" className="gap-2 py-2.5 font-semibold text-xs sm:text-sm">
              <LuBox className="w-4 h-4" /> ESP-IDF Registry
            </TabsTrigger>
            <TabsTrigger value="platformio" className="gap-2 py-2.5 font-semibold text-xs sm:text-sm">
              <LuCode className="w-4 h-4" /> PlatformIO
            </TabsTrigger>
          </TabsList>

          {/* Arduino Tab */}
          <TabsContent value="arduino" className="pt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Arduino IDE Offline Library (v1.1.0)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    For ESP32, ESP8266, and SAMD microcontrollers using Arduino IDE 1.8.x or 2.x.
                  </p>
                </div>
                <a
                  href="/usmp-1.1.0-arduino.zip"
                  download
                  className={buttonVariants({ variant: 'default', size: 'sm', className: 'gap-2 font-semibold shrink-0' })}
                >
                  <LuDownload className="w-4 h-4" /> Download v1.1.0 ZIP (35 KB)
                </a>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="font-semibold text-foreground text-sm">Installation Steps:</div>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm">
                  <li>Download <strong>usmp-1.1.0-arduino.zip</strong> using the button above.</li>
                  <li>In Arduino IDE, go to menu: <code>Sketch</code> ➔ <code>Include Library</code> ➔ <code>Add .ZIP Library...</code></li>
                  <li>Select the downloaded <code>usmp-1.1.0-arduino.zip</code> archive.</li>
                  <li>Include header in your code: <code>#include &lt;USMP.h&gt;</code>.</li>
                </ol>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2 border border-border">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Quick Test Sketch Header</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`#include <USMP.h>\n\nUSMPNode node;\nvoid setup() {\n  Serial.begin(115200);\n  node.begin("DEVICE_SECRET_KEY");\n}`, 'code-arduino')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'code-arduino' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'code-arduino' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 rounded bg-background border border-border">
{`#include <USMP.h>

USMPNode node;

void setup() {
  Serial.begin(115200);
  node.begin("DEVICE_SECRET_KEY");
}`}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* Python PyPI Tab */}
          <TabsContent value="pypi" className="pt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Python PyPI Package (v1.1.0)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Asynchronous Python client/gateway library supporting Python 3.9 through 3.13.
                  </p>
                </div>
                <a
                  href="https://pypi.org/project/usmp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-2 font-semibold shrink-0' })}
                >
                  <LuExternalLink className="w-4 h-4" /> View on PyPI
                </a>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-foreground text-sm">Install Command:</div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border font-mono text-xs sm:text-sm text-foreground">
                  <code>pip install usmp</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('pip install usmp', 'cmd-pip')}
                    className="p-1.5 rounded hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedKey === 'cmd-pip' ? <LuCheck className="w-4 h-4 text-emerald-500" /> : <LuCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2 border border-border">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Python Integration Example</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`import asyncio\nfrom usmp import USMPGateway\n\nasync def main():\n    gw = USMPGateway(port=9000)\n    await gw.start()\n\nasyncio.run(main())`, 'code-pypi')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'code-pypi' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'code-pypi' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 rounded bg-background border border-border">
{`import asyncio
from usmp import USMPGateway

async def main():
    gw = USMPGateway(port=9000)
    await gw.start()

asyncio.run(main())`}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* ESP-IDF Tab */}
          <TabsContent value="espidf" className="pt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">ESP-IDF Component Registry (v1.1.0)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Native C component for ESP-IDF v5.0+ development with hardware acceleration support.
                  </p>
                </div>
                <a
                  href="https://components.espressif.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-2 font-semibold shrink-0' })}
                >
                  <LuExternalLink className="w-4 h-4" /> ESP Registry
                </a>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-foreground text-sm">Add Dependency Command:</div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border font-mono text-xs sm:text-sm text-foreground">
                  <code>idf.py add-dependency metaloomlabs/usmp</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('idf.py add-dependency metaloomlabs/usmp', 'cmd-espidf')}
                    className="p-1.5 rounded hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedKey === 'cmd-espidf' ? <LuCheck className="w-4 h-4 text-emerald-500" /> : <LuCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2 border border-border">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>main/idf_component.yml</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`dependencies:\n  metaloomlabs/usmp: "*"` , 'code-espidf')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'code-espidf' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'code-espidf' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 rounded bg-background border border-border">
{`dependencies:
  metaloomlabs/usmp: "*"`}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* PlatformIO Tab */}
          <TabsContent value="platformio" className="pt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">PlatformIO Library Manager</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Direct integration into <code>platformio.ini</code> for VS Code & CLI workflows.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-semibold text-foreground text-sm">platformio.ini snippet:</div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border font-mono text-xs sm:text-sm text-foreground">
                  <code>lib_deps = metaloomlabs/usmp</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('lib_deps = metaloomlabs/usmp', 'cmd-pio')}
                    className="p-1.5 rounded hover:bg-background border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {copiedKey === 'cmd-pio' ? <LuCheck className="w-4 h-4 text-emerald-500" /> : <LuCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Primary Package Matrix Table */}
      <section id="release-matrix" className="space-y-6">
        <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <LuLayers className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Release Matrix & Direct Downloads</h2>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Side-by-side comparison of official USMP releases and direct artifact downloads.
            </p>
          </div>

          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg border border-border w-fit">
            <LuShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>v1.1.0 is the active stable release</span>
          </div>
        </div>

        <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/80 text-foreground uppercase text-[11px] font-bold border-b border-border">
                <tr>
                  <th className="py-4 px-5">Version & Status</th>
                  <th className="py-4 px-5">Release Date</th>
                  <th className="py-4 px-5">Python SDK (PyPI)</th>
                  <th className="py-4 px-5">ESP-IDF Registry</th>
                  <th className="py-4 px-5">Arduino Offline ZIP</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {/* v1.1.0 */}
                <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  <td className="py-4 px-5 font-bold text-foreground">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-primary text-primary-foreground shadow-xs">
                          v1.1.0
                        </span>
                        <span className="text-[11px] font-semibold text-primary">
                          (Latest Stable)
                        </span>
                      </div>
                      <span className="text-xs font-normal text-muted-foreground">
                        UDP Reliability & Hardware ACC
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-foreground whitespace-nowrap">
                    July 25, 2026
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1 rounded bg-background font-mono text-xs text-foreground border border-border">
                        pip install usmp
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('pip install usmp', 'tbl-pip-110')}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy pip command"
                      >
                        {copiedKey === 'tbl-pip-110' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1 rounded bg-background font-mono text-xs text-foreground border border-border">
                        metaloomlabs/usmp
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('metaloomlabs/usmp', 'tbl-idf-110')}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy ESP-IDF spec"
                      >
                        {copiedKey === 'tbl-idf-110' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        usmp-1.1.0-arduino.zip
                      </span>
                      <span className="text-[11px] text-muted-foreground">35.0 KB</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <a
                      href="/usmp-1.1.0-arduino.zip"
                      download
                      className={buttonVariants({
                        variant: 'default',
                        size: 'sm',
                        className: 'gap-1.5 text-xs font-bold shadow-xs',
                      })}
                    >
                      <LuDownload className="w-3.5 h-3.5" /> Download ZIP
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Release Notes & Highlights Accordion */}
      <section className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">What's New in v1.1.0</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed release notes for the v1.1.0 update.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
          <AccordionItem value="item-1" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuZap className="w-5 h-5 text-primary" />
                Reliable UDP Transport Layer (Sliding-Window ACKs)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                v1.1.0 adds connectionless reliable transmission over UDP. Includes dynamic RTT (Round Trip Time) calculation, exponential backoff retransmission, and sliding-window selective acknowledgments designed specifically for lossy LPWAN and cellular IoT networks.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuShieldCheck className="w-5 h-5 text-primary" />
                Zero-Heap Memory Allocation Hardening
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                All packet serialization, nonce derivation, and cipher contexts now operate on statically allocated ring buffers. This eliminates heap fragmentation risks on constrained microcontrollers like ESP32 and STM32.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuCpu className="w-5 h-5 text-primary" />
                ESP32 Hardware AES-GCM & ECDH Acceleration
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                Direct hardware binding for Espressif ESP32-S3 and ESP32-C3 hardware crypto accelerators. Achieves 4x throughput improvement on AES-256-GCM encryption with lower CPU utilization.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Security Integrity & Checksum Verification Guide */}
      <section id="integrity-verification" className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <LuShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Security & Package SHA-256 Verification</h2>
              <p className="text-xs text-muted-foreground">Verify the cryptographic integrity of downloaded archives before deployment.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Windows Verification */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/60 border border-border">
            <div className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Windows PowerShell Verification</span>
              <button
                type="button"
                onClick={() => copyToClipboard('Get-FileHash .\\usmp-1.1.0-arduino.zip -Algorithm SHA256', 'cmd-win-hash')}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                {copiedKey === 'cmd-win-hash' ? <LuCheck className="w-3 h-3 text-emerald-500" /> : <LuCopy className="w-3 h-3" />}
                <span>{copiedKey === 'cmd-win-hash' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-foreground p-3 rounded bg-background border border-border overflow-x-auto">
              Get-FileHash .\usmp-1.1.0-arduino.zip -Algorithm SHA256
            </pre>
          </div>

          {/* Linux / macOS Verification */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/60 border border-border">
            <div className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Linux / macOS Terminal Verification</span>
              <button
                type="button"
                onClick={() => copyToClipboard('sha256sum usmp-1.1.0-arduino.zip', 'cmd-nix-hash')}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                {copiedKey === 'cmd-nix-hash' ? <LuCheck className="w-3 h-3 text-emerald-500" /> : <LuCopy className="w-3 h-3" />}
                <span>{copiedKey === 'cmd-nix-hash' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-foreground p-3 rounded bg-background border border-border overflow-x-auto">
              sha256sum usmp-1.1.0-arduino.zip
            </pre>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-foreground">v1.1.0 Expected SHA-256 Output:</span>
            <div className="font-mono text-xs text-primary break-all">
              {V110_SHA256}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(V110_SHA256, 'bottom-sha')}
            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5 text-xs font-semibold shrink-0 cursor-pointer' })}
          >
            {copiedKey === 'bottom-sha' ? <LuCheck className="w-4 h-4 text-emerald-500" /> : <LuCopy className="w-4 h-4" />}
            <span>{copiedKey === 'bottom-sha' ? 'Copied Hash!' : 'Copy SHA-256'}</span>
          </button>
        </div>
      </section>
    </div>
  )
}
