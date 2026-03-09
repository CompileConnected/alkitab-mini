import { create } from 'zustand';
import { withDevtools } from './withDevtools';

/**
 * Async feature status — used for APIs that require a runtime probe.
 * @typedef {'unknown' | 'checking' | 'ready' | 'needs-download' | 'unavailable'} FeatureStatus
 */

// ── Synchronous capability detection ─────────────────────────────────────────
// Evaluated once at module load. Safe for SSR (guarded by typeof checks).
const _webgpu = typeof navigator !== 'undefined' && !!navigator.gpu;
const _wasm = typeof WebAssembly !== 'undefined';
const _speechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * webFeaturesStore — single source of truth for browser web-feature availability.
 *
 * Covers:
 *   • webgpu          — WebGPU (used by Kokoro AI, WebGL, etc.)
 *   • wasm            — WebAssembly (used by Kokoro AI wasm backend)
 *   • speechSynthesis — Web Speech API / native TTS
 *   • geminiNano      — Chrome Built-in AI / Gemini Nano (Prompt API, Chrome 127+)
 *   • translationApi  — Chrome Translation API (Chrome 138+)
 *
 * Usage:
 *   1. Import the store anywhere — sync flags are immediately available.
 *   2. Call `check()` once at app startup (e.g. in _app.js) to probe the
 *      async APIs and populate `geminiNano` / `translationApi`.
 */
export const useWebFeaturesStore = create(
    withDevtools(
        (set) => ({
            // ── Sync flags (reliable immediately, no async needed) ──────────────────
            webgpu: _webgpu,
            wasm: _wasm,
            speechSynthesis: _speechSynthesis,

            // ── Async flags (unknown until check() resolves) ─────────────────────────
            /** @type {FeatureStatus} */
            geminiNano: 'unknown',
            /** @type {FeatureStatus} */
            translationApi: 'unknown',

            /**
             * Probe async browser APIs.
             * Safe to call multiple times — skips any feature already checked.
             * Recommended: call once in _app.js `useEffect`.
             */
            check: async () => {
                // Wait for DevTools to finish connecting before dispatching any actions.
                // Without this, synchronous set() calls in the else-if branches fire
                // before the DevTools extension has subscribed to the store.
                await new Promise((r) => setTimeout(r, 100));

                set({}, false, 'check/start');

                // ── Gemini Nano / Prompt API ─────────────────────────────────────────
                // set() 3rd arg = action label shown in Redux DevTools
                if (typeof window !== 'undefined' && window?.ai?.languageModel) {
                    set({ geminiNano: 'checking' }, false, 'check/geminiNano/checking');
                    try {
                        // Chrome 128+ exposes .availability(), older builds skip it
                        const avail = typeof window.ai.languageModel.availability === 'function'
                            ? await window.ai.languageModel.availability()
                            : 'readily'; // API present but no availability() — assume ready

                        const geminiNano =
                            avail === 'readily' ? 'ready' :
                                avail === 'after-download' ? 'needs-download' :
                                    'unavailable';
                        set({ geminiNano }, false, `check/geminiNano/${geminiNano}`);
                    } catch {
                        set({ geminiNano: 'unavailable' }, false, 'check/geminiNano/error');
                    }
                } else if (typeof window !== 'undefined') {
                    set({ geminiNano: 'unavailable' }, false, 'check/geminiNano/no-api');
                }

                // ── Translation API ──────────────────────────────────────────────────
                if (typeof window !== 'undefined' && 'translation' in window) {
                    set({ translationApi: 'checking' }, false, 'check/translationApi/checking');
                    try {
                        // Probe with a common language pair (en → id)
                        const can = await window.translation.canTranslate({
                            sourceLanguage: 'en',
                            targetLanguage: 'id',
                        });
                        const translationApi =
                            can === 'readily' ? 'ready' :
                                can === 'after-download' ? 'needs-download' :
                                    'unavailable';
                        set({ translationApi }, false, `check/translationApi/${translationApi}`);
                    } catch {
                        set({ translationApi: 'unavailable' }, false, 'check/translationApi/error');
                    }
                } else if (typeof window !== 'undefined') {
                    set({ translationApi: 'unavailable' }, false, 'check/translationApi/no-api');
                }
            },
        }),
        { name: 'WebFeaturesStore', store: 'AlkitabMini' },
    ),
);
