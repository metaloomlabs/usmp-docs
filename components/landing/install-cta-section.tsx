'use client'

import { useState } from 'react'
import { LuArrowRight, LuDownload, LuGithub } from 'react-icons/lu'

import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/lib/transition'

export function InstallCtaSection() {
  const [activeCliPlatform, setActiveCliPlatform] = useState<'python' | 'esp32' | 'arduino'>(
    'python'
  )
  const [copiedCli, setCopiedCli] = useState<string | null>(null)

  const copyCliCommand = (command: string, platform: string) => {
    navigator.clipboard.writeText(command)
    setCopiedCli(platform)
    setTimeout(() => setCopiedCli(null), 2000)
  }

  return (
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
          Import the client library into your embedded compiler or spin up a server gateway in
          minutes.
        </p>

        {/* Interactive Install Widget */}
        <div className="mt-10 w-full max-w-lg bg-neutral-100 dark:bg-black rounded-xl border border-border/80 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex border-b border-border/40 bg-neutral-200/50 dark:bg-neutral-900/60 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveCliPlatform('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeCliPlatform === 'python'
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
              }`}
            >
              Python Server
            </button>
            <button
              type="button"
              onClick={() => setActiveCliPlatform('esp32')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeCliPlatform === 'esp32'
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
              }`}
            >
              ESP-IDF
            </button>
            <button
              type="button"
              onClick={() => setActiveCliPlatform('arduino')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeCliPlatform === 'arduino'
                  ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-foreground dark:hover:text-white'
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
                  onClick={() =>
                    copyCliCommand('idf.py add-dependency "metaloomlabs/usmp"', 'esp32')
                  }
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
                  href="/usmp-1.3.0-arduino.zip"
                  download="usmp-1.3.0-arduino.zip"
                  className="ml-3 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-500 bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded shrink-0 transition-colors"
                >
                  Download ZIP (v1.3.0)
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
          <Link href="/docs/sdk/python" className="hover:text-emerald-500 transition-colors">
            API Reference
          </Link>
          <span className="text-neutral-350 dark:text-neutral-800 select-none">|</span>
          <Link href="/docs/protocol/overview" className="hover:text-emerald-500 transition-colors">
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
  )
}
