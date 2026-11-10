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

const V130_SHA256 = '7474ab3e84d0c3cf8b4e178c493a8a6ad6d0ec684ed2fee918de500ceb88438f'

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
          <span>v1.3.0 • Recommended Production Release</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Downloads & Releases
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          Official production packages, Arduino Library Manager, offline Arduino ZIP libraries, PyPI SDKs, and ESP-IDF component registries for USMP.
        </p>

        {/* Quick Navigation Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium">
          <a
            href="#featured-release"
            className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors"
          >
            v1.3.0 Latest Release
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

      {/* Featured Flagship Release Banner - v1.3.0 */}
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
                <LuTag className="w-4 h-4 text-primary" /> v1.3.0
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <LuCalendar className="w-3.5 h-3.5" /> Released September 26, 2026
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                Apache-2.0 / MIT
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              USMP v1.3.0 — Zero-Heap Memory, Split RTOS Concurrency & Non-Blocking State Machine
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              <strong>v1.3.0</strong> is the recommended stable release. It introduces an asynchronous non-blocking handshake state machine, split RTOS concurrency architecture (<code>tx_mutex</code> & <code>rx_mutex</code>), zero-heap scratchpad memory and static transports, CoAP RTT estimation with watchdog protection, standard Arduino <code>Print</code> stream interface, and a built-in Python CLI dev server.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-foreground/90 font-medium">
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuZap className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">Non-Blocking Handshake FSM (usmp_step)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuLock className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">Split RTOS Concurrency (tx_mutex & rx_mutex)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuBox className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">Zero-Heap Memory & USMPClientStatic</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-background/60 border border-border/60">
                <LuShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm">CoAP RTT Estimation & Watchdog Protection</span>
              </div>
            </div>
          </div>

          {/* Action Box */}
          <div className="flex flex-col gap-3 shrink-0 lg:w-80 bg-background/90 p-5 rounded-xl border border-border shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Primary Download Target
            </div>
            
            <a
              href="/usmp-1.3.0-arduino.zip"
              download
              className={buttonVariants({
                variant: 'default',
                size: 'lg',
                className: 'w-full gap-2.5 font-bold text-sm shadow-sm hover:scale-[1.01] transition-transform',
              })}
            >
              <LuDownload className="w-5 h-5" />
              <span>Download v1.3.0 ZIP</span>
            </a>

            <div className="text-center text-xs text-muted-foreground font-medium">
              Arduino & PlatformIO Offline Library (46.2 KB)
            </div>

            <div className="border-t border-border pt-3 mt-1 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold flex items-center gap-1">
                  <LuHash className="w-3.5 h-3.5 text-primary" /> SHA-256 Checksum:
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(V130_SHA256, 'hero-sha')}
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
                {V130_SHA256}
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
            Integrate USMP v1.3.0 into your build system or package environment with standard dependency commands.
          </p>
        </div>

        <Tabs defaultValue="arduino" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-muted/80 border border-border rounded-xl">
            <TabsTrigger value="arduino" className="gap-2 py-2.5 font-semibold text-xs sm:text-sm">
              <LuCpu className="w-4 h-4" /> Arduino Manager & ZIP
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-1.5">
                    <LuCheck className="w-3 h-3" /> Available in Arduino Library Manager
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Arduino Library (v1.3.0)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official package for ESP32 microcontrollers using Arduino IDE 1.8.x or 2.x with zero-heap static memory support.
                  </p>
                </div>
                <a
                  href="/usmp-1.3.0-arduino.zip"
                  download
                  className={buttonVariants({ variant: 'default', size: 'sm', className: 'gap-2 font-semibold shrink-0' })}
                >
                  <LuDownload className="w-4 h-4" /> Download v1.3.0 ZIP (46.2 KB)
                </a>
              </div>

              {/* Two Installation Methods Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method 1: Library Manager */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <LuSparkles className="w-4 h-4 text-primary" /> Method 1: Library Manager (Recommended)
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                    <li>Open <strong>Arduino IDE</strong> (1.8.x or 2.x).</li>
                    <li>Go to <strong>Tools</strong> ➔ <strong>Manage Libraries...</strong> (or click the Library Manager icon on the left bar).</li>
                    <li>Type <code className="bg-background px-1.5 py-0.5 rounded border border-border text-foreground font-mono">USMP</code> in the search bar.</li>
                    <li>Click <strong>Install</strong> on the <strong>USMP</strong> library (v1.3.0).</li>
                  </ol>

                  <div className="pt-1">
                    <div className="text-[11px] font-semibold text-muted-foreground mb-1">Or install via Arduino CLI:</div>
                    <div className="flex items-center justify-between p-2.5 rounded bg-background border border-border font-mono text-xs text-foreground">
                      <code>arduino-cli lib install "USMP"</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('arduino-cli lib install "USMP"', 'cmd-arduino-cli')}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy CLI command"
                      >
                        {copiedKey === 'cmd-arduino-cli' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Method 2: Offline ZIP */}
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <LuArchive className="w-4 h-4 text-muted-foreground" /> Method 2: Offline ZIP Import
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                      Air-Gapped
                    </span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground leading-relaxed">
                    <li>Download <a href="/usmp-1.3.0-arduino.zip" download className="text-primary hover:underline font-mono">usmp-1.3.0-arduino.zip</a> (46.2 KB).</li>
                    <li>In Arduino IDE, go to: <strong>Sketch</strong> ➔ <strong>Include Library</strong> ➔ <strong>Add .ZIP Library...</strong></li>
                    <li>Select the downloaded archive.</li>
                    <li>Verify in your sketch: <code className="bg-background px-1.5 py-0.5 rounded border border-border text-foreground font-mono">#include &lt;USMP.h&gt;</code>.</li>
                  </ol>

                  <div className="pt-1">
                    <div className="text-[11px] font-semibold text-muted-foreground mb-1">SHA-256 Archive Verification:</div>
                    <div className="p-2 rounded bg-background border border-border font-mono text-[10px] text-muted-foreground break-all select-all">
                      {V130_SHA256}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2 border border-border">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Quick Test Sketch Header</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`#include <USMP.h>\n\n// Binary or string pre-shared key (min 16 bytes)\nstatic const uint8_t PSK[] = "usmp-dev-psk-change-me-before-prod";\nUSMPClient usmp(PSK, sizeof(PSK) - 1);\n\nvoid setup() {\n  Serial.begin(115200);\n  if (!usmp.begin(USMP::TCP("192.168.1.100"))) {\n    Serial.printf("Failed: %s (err %d)\\n", usmp.lastErrorString(), usmp.lastError());\n  }\n  usmp.println("Device ready!");\n}\n\nvoid loop() {\n  usmp.maintain();\n}`, 'code-arduino')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'code-arduino' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'code-arduino' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 rounded bg-background border border-border">
{`#include <USMP.h>

// Binary or string pre-shared key (min 16 bytes)
static const uint8_t PSK[] = "usmp-dev-psk-change-me-before-prod";
USMPClient usmp(PSK, sizeof(PSK) - 1);

void setup() {
  Serial.begin(115200);
  if (!usmp.begin(USMP::TCP("192.168.1.100"))) {
    Serial.printf("Failed: %s (err %d)\\n", usmp.lastErrorString(), usmp.lastError());
  }
  usmp.println("Device ready!");
}

void loop() {
  usmp.maintain();
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
                  <h3 className="text-lg font-bold text-foreground">Python PyPI Package (v1.3.0)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Asynchronous Python client/gateway library supporting Python 3.11 through 3.13 with built-in dev echo server.
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
                  <span>CLI Dev Echo Server (Zero Code)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('python -m usmp.server --port 9000 --psk "usmp-dev-psk-change-me-before-prod" --echo', 'cmd-cli-server')}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'cmd-cli-server' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cmd-cli-server' ? 'Copied!' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="font-mono text-xs text-foreground overflow-x-auto p-2 rounded bg-background border border-border">
{`# Instant test server with ANSI colored logs & payload inspector:
python -m usmp.server --port 9000 --psk "usmp-dev-psk-change-me-before-prod" --echo`}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* ESP-IDF Tab */}
          <TabsContent value="espidf" className="pt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">ESP-IDF Component Registry (v1.3.0)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Native C component for ESP-IDF v5.0+ development with FreeRTOS split mutexes and static memory support.
                  </p>
                </div>
                <a
                  href="https://components.espressif.com/components/metaloomlabs/usmp"
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
                  <code>idf.py add-dependency "metaloomlabs/usmp"</code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('idf.py add-dependency "metaloomlabs/usmp"', 'cmd-espidf')}
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
            <span>v1.3.0 is the active stable release</span>
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
                  <th className="py-4 px-5">Arduino (Manager & ZIP)</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {/* v1.3.0 */}
                <tr className="bg-primary/5 hover:bg-primary/10 transition-colors">
                  <td className="py-4 px-5 font-bold text-foreground">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-primary text-primary-foreground shadow-xs">
                          v1.3.0
                        </span>
                        <span className="text-[11px] font-semibold text-primary">
                          (Latest Stable)
                        </span>
                      </div>
                      <span className="text-xs font-normal text-muted-foreground">
                        Zero-Heap, Split Mutex & Async FSM
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-foreground whitespace-nowrap">
                    September 26, 2026
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1 rounded bg-background font-mono text-xs text-foreground border border-border">
                        pip install usmp
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('pip install usmp', 'tbl-pip-130')}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy pip command"
                      >
                        {copiedKey === 'tbl-pip-130' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
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
                        onClick={() => copyToClipboard('metaloomlabs/usmp', 'tbl-idf-130')}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy ESP-IDF spec"
                      >
                        {copiedKey === 'tbl-idf-130' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <code className="px-2 py-0.5 rounded bg-background font-mono text-xs text-foreground border border-border">
                          arduino-cli lib install "USMP"
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('arduino-cli lib install "USMP"', 'tbl-cli-130')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Copy Arduino CLI command"
                        >
                          {copiedKey === 'tbl-cli-130' ? <LuCheck className="w-3.5 h-3.5 text-emerald-500" /> : <LuCopy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        or <a href="/usmp-1.3.0-arduino.zip" download className="text-primary hover:underline font-mono">usmp-1.3.0-arduino.zip</a> (46.2 KB)
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <a
                      href="/usmp-1.3.0-arduino.zip"
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

                {/* v1.2.0 */}
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-5 font-semibold text-foreground">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-muted text-foreground border border-border">
                          v1.2.0
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          (Previous Stable)
                        </span>
                      </div>
                      <span className="text-xs font-normal text-muted-foreground">
                        ChaCha20-Poly1305 & Rekeying
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    August 15, 2026
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1 rounded bg-muted/60 font-mono text-xs text-foreground border border-border">
                        pip install usmp==1.2.0
                      </code>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5">
                      <code className="px-2.5 py-1 rounded bg-muted/60 font-mono text-xs text-foreground border border-border">
                        metaloomlabs/usmp==1.2.0
                      </code>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-muted-foreground">
                        Archived release
                      </span>
                      <span className="text-[11px] text-muted-foreground">36.5 KB</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <a
                      href="https://github.com/metaloomlabs/usmp/releases/tag/v1.2.0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'gap-1.5 text-xs font-medium',
                      })}
                    >
                      <LuExternalLink className="w-3.5 h-3.5" /> Release Notes
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
          <h2 className="text-2xl font-bold tracking-tight">What's New in v1.3.0</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Detailed release notes for the v1.3.0 feature and reliability release.
          </p>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
          <AccordionItem value="item-1" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuZap className="w-5 h-5 text-primary" />
                Non-Blocking Handshake State Machine & Watchdog Protection
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                v1.3.0 introduces an explicit non-blocking finite state machine (<code>USMP_STATE_IDLE</code> through <code>USMP_STATE_ESTABLISHED</code>) driven by <code>usmp_step()</code> in C Core and <code>beginAsync()</code> in Arduino. Drives connection bring-up and reconnects without synchronous 2–5 second CPU stalls, feeding hardware watchdogs via <code>usmp_port_wdt_feed()</code> to prevent TWDT resets.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuLock className="w-5 h-5 text-primary" />
                Split RTOS Mutex Concurrency Architecture (tx_mutex & rx_mutex)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                Dedicated transmission and reception mutex handles embedded in <code>usmp_t</code> decouple egress encryption from ingress defragmentation. Eliminates full-duplex socket deadlocks when <code>usmp_recv()</code> blocks while completely serializing concurrent <code>usmp_send()</code> calls to prevent AES-GCM nonce reuse. Rekeying and session close enforce strict lock ordering (<code>tx_mutex</code> then <code>rx_mutex</code>).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuBox className="w-5 h-5 text-primary" />
                Zero-Heap Memory Architecture & Static Transports
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                Caller-managed scratchpad memory (<code>USMP_HANDSHAKE_SCRATCH_LEN = 2048</code>) enables handshakes with 100% zero dynamic heap allocations, securely zeroized upon completion via <code>mbedtls_platform_zeroize()</code>. Accompanied by static transport initializers (<code>usmp_transport_tcp_init_static</code>, <code>init_static</code>) and the <code>USMPClientStatic</code> C++ template wrapper for pure <code>.bss</code> embedded deployments.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuShieldCheck className="w-5 h-5 text-primary" />
                CoAP RTT Estimation, Fast Table CRC-16 & Early Packet Rejection
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                RFC 7252 / Jacobson-Karn smoothed RTT and variance tracking in UDP transports dynamically back off retransmission timeouts (100 ms – 5000 ms) while feeding watchdogs. The C Core includes a precomputed 256-word Flash CRC-16 lookup engine delivering ~8x faster single-cycle calculation, paired with early CRC validation directly over incoming wire buffers to drop corrupted packets in zero copy cycles.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="rounded-xl border border-border bg-card px-5">
            <AccordionTrigger className="hover:no-underline font-bold text-base">
              <span className="flex items-center gap-2.5">
                <LuCode className="w-5 h-5 text-primary" />
                Developer Experience: Arduino Print Interface, Python CLI & Error Translation
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-2">
              <p>
                <code>USMPClient</code> inherits from Arduino's standard <code>Print</code> class (<code>usmp.print()</code>, <code>usmp.println()</code>) with zero-heap line buffering. Python SDK adds a built-in CLI dev/echo server (<code>python -m usmp.server --echo</code>), <code>session.send(str)</code>, <code>session.recv_str()</code>, and terminal payload inspection (<code>session.print()</code>). C Core and Arduino expose human-readable error translation via <code>usmp_strerror()</code> and <code>usmp.lastErrorString()</code>.
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
                onClick={() => copyToClipboard('Get-FileHash .\\usmp-1.3.0-arduino.zip -Algorithm SHA256', 'cmd-win-hash')}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                {copiedKey === 'cmd-win-hash' ? <LuCheck className="w-3 h-3 text-emerald-500" /> : <LuCopy className="w-3 h-3" />}
                <span>{copiedKey === 'cmd-win-hash' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-foreground p-3 rounded bg-background border border-border overflow-x-auto">
              Get-FileHash .\usmp-1.3.0-arduino.zip -Algorithm SHA256
            </pre>
          </div>

          {/* Linux / macOS Verification */}
          <div className="space-y-3 p-4 rounded-xl bg-muted/60 border border-border">
            <div className="font-semibold text-xs text-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Linux / macOS Terminal Verification</span>
              <button
                type="button"
                onClick={() => copyToClipboard('sha256sum usmp-1.3.0-arduino.zip', 'cmd-nix-hash')}
                className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                {copiedKey === 'cmd-nix-hash' ? <LuCheck className="w-3 h-3 text-emerald-500" /> : <LuCopy className="w-3 h-3" />}
                <span>{copiedKey === 'cmd-nix-hash' ? 'Copied' : 'Copy Command'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-foreground p-3 rounded bg-background border border-border overflow-x-auto">
              sha256sum usmp-1.3.0-arduino.zip
            </pre>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-foreground">v1.3.0 Expected SHA-256 Output:</span>
            <div className="font-mono text-xs text-primary break-all">
              {V130_SHA256}
            </div>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(V130_SHA256, 'bottom-sha')}
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
