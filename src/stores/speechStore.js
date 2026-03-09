import { create } from 'zustand';
import { withDevtools } from './withDevtools';

// Guard: ensure the voiceschanged listener is registered only once
let voicesInitialized = false;

/**
 * speechStore — global state for native Web Speech API TTS.
 *
 * Voice loading lives here rather than in useSpeech so:
 *   - Only one 'voiceschanged' listener is ever registered.
 *   - setVoices fires exactly once (when the list is non-empty and stable).
 */
export const useSpeechStore = create(
  withDevtools(
    (set) => ({
      // Whether the native speechSynthesis engine is currently producing audio
      nativeSpeaking: false,

      // Available voices — populated by initVoices()
      voices: [],

      // Actions
      setNativeSpeaking: (nativeSpeaking) => set({ nativeSpeaking }),

      /**
       * Register a single 'voiceschanged' listener and load voices.
       * Safe to call multiple times — only initialises once.
       * Call from _app.js so it runs before any component needs voices.
       */
      initVoices: () => {
        if (voicesInitialized || typeof window === 'undefined') return;
        voicesInitialized = true;

        const load = () => {
          const list = window.speechSynthesis.getVoices();
          // Only commit once we have a non-empty list
          if (list.length > 0) {
            set({ voices: list }, false, 'initVoices/loaded');
            window.speechSynthesis.removeEventListener('voiceschanged', load);
          }
        };

        // Voices may already be available (Firefox / some Chromium builds)
        const immediate = window.speechSynthesis.getVoices();
        if (immediate.length > 0) {
          set({ voices: immediate }, false, 'initVoices/immediate');
        } else {
          window.speechSynthesis.addEventListener('voiceschanged', load);
        }
      },
    }),
    { name: 'SpeechStore', store: 'AlkitabMini' },
  ),
);