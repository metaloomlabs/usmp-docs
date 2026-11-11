export interface FaqItem {
  question: string
  answer: string
}

export const FAQS: FaqItem[] = [
  {
    question: 'Why not just use TLS / DTLS?',
    answer:
      'TLS is excellent but too heavy for resource-constrained controllers. It occupies 60–100 KB of Flash and requires up to 40 KB of active RAM, along with complex root certificate (CA) verification. USMP was built specifically for microcontrollers, requiring under 10 KB of Flash and exactly 112 bytes of persistent RAM while maintaining comparable cryptographic guarantees.',
  },
  {
    question: 'Is it secure without asymmetric certificates?',
    answer:
      'Yes. USMP uses Mutual Pre-Shared Key (PSK) authentication via HMAC-SHA256. To ensure secrecy, an ephemeral X25519 key exchange occurs at the start of each session. Even if the pre-shared key is leaked later, past sessions cannot be decrypted (Perfect Forward Secrecy).',
  },
  {
    question: 'How should I provision the PSK in production?',
    answer:
      "Do not hardcode the PSK in your source code. We recommend writing the PSK to the ESP32's secure, encrypted Non-Volatile Storage (NVS) partition or a dedicated hardware security module (HSM) during manufacturing.",
  },
  {
    question: 'What is the battery/power consumption impact?',
    answer:
      "Extremely low. Once the 4-step handshake completes, USMP uses symmetric AES-256-GCM encryption. The ESP32's on-chip hardware cryptographic engines accelerate this math, allowing packets to be encrypted/decrypted in under 1 millisecond with negligible battery draw.",
  },
  {
    question: 'Does it support packet fragmentation?',
    answer:
      'Yes. USMP automatically fragments payloads larger than 452 bytes into up to 4 sequential frames (maxing out at ~1.8 KB) and reassembles them transparently on the receiving side.',
  },
]

