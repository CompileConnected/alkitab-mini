/**
 * useBible hook
 *
 * Thin adapter over useBibleStore.
 * Handles mount-time side effects (loading the initial verse) while all
 * reactive state lives in the global store so any component can subscribe to it.
 *
 * API is intentionally identical to the previous hook so call-sites need no changes.
 */

import { useEffect, useRef } from 'react';
import { useBibleStore } from '../stores/bibleStore';

/**
 * @param {object|null} initialVerse  Pre-fetched VOTD from getStaticProps (ISR).
 */
export function useBible(initialVerse = null) {
  // Seed the store synchronously on the first render so components read
  // correct ISR data immediately — no extra render cycle or flash of empty state.
  const seeded = useRef(false);
  if (!seeded.current && initialVerse) {
    seeded.current = true;
    useBibleStore.getState().init(initialVerse);
  }

  // Reactive selectors — components re-render on store changes
  const verse     = useBibleStore(s => s.verse);
  const verses    = useBibleStore(s => s.verses);
  const reference = useBibleStore(s => s.reference);
  const loading   = useBibleStore(s => s.loading);
  const error     = useBibleStore(s => s.error);
  const search    = useBibleStore(s => s.search);

  // Client-side fetch on mount when no ISR data was provided
  useEffect(() => {
    if (seeded.current) return; // already seeded from ISR
    seeded.current = true;
    useBibleStore.getState().fetchVerse('votd');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { verse, verses, reference, loading, error, search };
}
