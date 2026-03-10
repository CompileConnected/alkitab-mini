import { create } from 'zustand';
import { withDevtools } from './withDevtools';

/**
 * Module-level session cache: avoids re-fetching passages the user already
 * looked up during the current browser session.
 * Lives outside Zustand so it survives store resets.
 */
const sessionCache = new Map();

/**
 * bibleStore — global state for all Bible data and search UI.
 *
 * Replaces:
 *   - verse / verses / reference / loading / error (previously in useBible)
 *   - input / isSearched / copied  (previously local useState in pages/index.js)
 */
export const useBibleStore = create(
  withDevtools(
    (set, get) => ({
      // ── Bible data ─────────────────────────────────────────────────────────
      verse: '',
      verses: [],
      reference: '',
      loading: false,
      error: null,

      // ── Actions ────────────────────────────────────────────────────────────
      /**
       * Seed the store with ISR/SSR data and warm the session cache.
       * Call once from useBible when initialVerse is available.
       */
      init: (initialVerse) => {
        if (!initialVerse) return;
        sessionCache.set('votd', initialVerse);
        set({
          verse: initialVerse.text ?? '',
          verses: initialVerse.verses ?? [],
          reference: initialVerse.reference ?? '',
          loading: false,
          error: null,
        });
      },

      /**
       * Fetch a passage from the internal API, with session caching.
       */
      fetchVerse: async (passage) => {
        const key = passage.trim().toLowerCase();
        const hit = sessionCache.get(key);
        if (hit) {
          set(
            {
              verse: hit.text,
              verses: hit.verses ?? [],
              reference: hit.reference,
              loading: false,
              error: null,
            },
            false,
            'fetchVerse/cache'
          );
          return;
        }

        set({ loading: true, error: null }, false, 'fetchVerse/start');
        try {
          // Use globalThis.fetch to avoid shadowing by local variable names
          const res = await globalThis.fetch(
            `/api/bible?passage=${encodeURIComponent(passage)}`
          );
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error ?? `Request failed (${res.status})`);
          if (key !== 'random') sessionCache.set(key, data);
          set(
            {
              verse: data.text,
              verses: data.verses ?? [],
              reference: data.reference,
              loading: false,
            },
            false,
            'fetchVerse/done'
          );
        } catch (err) {
          set(
            {
              error: err.message ?? 'Could not load verse. Please try again.',
              loading: false,
            },
            false,
            'fetchVerse/error'
          );
        }
      },

      /**
       * Public search entry-point used by components.
       * Pass "votd" for verse of the day, "random" for a random verse.
       */
      search: (passage) => {
        if (!passage?.trim()) return;
        get().fetchVerse(passage.trim());
      },
    }),
    { name: 'BibleStore', store: 'AlkitabMini' }
  )
);
