/**
 * useBible hook
 *
 * Encapsulates all data-fetching state for Bible verses.
 * Components stay purely presentational — they call `search()`
 * and read `{ verse, reference, loading, error }`.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Module-level session cache: avoids re-fetching passages the user already
 * looked up during the current browser session.
 * Key: passage string  Value: { text, verses, reference }
 */
const sessionCache = new Map();

/**
 * @param {object|null} initialVerse  Pre-fetched VOTD from getStaticProps (ISR).
 * @returns {{
 *   verse:     string,
 *   reference: string,
 *   loading:   boolean,
 *   error:     string | null,
 *   search:    (passage: string) => void,
 * }}
 */
export function useBible(initialVerse = null) {
  const [verse,     setVerse]     = useState(initialVerse?.text      ?? '');
  const [verses,    setVerses]    = useState(initialVerse?.verses    ?? []);
  const [reference, setReference] = useState(initialVerse?.reference ?? '');
  // Skip loading state if ISR already provided the data
  const [loading,   setLoading]   = useState(!initialVerse);
  const [error,     setError]     = useState(null);

  // Seed the cache with the server-provided VOTD so the first search
  // for 'votd' is also free.
  const seeded = useRef(false);
  if (initialVerse && !seeded.current) {
    sessionCache.set('votd', initialVerse);
    seeded.current = true;
  }

  /**
   * Fetch a verse from the internal API route.
   * The route handles all upstream concerns.
   */
  const fetch_ = useCallback(async (passage) => {
    const key = passage.trim().toLowerCase();

    // Serve from session cache instantly — no network round-trip.
    const hit = sessionCache.get(key);
    if (hit) {
      setVerse(hit.text);
      setVerses(hit.verses ?? []);
      setReference(hit.reference);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bible?passage=${encodeURIComponent(passage)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      // Cache for the duration of this browser session (except 'random').
      if (key !== 'random') {
        sessionCache.set(key, data);
      }

      setVerse(data.text);
      setVerses(data.verses ?? []);
      setReference(data.reference);
    } catch (err) {
      setError(err.message ?? 'Could not load verse. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load verse of the day on mount — skipped when ISR already provided the data.
  useEffect(() => {
    if (initialVerse) return;
    fetch_('votd');
  }, [fetch_, initialVerse]);

  /**
   * Trigger a search for any passage string.
   * Pass "votd" for verse of the day, "random" for a random verse.
   *
   * @param {string} passage
   */
  const search = useCallback((passage) => {
    if (!passage || !passage.trim()) return;
    fetch_(passage.trim());
  }, [fetch_]);

  return { verse, verses, reference, loading, error, search };
}
