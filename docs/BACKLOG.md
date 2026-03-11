```markdown
# Migration Backlog: Alkitab Mini → TanStack Start

This document tracks the planned full migration from **Next.js Pages Router** to **TanStack Start** (Vite + TanStack Router + TanStack Query) with a full TypeScript rewrite.

**Goal**: Production-quality demonstrating the TanStack ecosystem, TypeScript end-to-end type safety, clean architecture, and PWA-first design.

---

## Target Stack

| Layer        | Current                           | Target                                                       |
| ------------ | --------------------------------- | ------------------------------------------------------------ |
| Framework    | Next.js Pages Router              | **TanStack Start** (Vite + Vinxi)                            |
| Router       | Next.js file routing              | **TanStack Router** (type-safe, code-gen)                    |
| Server state | Manual `Map` session cache        | **TanStack Query** (staleTime + gcTime SWR)                  |
| Server API   | `pages/api/bible.js` Edge Runtime | **`createServerFn()`** with Zod validation                   |
| UI State     | Zustand 5                         | Zustand 5 _(no change)_                                      |
| Language     | JavaScript (.js/.jsx)             | **TypeScript strict** (.ts/.tsx)                             |
| Build        | Turbopack + esbuild (SW)          | **Vite** + @vitejs/plugin-legacy + esbuild (SW)              |
| Deployment   | Vercel (Next.js native)           | Vercel via **Nitro adapter**                                 |
| PWA          | Custom esbuild SW                 | vite-plugin-pwa + Workbox (or keep custom)                   |
| Styling      | Tailwind CSS 4                    | Tailwind CSS 4 _(no change)_                                 |
| Old browser  | core-js / regenerator             | **@vitejs/plugin-legacy** (Chrome 54+ dual bundle) + core-js |

---

## File Migration Map

| Current                               | Target                                    |
| ------------------------------------- | ----------------------------------------- |
| `pages/_app.js` + `_document.js`      | `src/routes/__root.tsx`                   |
| `pages/index.js`                      | `src/routes/index.tsx`                    |
| `pages/present.js`                    | `src/routes/present.tsx`                  |
| `pages/special/papa-2020-des.js`      | `src/routes/special/papa-2020-des.tsx` ❤️ |
| `pages/api/bible.js`                  | `src/server/getBible.ts` (createServerFn) |
| `src/components/*.jsx`                | `src/components/*.tsx`                    |
| `src/stores/*.js`                     | `src/stores/*.ts`                         |
| `src/hooks/useBible.js`               | `src/hooks/useBible.ts` (useQuery)        |
| `src/hooks/useSpeech.js`              | `src/hooks/useSpeech.ts`                  |
| `src/hooks/useAITranslation.js`       | `src/hooks/useAITranslation.ts`           |
| `src/services/BibleService.js`        | `src/services/BibleService.ts`            |
| `src/repositories/BibleRepository.js` | `src/repositories/BibleRepository.ts`     |
| `src/context/KokoroContext.jsx`       | `src/context/KokoroContext.tsx`           |
| `src/controller/BibleController.js`   | _Deleted — replaced by createServerFn_    |
| `next.config.js`                      | `vite.config.ts` + `app.config.ts`        |
| `vercel.json`                         | Updated for Nitro output                  |

---

## Backlog

### Phase 1 — Bootstrap & Config

> _No app logic yet. Sets up the new project skeleton._

- [ ] **BACK-001** Scaffold TanStack Start project with `npm create tsrouter-app@latest` (TypeScript + TanStack Query template)
- [ ] **BACK-002** Configure `vite.config.ts`:
  - `@vitejs/plugin-legacy` → `targets: ['Chrome 54', 'Android >= 5']` (dual JS bundle)
  - Nitro adapter for Vercel
  - `optimizePackageImports` for FontAwesome tree-shaking
  - Retain COEP/COOP headers for ONNX WASM SharedArrayBuffer
- [ ] **BACK-003** Configure `tsconfig.json` with `strict: true`, path aliases (`@/` → `src/`)
- [ ] **BACK-004** Install all dependencies: TanStack Router, TanStack Query, Zod, Zustand, Tailwind 4, anime.js, kokoro-js, core-js, regenerator-runtime, FontAwesome
- [ ] **BACK-005** Port `eslint.config.js`, Prettier config, Husky pre-commit hooks
- [ ] **BACK-006** Port `public/` assets (manifest.json, icons/) and `styles/globals.css`

---

### Phase 2 — TypeScript Core Layer

> _Migrate service/data layer without touching UI. Independent of Phase 1 except needs tsconfig._

- [ ] **BACK-007** Create `src/types/bible.ts` — interfaces: `VerseResult`, `ParsedReference`, `BibleApiResponse`, `SearchMode`
- [ ] **BACK-008** Migrate `BibleRepository.js → .ts` — typed fetch, return `Promise<BibleApiResponse>`, typed error class
- [ ] **BACK-009** Migrate `BibleService.js → .ts` — typed `toVerseResult()`, export typed `searchModes`
- [ ] **BACK-010** Migrate all 7 Zustand stores to TypeScript:
  - Define `State` + `Actions` interface for each store
  - Strongly type `persist` options and `devtools` middleware
  - Add Zustand store selector type helpers

---

### Phase 3 — Routing & Server Functions

> _Depends on Phase 2. Core app routes and API replacement._

- [ ] **BACK-011** Create `src/routes/__root.tsx` (root layout):
  - Wraps `RouterProvider`, `QueryClientProvider`, `KokoroContext`
  - Ports global `<Head>` meta, Vercel Analytics, global CSS
  - Includes TanStack Router Devtools + TanStack Query Devtools (collapsible panels)
- [ ] **BACK-012** Create `src/server/getBible.ts` using `createServerFn()`:
  - Zod input schema: `{ passage: z.string(), mode: SearchModeEnum.optional() }`
  - Preserve same `Cache-Control` headers (VOTD 6h, passages 24h, random no-cache)
  - Typed return: `Promise<VerseResult[]>`
- [ ] **BACK-013** Create `src/routes/index.tsx` (home page):
  - Route `loader: () => ensureQueryData(votdQueryOptions())` — replaces Next.js ISR VOTD seed
  - `staleTime: 21_600_000` replicates 6h ISR behavior
  - Port search form, verse card, info modal, settings modal
- [ ] **BACK-014** Create `src/routes/present.tsx` (teleprompter):
  - `validateSearch: z.object({ passage: z.string(), vpp: z.coerce.number().optional() })`
  - Fixes current bug: URL param changes now re-trigger search (type-safe search params)
  - Port all teleprompter navigation and gesture logic
- [ ] **BACK-015** Create `src/routes/special/papa-2020-des.tsx`:
  - Port full slide deck logic unchanged
  - Replace `useRouter` from next/router → TanStack Router `useNavigate()`
  - Keep all inline styles, animations, `Lora` + `Inter` fonts, Divider, SlideLayout, Body components

---

### Phase 4 — TanStack Query Integration

> _Depends on Phase 3. Replaces manual session cache with proper query layer._

- [ ] **BACK-016** Create `src/queries/bibleQueries.ts`:
  - `votdQueryOptions()` — `queryKey: ['bible', 'votd']`, `staleTime: 21_600_000`
  - `passageQueryOptions(passage)` — `queryKey: ['bible', passage]`, `staleTime: 86_400_000`
  - `randomQueryOptions()` — `queryKey: ['bible', 'random', Date.now()]`, `staleTime: 0`
- [ ] **BACK-017** Migrate `hooks/useBible.js → .ts`:
  - Replace `sessionCache` Map + manual loading flags with `useQuery(passageQueryOptions(passage))`
  - Remove `sessionCache` logic from `bibleStore.ts`
  - `isLoading` / `isError` / `data` come from query, not manual state
- [ ] **BACK-018** Update `bibleStore.ts` — remove cache fields; keep only display state (`verses`, `reference`)

---

### Phase 5 — Components TypeScript Migration

> _Parallel with Phase 4. Depends on Phase 2 types._

- [ ] **BACK-019** Migrate `Head.jsx → .tsx` — typed `title`, `description` props
- [ ] **BACK-020** Migrate `VerseCard.jsx → .tsx` — typed `verse: VerseResult` prop
- [ ] **BACK-021** Migrate `SearchForm.jsx → .tsx` — typed `onSearch`, `isLoading` props
- [ ] **BACK-022** Migrate `Teleprompter.jsx → .tsx` — typed all slide navigation props
- [ ] **BACK-023** Migrate `SpeakButton.jsx → .tsx`
- [ ] **BACK-024** Migrate `SettingsModal.jsx → .tsx`
- [ ] **BACK-025** Migrate `InfoModal.jsx → .tsx`
- [ ] **BACK-026** Migrate `TranslationSection.jsx → .tsx`
- [ ] **BACK-027** Migrate `VerseAnimation.jsx → .tsx`
- [ ] **BACK-028** Migrate `Section.jsx → .tsx`
- [ ] **BACK-029** Wrap Kokoro-dependent sections (SettingsModal heavy part) in `<Suspense>` + `<ErrorBoundary>` — graceful fallback on old/low-RAM devices
- [ ] **BACK-030** Add `aria-hidden="true"` to all decorative FontAwesome icons (a11y fix)

---

### Phase 6 — PWA & Service Worker

> _Parallel with Phase 5._

- [ ] **BACK-031** Option A: Port existing custom `src/service-worker/sw.ts` (rename to `.ts`) + keep esbuild script targeting ES2015
- [ ] **BACK-032** Option B (recommended for portfolio): Replace with `vite-plugin-pwa` + Workbox:
  - `generateSW` strategy with precache for app shell
  - Runtime caching: Bible API responses (NetworkFirst, 24h expiry)
  - Configure `manifest.json` in Vite plugin config
- [ ] **BACK-033** Test offline-first: verse cached after first visit, app shell loads without network

---

### Phase 7 — Polish & Portfolio Finish

> _Depends on all phases above._

- [ ] **BACK-034** Run `npx tsc --noEmit` — resolve all TypeScript errors to zero
- [ ] **BACK-035** Add Zod output validation to `getBible` server function (parse + strip response from upstream API)
- [ ] **BACK-036** Verify dual-bundle output: confirm `vite build` emits both modern ESM and legacy SystemJS bundles
- [ ] **BACK-037** Test in Chrome 54 emulation (DevTools → device toolbar → custom device UA)
- [ ] **BACK-038** Confirm VOTD is SSR-rendered (view source shows verse text, not blank)
- [ ] **BACK-039** Test deep-link: `/present?passage=John+3:16&vpp=5` — both params honored on load AND on URL change
- [ ] **BACK-040** Update `README.md` with updated stack badges and architecture diagram
- [ ] **BACK-041** Set up `BACK-041`: Vercel deployment test with Nitro adapter output

---

## Open Questions

| #   | Question                                                                                    | Recommendation                                                                |
| --- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Q1  | **Tailwind 4 CSS on Chrome 54**: `@layer` requires Chrome 99+; plugin-legacy only covers JS | Accept: most "old Android" users have updated Chrome to 80+; Tailwind 4 stays |
| Q2  | **Deployment: Vercel vs Cloudflare Workers**                                                | Stay Vercel (Vercel Analytics already integrated, familiar workflow)          |
| Q3  | **PWA: custom esbuild SW vs vite-plugin-pwa**                                               | vite-plugin-pwa generates better portfolio story (standard Workbox patterns)  |

---

## Architecture Decision Records

**ADR-001: TanStack Query + Zustand coexist**
TanStack Query owns server/async state (Bible verses, query status). Zustand owns client/UI state (TTS, settings, teleprompter layout). This is the canonical TanStack pattern — no duplication, clear separation.

**ADR-002: ISR replaced by HTTP cache headers**
`Cache-Control: s-maxage=21600, stale-while-revalidate=3600` on the `getBible` server function achieves the same CDN behavior as Next.js ISR. No framework-specific magic.

**ADR-003: Special page preserved as-is**
`/special/papa-2020-des` is migrated with all inline styles and content preserved exactly. Only routing primitives (`useRouter` → `useNavigate`) are updated. ❤️

**ADR-004: Kokoro mobile gate unchanged**
Kokoro AI TTS remains disabled on mobile (`_isMobile` guard). No change to UX logic — this protects low-RAM devices from a ~92–320 MB model download.
```
