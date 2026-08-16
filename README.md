# USMP Documentation Portal

The official documentation portal for the **Unified Secure Multi-transport Protocol (USMP)**. Built with **Next.js**, **React**, **Tailwind CSS**, and **TypeScript** to deliver high-fidelity, interactive, and search-indexed product documentation for the USMP protocol suite.

## Features

### Content & MDX Enhancements

* **Markdown & MDX**: Write documentation in standard markdown with embedded JSX components.
* **Interactive Tabs**: Native support for switching between platform-specific code tabs (e.g. ESP32 NVS, Arduino Preferences, and Python SDK).
* **Custom Admonitions & Callouts**: Support for both MkDocs admonition blocks (`!!! note`) and standard GitHub-flavored alert boxes (`> [!WARNING]`, `> [!IMPORTANT]`, etc.), styled beautifully for light and dark themes.
* **Math & Diagrams**: Support for LaTeX equations and Mermaid.js flowcharts.
* **Syntax Highlighting**: Beautiful code blocks with language support, titles, line highlighting, and one-click clipboard copying.

### Navigation & UX

* **Auto-generated Sidebar**: Populated dynamically from structured configurations.
* **Breadcrumbs & Pagination**: Automated page context breadcrumbs and "Previous / Next" pagination links.
* **Responsive Menu Drawer**: A clean mobile sidebar menu drawer containing the brand logo and full site navigation.
* **Fuzzy Search**: Client-side fuzzy text search with direct term highlighting across all documentation files.
* **Light/Dark Theme**: Seamless toggle between dark mode and light mode.

---

## Quick Start

### 1. Prerequisites

Ensure you have **Node.js** installed on your system.

### 2. Installation & Setup

Clone the repository, install dependencies, and run the search indexing generator:

```bash
# Clone the repository
git clone https://github.com/metaloomlabs/usmp-docs.git
cd usmp-docs

# Install dependencies
npm install

# Generate search indexes
npm run generate-content-json

# Start local dev server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the documentation locally.

---

## Content Indexing

When you add or update markdown files in `contents/docs/`, you must update the search database:

```bash
npm run generate-content-json
```

This compiles your markdown headings and snippets into `public/search-data/documents.json`, which is consumed by the client-side search engine.

---

## Production Build

To generate the optimized static production site:

```bash
npm run build
npm run start
```
