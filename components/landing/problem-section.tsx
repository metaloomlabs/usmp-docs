export function ProblemSection() {
  return (
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
                <h3 className="text-base font-bold text-foreground font-sans">
                  Raw Sockets (TCP/UDP)
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Extremely fast and lightweight, but completely open to eavesdropping, spoofing,
                  and tampering.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-xs mt-1">
                ✗
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground font-sans">Full TLS / DTLS</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Rock-solid security, but massive. It consumes 60–100 KB of flash, wastes precious
                  active RAM, slows down handshakes, and requires complex certificate authority (CA)
                  infrastructures that are painful to manage on fleets of microcontrollers.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            <p className="text-base font-semibold text-foreground">
              <span className="text-emerald-500 font-bold">USMP fills this gap.</span> It gives you
              production-grade cryptographic tunnels using a memory footprint so small it runs on
              standard breadboard controllers.
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
                  <th className="p-4 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    USMP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-neutral-600 dark:text-neutral-400">
                <tr>
                  <td className="p-4 font-bold text-foreground font-sans">Authentication</td>
                  <td className="p-4 text-red-600 dark:text-red-400 font-medium">
                    None (Vulnerable)
                  </td>
                  <td className="p-4">Certificate-based (Complex CA)</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">
                    Mutual Pre-Shared Key (HMAC-SHA256)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground font-sans">Confidentiality</td>
                  <td className="p-4 text-red-600 dark:text-red-400 font-medium">
                    None (Plaintext)
                  </td>
                  <td className="p-4">Enforced</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">
                    Enforced (AES-256-GCM)
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground font-sans">Flash Footprint</td>
                  <td className="p-4">~0 KB</td>
                  <td className="p-4">60 - 100 KB</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10 text-sm">
                    &lt; 10 KB
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground font-sans">Persistent RAM</td>
                  <td className="p-4">~0 KB</td>
                  <td className="p-4">20 - 40 KB</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10 text-sm">
                    112 Bytes
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold text-foreground font-sans">Handshake Speed</td>
                  <td className="p-4">Instant</td>
                  <td className="p-4 font-sans text-neutral-600 dark:text-neutral-500">
                    Slow (Multiple Roundtrips)
                  </td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">
                    Fast (4-step, 10-30ms)
                  </td>
                </tr>
                <tr className="border-b-0">
                  <td className="p-4 font-bold text-foreground font-sans">Forward Secrecy</td>
                  <td className="p-4 text-red-600 dark:text-red-400">No</td>
                  <td className="p-4">Yes</td>
                  <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 border-l border-r border-emerald-500/10">
                    Yes (X25519)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
