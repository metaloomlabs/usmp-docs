import { LuGithub, LuLinkedin, LuSlack, LuYoutube, LuCompass } from 'react-icons/lu'
import { Logo } from '@/components/navigation/logo'
import { Link } from '@/lib/transition'
import { Settings } from '@/types/settings'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/30 backdrop-blur-md mt-24">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">
        {/* Columns Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 pb-12 border-b border-border/40">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <Logo />
            <p className="text-xs text-muted-foreground leading-5 max-w-xs mt-2">
              Unified Secure Multi-transport Protocol. Highly optimized secure session framing for
              embedded IoT devices.
            </p>
          </div>

          {/* Column 2: Documentation */}
          <div>
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-4">
              Documentation
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/docs/welcome"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Welcome
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/what-is-usmp"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  What is USMP
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/getting-started/installation"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Installation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/spec"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Protocol Spec
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Protocols */}
          <div>
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-4">
              Protocol Specs
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/docs/protocol/frame-format"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Frame Format
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/protocol/handshake"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Secure Handshake
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/protocol/encryption"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Encryption Layer
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/protocol/error-handling"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Error Handling
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: SDKs */}
          <div>
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-4">
              SDKS & Tools
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/docs/sdk/python"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Python SDK
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/sdk/client"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Client C SDK
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/sdk/server"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  Server Core SDK
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/ports/esp32"
                  className="hover:text-foreground transition-colors duration-200"
                >
                  ESP32 Port
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-muted-foreground">
          {/* Left Side compliance & licenses */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            {/* Apache 2.0 Seal */}
            <div className="flex items-center gap-1.5 border border-border/80 rounded px-2.5 py-0.5 text-[10px] font-medium bg-muted/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Apache License 2.0</span>
            </div>

            <span>&copy; 2026 Metaloom Labs.</span>

            <a
              href="https://github.com/winterx64"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-semibold text-foreground"
            >
              Akhil B Xavier
            </a>
          </div>

          {/* Right Side Social icons */}
          <div className="flex space-x-5 text-muted-foreground">
            <a
              href="https://slack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Slack"
            >
              <LuSlack className="size-5" />
            </a>
            <a
              href="https://github.com/metaloomlabs/usmp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <LuGithub className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/metaloom"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <LuLinkedin className="size-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <LuCompass className="size-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <LuYoutube className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
