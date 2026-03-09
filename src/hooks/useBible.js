/**
 * useBible hook
 *
 * Encapsulates all data-fetching state for Bible verses.
 * Components stay purely presentational — they call `search()`
 * and read `{ verse, reference, loading, error }`.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * @returns {{
 *   verse:     string,
 *   reference: string,
 *   loading:   boolean,
 *   error:     string | null,
 *   search:    (passage: string) => void,
 * }}
 */
export function useBible() {
  const [verse,     setVerse]     = useState('');
  const [verses,    setVerses]    = useState([]);
  const [reference, setReference] = useState('');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  /**
   * Fetch a verse from the internal API route.
   * The route handles all upstream concerns.
   */
  const fetch_ = useCallback(async (passage) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bible?passage=${encodeURIComponent(passage)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
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

  // Load verse of the day on mount
  useEffect(() => {
    fetch_('votd');
  }, [fetch_]);

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
