import Link from 'next/link'
import {
  LuDownload,
  LuSparkles,
  LuCpu,
  LuTerminal,
  LuCheck,
  LuExternalLink,
  LuBox,
  LuArchive,
  LuTag,
  LuCalendar,
  LuLayers,
} from 'react-icons/lu'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Downloads & Releases - USMP Security Protocol',
  description: 'Download official USMP releases, Arduino IDE offline zip libraries (v1.1.0, v1.0.0), Python PyPI packages, and ESP-IDF component registries.',
}

export default function DownloadsPage() {
  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
          <LuSparkles className="w-3.5 h-3.5" />
          <span>Latest Release v1.1.0 Now Available</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
          Downloads & Releases
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Get official USMP library packages, offline Arduino ZIP archives, PyPI modules, and ESP-IDF components for secure IoT connectivity.
        </p>
      </div>

      {/* Featured Latest Release Banner - v1.1.0 */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-primary text-primary-foreground">
                LATEST PUBLIC RELEASE
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <LuTag className="w-4 h-4" /> v1.1.0
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LuCalendar className="w-3.5 h-3.5" /> Release Date: July 25, 2026
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              USMP v1.1.0 — Reliable UDP & Enhanced Arduino Support
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              v1.1.0 introduces reliable connectionless UDP transport layer support with automatic sliding-window acknowledgments, key rotation safety enhancements, and updated Arduino wrapper libraries.
            </p>

            {/* Highlights List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-sm text-foreground/90 font-medium">
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Reliable UDP Session Demultiplexing</span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Arduino ESP32 Hardware Acceleration</span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Zero-Dynamic-Allocation Memory Footprint</span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-4 h-4 text-primary shrink-0" />
                <span>ESP-IDF v5.x Native Component Support</span>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
            <a
              href="/usmp-1.1.0-arduino.zip"
              download
              className={buttonVariants({ variant: 'default', size: 'lg', className: 'w-full gap-2.5 font-semibold' })}
            >
              <LuDownload className="w-5 h-5" />
              <span>Download v1.1.0 ZIP</span>
            </a>
            <div className="text-center text-xs text-muted-foreground">
              Arduino Offline Library Archive (35.0 KB)
            </div>
          </div>
        </div>
      </section>

      {/* Primary Package Matrix Table (Version : Python : IDF : ZIP) */}
      <section className="space-y-6">
        <div className="border-b pb-4">
          <div className="flex items-center gap-2">
            <LuLayers className="w-5 h-5 text-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Release Matrix (Version : Python : IDF : ZIP)</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Quick lookup table comparing package sources and direct downloads across all supported targets.
          </p>
        </div>

        <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/70 text-foreground uppercase text-[11px] font-bold border-b border-border">
                <tr>
                  <th className="py-4 px-5">Version</th>
                  <th className="py-4 px-5">Python SDK (PyPI)</th>
                  <th className="py-4 px-5">ESP-IDF Component</th>
                  <th className="py-4 px-5">Arduino Offline ZIP</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {/* v1.1.0 */}
                <tr className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-5 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-primary text-primary-foreground">
                        v1.1.0
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        (Latest Public)
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <code className="px-2.5 py-1 rounded bg-muted font-mono text-xs text-foreground border border-border">
                      pip install usmp==1.1.0
                    </code>
                  </td>
                  <td className="py-4 px-5">
                    <code className="px-2.5 py-1 rounded bg-muted font-mono text-xs text-foreground border border-border">
                      metaloomlabs/usmp^1.1.0
                    </code>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-mono text-xs font-medium text-foreground">
                      usmp-1.1.0-arduino.zip
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">(35 KB)</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <a
                      href="/usmp-1.1.0-arduino.zip"
                      download
                      className={buttonVariants({ variant: 'default', size: 'sm', className: 'gap-1.5 text-xs font-semibold' })}
                    >
                      <LuDownload className="w-3.5 h-3.5" /> Download ZIP
                    </a>
                  </td>
                </tr>

                {/* v1.0.0 */}
                <tr className="hover:bg-muted/40 transition-colors">
                  <td className="py-4 px-5 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-secondary text-secondary-foreground border border-border">
                        v1.0.0
                      </span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        (Stable Legacy)
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <code className="px-2.5 py-1 rounded bg-muted font-mono text-xs text-foreground border border-border">
                      pip install usmp==1.0.0
                    </code>
                  </td>
                  <td className="py-4 px-5">
                    <code className="px-2.5 py-1 rounded bg-muted font-mono text-xs text-foreground border border-border">
                      metaloomlabs/usmp^1.0.0
                    </code>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-mono text-xs font-medium text-foreground">
                      usmp-1.0.0-arduino.zip
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">(31 KB)</span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <a
                      href="/usmp-1.0.0-arduino.zip"
                      download
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5 text-xs font-semibold' })}
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

      {/* Package Registries Grid */}
      <section className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Distribution & Package Managers</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Install USMP directly via your preferred package manager.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Arduino IDE */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-muted text-foreground w-fit">
                <LuCpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Arduino IDE / PlatformIO</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Offline packaged ZIP libraries for ESP32 and Arduino microcontrollers. Includes ready-to-run sketches.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <a
                href="/usmp-1.1.0-arduino.zip"
                download
                className={buttonVariants({ variant: 'default', size: 'sm', className: 'w-full gap-2 text-xs font-semibold' })}
              >
                <LuDownload className="w-4 h-4" /> Download v1.1.0 ZIP (35 KB)
              </a>
              <a
                href="/usmp-1.0.0-arduino.zip"
                download
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full gap-2 text-xs text-muted-foreground font-medium' })}
              >
                <LuArchive className="w-3.5 h-3.5" /> Download v1.0.0 ZIP (31 KB)
              </a>
            </div>
          </div>

          {/* Python PyPI */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-muted text-foreground w-fit">
                <LuTerminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Python PyPI SDK</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Asynchronous gateway server and client SDK with asyncio, Curve25519, and AES-GCM integration.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="rounded-md bg-muted p-2.5 font-mono text-xs text-foreground flex items-center justify-between border border-border">
                <span>pip install usmp</span>
              </div>
              <a
                href="https://pypi.org/project/usmp/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full gap-2 text-xs font-semibold' })}
              >
                <LuExternalLink className="w-4 h-4" /> View on PyPI
              </a>
            </div>
          </div>

          {/* ESP Component Registry */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-muted text-foreground w-fit">
                <LuBox className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">ESP-IDF Registry</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Native C component published on ESP Component Registry for ESP-IDF v5.0+ projects.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="rounded-md bg-muted p-2 font-mono text-[11px] text-foreground border border-border overflow-x-auto">
                idf.py add-dependency metaloomlabs/usmp
              </div>
              <a
                href="https://components.espressif.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full gap-2 text-xs font-semibold' })}
              >
                <LuExternalLink className="w-4 h-4" /> ESP Registry
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Setup Guide */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">How to Install Arduino ZIP Package</h2>
        <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
          <li>Download the <strong>usmp-1.1.0-arduino.zip</strong> archive using the download button above.</li>
          <li>Open your <strong>Arduino IDE</strong>.</li>
          <li>Navigate to top menu: <code>Sketch</code> ➔ <code>Include Library</code> ➔ <code>Add .ZIP Library...</code></li>
          <li>Select the downloaded <code>usmp-1.1.0-arduino.zip</code> file.</li>
          <li>Include <code>#include &lt;USMP.h&gt;</code> in your ESP32 sketch and explore example sketches under <code>File ➔ Examples ➔ USMP</code>.</li>
        </ol>
      </section>
    </div>
  )
}
