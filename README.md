# Alkitab Mini

A modern, offline-capable web Bible app for daily verse reading, passage search, and full-screen presentation. Built with a clean layered architecture and designed to run on older Android/iOS devices.

**Live**: [alkitab-mini.vercel.app](https://alkitab-mini.vercel.app)

---

## Features

### Core Reading

- **Verse of the Day** — pre-rendered at build time via ISR (revalidates every 6 hours); works without JS
- **Passage Search** — supports references like `John 3:16`, `Psalm 23:1-3`, `Matthew 5:1-12`, or `random`
- **Present / Teleprompter Mode** — full-screen display with configurable verses-per-page (`?vpp=N`), keyboard navigation (←→ arrow keys, Page Up/Down), and touch swipe gestures
- **Special Page** — a personal slide deck at `/special/papa-2020-des` ❤️

### Text-to-Speech (TTS)

- **Native Web Speech API** — instant playback, works on all modern browsers; text chunked to 220-char segments to avoid iOS/Android crashes; smart voice priority (Google Natural → Google → Samantha/Alex → system default)
- **Kokoro AI TTS** — on-device high-quality neural synthesis powered by [kokoro-js](https://github.com/hexgrad/kokoro-js) + ONNX Runtime; available in WebGPU (high quality) or WASM (broad compatibility) backends; disabled on mobile to protect RAM

### AI Features

- **On-device Translation** — uses Chrome's built-in Translation API (Gemini Nano) to translate verse text without sending data to a server; requires Chrome 127+; graceful fallback on unsupported browsers
- **Kokoro backend selection** — user can choose between WebGPU (fp32, ~320 MB) and WASM (q8, ~92 MB) models

### Customization

- Font size (adjustable slider)
- Font family (Serif / Sans)
- TTS playback speed
- Kokoro backend selection (WebGPU / WASM)
- All preferences persisted to localStorage

### Performance & Offline

- **PWA** — installable on Android/iOS home screen with offline access; custom service worker (esbuild-bundled, ES2015 target)
- **Intelligent caching** — Vercel Edge CDN: VOTD `s-maxage=21600, stale-while-revalidate=3600`; passages `s-maxage=86400, stale-while-revalidate=43200`; session-level in-memory cache for dedup during browsing
- **ISR** — Verse of the Day is statically pre-rendered at build time and regenerated server-side every 6 hours
- **Polyfills** — `core-js` + `regenerator-runtime` for broad ES5 compatibility on older devices

### Accessibility & UX

- Responsive Tailwind CSS layout (mobile-first)
- `aria-label` attributes on interactive controls
- Smooth animations via anime.js (cubic-bezier easing on verse card, search form)
- Verse animation with configurable entrance effects

---

## Architecture

Components (UI)
↓
Hooks (useBible, useSpeech, useAITranslation)
↓
Stores (Zustand — bibleStore, settingsStore, speechStore,
kokoroStore, teleprompterStore, translationStore,
webFeaturesStore)
↓
Services (BibleService — formatting, reference building)
↓
Repositories (BibleRepository — NET Bible API fetch)
↓
API Handler (pages/api/bible.js — Vercel Edge Runtime)

**State stores:**

| Store               | Persisted | Purpose                                                         |
| ------------------- | --------- | --------------------------------------------------------------- |
| `bibleStore`        | No        | Active verse data                                               |
| `settingsStore`     | Yes (v2)  | Font, TTS speed, Kokoro backend                                 |
| `speechStore`       | No        | Available voices, playback state                                |
| `kokoroStore`       | No        | Model load status & progress                                    |
| `teleprompterStore` | Yes       | Verses-per-page, layout prefs                                   |
| `translationStore`  | No        | AI translation session & state                                  |
| `webFeaturesStore`  | No        | Browser capability detection (WebGPU, WASM, Speech API, mobile) |

---

## Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Framework      | Next.js (Pages Router), React                             |
| Styling        | Tailwind CSS 4, PostCSS                                   |
| State          | Zustand 5                                                 |
| TTS (AI)       | kokoro-js (ONNX Runtime via Hugging Face Transformers.js) |
| TTS (Native)   | Web Speech API                                            |
| AI Translation | Chrome Translation API / Prompt API (Gemini Nano)         |
| Animation      | anime.js 4                                                |
| Icons          | FontAwesome 7 (SVG tree-shaken)                           |
| Analytics      | Vercel Analytics                                          |
| Service Worker | esbuild (ES2015 bundle)                                   |
| Polyfills      | core-js 3, regenerator-runtime                            |
| Lint / Format  | ESLint 9 (jsx-a11y, security, sonarjs), Prettier, Husky   |

---

## Getting Started

```bash
pnpm install
pnpm dev        # Starts Next.js with Turbopack on http://localhost:3000
```

## Build

```bash
pnpm build      # Bundles service worker (esbuild) then builds Next.js
pnpm start      # Serves production build
```

## Bible Data

Verses are sourced from the NET Bible API (labs.bible.org). No Bible data is bundled — the app caches responses at the CDN and session level.

---
