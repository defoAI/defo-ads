<p align="center">
  <img src="public/logo.png" alt="Defo Ads" width="400" />
</p>

# Defo Ads

> **100% Free & Private** — A beautiful, local-first React application for creating, optimizing, and translating Google Ads campaigns with AI superpowers. Built by **[DefoAI](https://defoai.com)**.

[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Demo-ads.defoai.com-brightgreen)](https://ads.defoai.com)

<p align="center">
  <a href="https://ads.defoai.com"><strong>🚀 Try Defo Ads Free — No Sign-up Required →</strong></a>
</p>


---

## 🚀 Why Defo Ads?

Managing Google Ads campaigns shouldn't require expensive software or sending your data to the cloud. **Defo Ads** puts you in complete control with a privacy-first approach and AI-powered workflows.

| What You Get | Why It Matters |
|--------------|----------------|
| 🔒 **100% Local-First** | Your data never leaves your browser |
| 🤖 **AI-Powered Generation** | Create complete campaigns in seconds |
| 📊 **Google Ads Editor Compatible** | Import & Export CSV/TSV seamlessly |
| ✨ **Modern Glassmorphism UI** | Beautiful, intuitive interface |
| 🆓 **Completely Free** | No subscriptions, no limits |

---

## 🏗️ Architecture: Local-First, Cloud-Optional

`defo-ads` is designed to be privacy-centric and developer-friendly.

- **🔐 Local-First**: All data is stored in your browser's `localStorage`. No account, no cloud, no tracking.
- **🛡️ Privacy Core**: Your campaign data never leaves your machine unless you explicitly use AI features (which route directly to OpenAI).
- **📈 Excel-Class UX**: Powered by **MUI X Data Grid** with automatic column autosizing for a robust spreadsheet-like experience.
- **✅ Zod Validated**: Strict schema validation ensures your exports are always compatible with Google Ads Editor.

---

## ✨ Features

### 🤖 AI-Powered Campaign Creation

Generate complete Google Ads campaigns from a simple goal description:

- **3-Step Campaign Wizard**: Select Site → Define Goals → Review & Launch
- **Full Campaign Generation**: Creates Campaigns, Ad Groups, Keywords, and Responsive Search Ads in one AI-powered step
- **Cross-Entity Generation**: Generate Ad Groups and Keywords recursively from campaign context
- **Smart Ad Copy**: AI-generated headlines (30 chars) and descriptions (90 chars) that respect Google's limits
- **Sitelink Generation**: Auto-generate 4 relevant sitelinks with descriptions for ad extensions
- **Custom Instructions**: Guide AI generation with your specific requirements via inline popovers

### 🌐 Sites Management

Define global site configurations for brand-consistent AI generation:

- **Centralized Site Context**: URL, description, and SEO keywords in one place
- **Campaign Linking**: Link campaigns to sites for contextual AI generation
- **AI-Powered Analysis**: Let AI analyze your site and generate descriptions automatically
- **One-to-Many**: A single site context powers multiple campaigns

### 🌍 Smart Translation

Translate your ads while respecting Google's strict character limits:

- **Character-Count Aware**: Headlines stay under 30 chars, descriptions under 90
- **Multi-Language Support**: Translate to any language with a single click
- **Preview-First**: See translations before applying them

### 🔄 Google Ads Editor Integration

Seamlessly work with Google's official tool:

- **Import**: Drag & drop or paste CSV/TSV files directly into the app
- **Export**: Download configurations ready for Google Ads Editor
- **Format Support**: CSV and TSV (Tab-separated — preferred for Google Ads Editor)
- **Relational Reconstruction**: Automatically rebuilds Campaign → Ad Group → Keyword → Ad hierarchy from flat files

### 👁️ Visual Ad Preview

See exactly how your ads will appear in Google Search:

- **Live Preview**: Real-time rendering with Google Search styling
- **Sitelink Extensions**: Preview your ad extensions in a 2-column grid
- **Visual Change Tracking**: Highlights AI-modified rows before you commit

### ⚙️ Power User Features

- **Custom Prompt Templates**: Edit the AI prompts used for all generation tasks
- **Variable Interpolation**: Use `{{placeholders}}` for dynamic content injection
- **Restore Defaults**: Reset any prompt to factory settings with one click
- **Bulk Operations**: Multi-select and bulk delete across all entity types

### 🎨 Modern UX Design

- **Glassmorphism UI**: Beautiful blur effects and translucent surfaces
- **Semantic Iconography**: Intuitive icons for campaigns, ad groups, keywords, and ads
- **Inter-Entity Deep Linking**: Click relationships to navigate directly to related entities
- **Empty State Guidance**: Helpful prompts guide you from zero to hero

### 🛡️ Onboarding & Compliance

- **4-Step Intro Wizard**: Welcome → Terms → API Setup → Backup Reminder
- **Terms Acceptance**: Clear data privacy and AI usage policies
- **Backup Reminders**: Encourages regular CSV exports for data safety
- **Danger Zone**: Clear all data while preserving your API keys and templates

---

## 🖥️ Screenshots

| Campaign Management | AI Generation | Ad Preview |
|---------------------|---------------|------------|
| MUI X Data Grid with auto-sizing | 3-step wizard with AI | Google Search preview |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/defoAI/defo-ads.git
   cd defo-ads
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to `http://localhost:5173` and complete the onboarding wizard.

### Using AI Features

To use AI-powered generation:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Enter your key in **Settings → API Configuration**
3. Your key is stored **locally only** — it never leaves your browser

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React + Vite** | Fast, modern frontend framework |
| **Material UI** | Beautiful, accessible components |
| **MUI X Data Grid** | Excel-class data management |
| **Zustand** | Local-first state with persistence |
| **Zod** | Schema validation for exports |
| **Papaparse** | CSV/TSV parsing |

---

## 🌐 Deployment

### Live Instance

A live instance is available at **[ads.defoai.com](https://ads.defoai.com)**

### Self-Hosting

This is an open-source, local-first application. You can:

1. **Run locally**: Clone and run `npm run dev`
2. **Build and deploy**: Build with `npm run build` and deploy the `dist` folder to any static hosting service
3. **No backend required**: This version works entirely in the browser with localStorage

---

## 📖 Documentation

### Prompt Templates

Available template types for customization:

| Template ID | Purpose |
|-------------|---------|
| `campaign_creation` | Complete campaign structure generation |
| `site_analysis` | URL analysis for site metadata |
| `ad_copy_generation` | Headlines & descriptions for RSAs |
| `ad_group_generation` | Ad group creation from campaign |
| `keyword_generation` | Keywords for ad groups |
| `ad_translation` | Character-aware translation |
| `ad_sitelink_generation` | Sitelink extension creation |

### Data Model

```
Site (context)
  └── Campaign
        └── Ad Group
              ├── Keywords
              └── Ads (RSA)
                    └── Sitelinks
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# With analytics enabled (for testing)
VITE_ENABLE_ANALYTICS=true npm run build && npm run preview
```

---

## 📄 License

This project is licensed under the [GNU General Public License v3.0](LICENSE).

---

## 💙 Built with Love

Made by **[DefoAI](https://defoai.com)** — AI-powered productivity tools that respect your privacy.

---

Copyright © 2025 DefoAI UG (haftungsbeschränkt). All rights reserved.
