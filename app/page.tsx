import { BenchmarksSection } from '@/components/landing/benchmarks-section'
import { CodeTabsSection } from '@/components/landing/code-tabs-section'
import { FAQS } from '@/components/landing/faq-data'
import { FaqSection } from '@/components/landing/faq-section'
import { HeroSection } from '@/components/landing/hero-section'
import { InstallCtaSection } from '@/components/landing/install-cta-section'
import { ProblemSection } from '@/components/landing/problem-section'
import { SecurityGuaranteesSection } from '@/components/landing/security-guarantees-section'
import { TransportsSection } from '@/components/landing/transports-section'
import { Settings } from '@/types/settings'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${Settings.metadataBase}/#software`,
        name: 'USMP (Unified Secure Multi-transport Protocol)',
        description:
          'A secure, lightweight, and transport-agnostic session-layer communication protocol for resource-constrained microcontrollers (ESP32, Arduino) and Python.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'ESP32, Arduino, Linux, Windows, macOS',
        license: 'https://github.com/metaloomlabs/usmp/blob/main/LICENSE',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${Settings.metadataBase}/#faq`,
        mainEntity: FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-background">
      {/* Structured SEO Data for AI & Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Premium background grid visual */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,oklch(var(--border)/0.25)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-35" />

      {/* Futuristic ambient light glows */}
      <div className="absolute top-0 left-1/4 -z-10 h-[40rem] w-[40rem] rounded-full bg-emerald-500/5 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[50rem] w-[50rem] rounded-full bg-teal-500/5 blur-3xl opacity-50 pointer-events-none" />

      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. THE PROBLEM (The Compromise) */}
      <ProblemSection />

      {/* 3. CORE CRYPTOGRAPHIC GUARANTEES */}
      <SecurityGuaranteesSection />

      {/* 4. ONE PROTOCOL. EVERY TRANSPORT. */}
      <TransportsSection />

      {/* 5. DEVELOPER EXPERIENCE (Interactive Code Tabs) */}
      <CodeTabsSection />

      {/* 6. RESOURCE FOOTPRINT & PERFORMANCE */}
      <BenchmarksSection />

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <FaqSection />

      {/* 8. INTEGRATION & CALL-TO-ACTION */}
      <InstallCtaSection />
    </div>
  )
}
