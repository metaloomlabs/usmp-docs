import { LuActivity, LuHistory, LuKey, LuLock } from 'react-icons/lu'

export function SecurityGuaranteesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 border-t border-border/30 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
          SECURITY ASSURANCE
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mt-2">
          Built-in Hardening. No "Insecure Mode."
        </h2>
        <p className="mt-4 text-muted-foreground">
          Unlike other IoT protocols that treat encryption as an optional flag, USMP enforces modern
          cryptographic pipelines by default.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mutual Authentication */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <LuKey className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground font-sans">
              Mutual Authentication (HMAC-SHA256)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
              Both the device and the gateway prove their identity before a session is active. By
              using HMAC-SHA256 proofs bound to the handshake, you prevent Man-in-the-Middle (MITM)
              attacks. The pre-shared key (PSK) is never sent over the wire.
            </p>
          </div>
        </div>

        {/* Perfect Forward Secrecy */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <LuHistory className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground font-sans">
              Perfect Forward Secrecy (X25519)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
              A new, ephemeral X25519 key exchange occurs at the start of every session. If the
              master PSK is leaked in the future, past recorded traffic remains completely secure
              and undecipherable.
            </p>
          </div>
        </div>

        {/* Authenticated Encryption */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <LuLock className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground font-sans">
              Authenticated Encryption (AES-256-GCM)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
              All post-handshake payload data is encrypted. The GCM authentication tag ensures that
              if any part of the frame is modified or tampered with in transit, decryption fails
              instantly and the session drops.
            </p>
          </div>
        </div>

        {/* Replay and Nonce Collision Protection */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <LuActivity className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground font-sans">
              Replay and Nonce Collision Protection
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-normal">
              Strict, monotonic 32-bit sequence numbers are verified for every frame. AES-GCM nonces
              are constructed as{' '}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                seq (4 bytes) || session_id[0..7]
              </code>{' '}
              to eliminate any risks of nonce collisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
