import { LuCpu, LuGlobe, LuRefreshCw, LuWorkflow } from 'react-icons/lu'

export function TransportsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
          PHYSICAL LAYER AGNOSTIC
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
          Decoupled from the network. Build once, run anywhere.
        </h2>
        <p className="mt-4 text-muted-foreground">
          USMP runs at the session layer. It is designed to be completely transport-agnostic,
          wrapping your payloads inside a secure cryptographic envelope before handing it down to
          your interface.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TCP Sockets */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
              <LuGlobe className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">TCP Sockets</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-normal">
              Run secure, stream-oriented connections over standard TCP networks. Ideal for constant
              gateway reporting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
            <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
              Production-Ready
            </span>
            <span className="text-[9px] font-mono text-neutral-500">Wi-Fi / Ethernet</span>
          </div>
        </div>

        {/* UDP Sockets */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
              <LuWorkflow className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">UDP Sockets</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-normal">
              Secure your connectionless UDP packets. USMP includes transparent packet
              fragmentation, reassembly, and reliability overlays to ensure smooth delivery.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
            <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
              Production-Ready
            </span>
            <span className="text-[9px] font-mono text-neutral-500">Lossy Networks</span>
          </div>
        </div>

        {/* Hot-Swappable Transports */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex flex-col justify-between hover:border-emerald-500/20 transition-colors">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
              <LuRefreshCw className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">Hot-Swappable</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-normal">
              Swap physical transport layers dynamically at runtime (e.g. fallback from Wi-Fi TCP to
              cellular UDP, or wired UART) without changing a single line of your application logic
              or session state configuration.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
            <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider">
              Runtime Interchange
            </span>
            <span className="text-[9px] font-mono text-neutral-500">Failover Ready</span>
          </div>
        </div>

        {/* UART, BLE & RF */}
        <div className="p-6 rounded-2xl border border-dashed border-border/80 bg-neutral-950/20 flex flex-col justify-between hover:border-indigo-500/20 transition-colors group">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <LuCpu className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground font-sans">UART, BLE & RF</h3>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500 font-normal">
              Secure local serial buses and wireless Bluetooth smart devices. You can wrap UART or
              BLE packets with the exact same cryptographic envelope using only 5 platform hooks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider animate-pulse">
              Coming Soon
            </span>
            <span className="text-[9px] font-mono text-neutral-600">Local Serial / RF</span>
          </div>
        </div>
      </div>
    </section>
  )
}
