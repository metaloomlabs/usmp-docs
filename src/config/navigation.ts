export interface NavItem {
  title: string;
  slug?: string;
  items?: NavItem[];
}

export const navigation: NavItem[] = [
  { title: "Home", slug: "" },
  {
    title: "Getting Started",
    items: [
      { title: "What is USMP?", slug: "getting-started/what-is-usmp" },
      { title: "Quick Start (ESP32)", slug: "getting-started/quickstart-esp32" },
      { title: "Quick Start (Arduino)", slug: "getting-started/quickstart-arduino" },
      { title: "Quick Start (Python)", slug: "getting-started/quickstart-python" },
      { title: "Installation", slug: "getting-started/installation" },
    ],
  },
  {
    title: "Protocol",
    items: [
      { title: "Overview", slug: "protocol/overview" },
      { title: "Frame Format", slug: "protocol/frame-format" },
      { title: "Handshake", slug: "protocol/handshake" },
      { title: "Encryption", slug: "protocol/encryption" },
      { title: "Sequence Numbers", slug: "protocol/sequence-numbers" },
      { title: "Error Handling", slug: "protocol/error-handling" },
    ],
  },
  {
    title: "Ports",
    items: [
      { title: "ESP32", slug: "ports/esp32" },
      { title: "Arduino", slug: "ports/arduino" },
      { title: "Porting Guide", slug: "ports/porting-guide" },
    ],
  },
  {
    title: "SDK",
    items: [
      { title: "Python SDK", slug: "sdk/python" },
      { title: "USMPServer", slug: "sdk/server" },
      { title: "USMPClient", slug: "sdk/client" },
      { title: "USMPSession", slug: "sdk/session" },
    ],
  },
  {
    title: "Tools",
    items: [
      { title: "CLI (coming soon)", slug: "tools/cli" },
      { title: "Protocol Simulator & Telemetry", slug: "tools/telemetry" },
    ],
  },
  {
    title: "Security",
    items: [
      { title: "Security Model", slug: "security/model" },
      { title: "PSK Management", slug: "security/psk" },
      { title: "Threat Model", slug: "security/threat-model" },
    ],
  },
  {
    title: "Examples",
    items: [
      { title: "ESP32 + Python Server", slug: "examples/esp32-python" },
      { title: "D2D (coming soon)", slug: "examples/d2d" },
    ],
  },
  { title: "Spec", slug: "spec" },
];
