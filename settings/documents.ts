import { type Paths } from '@/lib/pageroutes'

export const Documents: Paths[] = [
  {
    title: 'Welcome',
    href: '/welcome',
  },
  {
    spacer: true,
  },
  {
    title: 'Tutorials',
    href: '/getting-started',
    noLink: true,
    items: [
      {
        title: 'Introduction',
        href: '/what-is-usmp',
      },
      {
        title: 'Installation & Setup',
        href: '/installation',
      },
      {
        title: '1. Your First TCP Tunnel',
        href: '/tutorial-tcp',
      },
      {
        title: '2. Going Connectionless (UDP)',
        href: '/tutorial-udp',
      },
      {
        title: '3. Production Hardening',
        href: '/production-hardening',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Code Examples & Demos',
    href: '/examples',
    noLink: true,
    items: [
      {
        title: 'Overview',
        href: '/index',
      },
      {
        title: 'TCP Echo Demo',
        href: '/tcp',
      },
      {
        title: 'UDP Reliability Demo',
        href: '/udp',
      },
      {
        title: 'AWS EC2 Deployment',
        href: '/aws-ec2',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Porting & Custom Transports',
    href: '/ports',
    noLink: true,
    items: [
      {
        title: 'ESP-IDF Port',
        href: '/esp32',
      },
      {
        title: 'Arduino Library',
        href: '/arduino',
      },
      {
        title: 'Porting Guide',
        href: '/porting-guide',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Python SDK Reference',
    href: '/sdk',
    noLink: true,
    items: [
      {
        title: 'Overview',
        href: '/python',
      },
      {
        title: 'USMPServer',
        href: '/server',
      },
      {
        title: 'USMPClient',
        href: '/client',
      },
      {
        title: 'USMPSession',
        href: '/session',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Protocol Specification',
    href: '/protocol',
    noLink: true,
    items: [
      {
        title: 'Overview',
        href: '/overview',
      },
      {
        title: 'Wire Format',
        href: '/frame-format',
      },
      {
        title: 'Handshake Mechanics',
        href: '/handshake',
      },
      {
        title: 'Cryptographic Details',
        href: '/encryption',
      },
      {
        title: 'Sequence Numbers',
        href: '/sequence-numbers',
      },
      {
        title: 'Error Handling',
        href: '/error-handling',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Security Model',
    href: '/security',
    noLink: true,
    items: [
      {
        title: 'Architecture',
        href: '/model',
      },
      {
        title: 'Key Management',
        href: '/psk',
      },
      {
        title: 'Threat Analysis',
        href: '/threat-model',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Tools',
    href: '/tools',
    noLink: true,
    items: [
      {
        title: 'CLI Tools (coming soon)',
        href: '/cli',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Troubleshooting',
    href: '/troubleshooting',
    noLink: true,
    items: [
      {
        title: 'Diagnostic Guides',
        href: '/guides',
      },
      {
        title: 'Debugging & Trace',
        href: '/debugging',
      },
    ],
  },
  {
    spacer: true,
  },
  {
    title: 'Specifications',
    href: '/spec',
  },
]
