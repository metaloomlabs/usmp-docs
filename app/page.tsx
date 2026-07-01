import { LuArrowRight, LuGithub, LuTerminal, LuDownload } from 'react-icons/lu'

import { buttonVariants } from '@/components/ui/button'
import { PageRoutes } from '@/lib/pageroutes'
import { Link } from '@/lib/transition'
import { Settings } from '@/types/settings'

export default function Home() {
  return (
    <div className="relative isolate min-h-[86.5vh] overflow-hidden bg-background">
      {/* Monochrome ambient background flare */}
      <div
        className="absolute inset-x-0 -top-30 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-60"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-10rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[15deg] bg-gradient-to-tr from-neutral-500 to-neutral-700 opacity-5 sm:left-[calc(50%-25rem)] sm:w-[68rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <section className="mx-auto max-w-5xl px-6 pt-20 pb-24 text-center sm:pt-28 lg:px-8 flex flex-col items-center">
        {/* Minimalist Monochrome Badge */}
        <div className="mb-6 flex items-center gap-2 rounded-full border border-neutral-500/20 bg-neutral-500/5 px-4 py-1.5 text-xs font-semibold text-neutral-400 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/50">
          <span className="flex h-2 w-2 rounded-full bg-neutral-400 animate-pulse" />
          <span>Protocol Specification v1.0.0</span>
        </div>

        {/* Chrome / Metallic Centered Title */}
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-8xl">
          <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent dark:from-white dark:via-neutral-200 dark:to-neutral-500">
            USMP
          </span>
        </h1>

        {/* Centered Subtitle */}
        <p className="mt-6 max-w-2xl text-md leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Unified Secure Multi-transport Protocol. A secure, lightweight, and transport-agnostic
          communication protocol designed specifically for resource-constrained embedded systems.
        </p>

        {/* High-Contrast Monochrome Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={`/docs${PageRoutes[0].href}`}
            className={buttonVariants({
              className:
                'gap-2 px-6 py-5 bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all duration-200 shadow-md shadow-foreground/5',
              size: 'lg',
            })}
          >
            Get Started
            <LuArrowRight className="size-4" />
          </Link>
          <a
            href="/usmp-0.5.1-arduino.zip"
            download
            className={buttonVariants({
              variant: 'outline',
              className:
                'gap-2 px-6 py-5 border-border hover:bg-muted/50 transition-colors duration-200',
              size: 'lg',
            })}
          >
            <LuDownload className="size-4" />
            Download Arduino ZIP
          </a>
          <Link
            href={Settings.link}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: 'outline',
              className:
                'gap-2 px-6 py-5 border-border hover:bg-muted/50 transition-colors duration-200',
              size: 'lg',
            })}
          >
            <LuGithub className="size-4" />
            GitHub
          </Link>
        </div>

        {/* Clean Monochrome Code Showcase Block */}
        <div className="mt-16 w-full max-w-2xl text-left rounded-xl border border-border/80 bg-neutral-950 p-1 shadow-2xl dark:border-border/40">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-neutral-900/50 rounded-t-lg">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <LuTerminal className="size-3.5 text-neutral-400" />
              <span>usmp_demo.c</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-neutral-800" />
              <span className="w-3 h-3 rounded-full bg-neutral-800" />
              <span className="w-3 h-3 rounded-full bg-neutral-800" />
            </div>
          </div>
          <pre className="p-5 overflow-x-auto text-[13px] leading-6 font-mono text-neutral-300 bg-neutral-950 rounded-b-lg">
            <code>
              <span className="text-neutral-500">// Initialize protocol session</span>
              {'\n'}
              <span className="text-white font-semibold">UsmpSession</span> session;{'\n'}
              <span className="text-neutral-200">usmp_init</span>(&amp;session, transport_write_cb);
              {'\n'}
              {'\n'}
              <span className="text-neutral-500">// Establish secure authenticated session</span>
              {'\n'}
              <span className="text-neutral-200">usmp_handshake</span>(&amp;session);{'\n'}
              {'\n'}
              <span className="text-neutral-500">// Transmit secure encrypted frames</span>
              {'\n'}
              <span className="text-neutral-200">usmp_send</span>(&amp;session, payload,{' '}
              <span className="text-neutral-400">sizeof</span>(payload));
            </code>
          </pre>
        </div>
      </section>

      {/* Ambient bottom glow */}
      <div
        className="absolute inset-x-0 top-[calc(100%-10rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-25rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+4rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-neutral-400 to-neutral-600 opacity-5 sm:left-[calc(50%+30rem)] sm:w-[68rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
}
