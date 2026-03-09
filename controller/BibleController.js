/**
 * BibleController
 *
 * HTTP layer only. Validates the incoming request, delegates to
 * BibleService for data, and writes the HTTP response.
 * No business logic or API-fetching lives here.
 */

import { getVerse, getVerseOfTheDay, getRandomVerse } from '../src/services/BibleService';

/**
 * In-memory LRU-style cache for upstream Bible API responses.
 * Key: normalised passage string  Value: { result, expiresAt }
 * TTL: 5 min for named passages, 10 s for 'votd'/'random' (they change daily/each call).
 */
const CACHE_TTL_MS   = 5 * 60 * 1000;  // 5 min for exact passages
const VOTD_TTL_MS   = 60 * 60 * 1000; // 1 hr  for verse-of-the-day
const MAX_CACHE_SIZE = 200;

const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.result;
}

function setCached(key, result, ttl) {
  // Evict oldest entry if at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { result, expiresAt: Date.now() + ttl });
}

/**
 * GET /api/bible?passage=<string>
 *
 * Returns: { text: string, reference: string }
 */
export async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { passage } = req.query;

  if (!passage || typeof passage !== 'string' || !passage.trim()) {
    return res.status(400).json({ error: 'Missing required query parameter: passage' });
  }

  const normalised = passage.trim().toLowerCase();

  try {
    // Serve from cache when possible
    const cached = getCached(normalised);
    if (cached) return res.status(200).json(cached);

    let result;

    if (normalised === 'votd') {
      result = await getVerseOfTheDay();
      setCached(normalised, result, VOTD_TTL_MS);
    } else if (normalised === 'random') {
      result = await getRandomVerse();
      // 'random' is intentionally not cached — each call should differ
    } else {
      result = await getVerse(passage.trim());
      setCached(normalised, result, CACHE_TTL_MS);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[BibleController] error:', err.message);

    // Distinguish upstream failures from unexpected crashes
    if (err.message.includes('NET Bible API')) {
      return res.status(502).json({ error: 'Upstream Bible API is unavailable. Please try again.' });
    }

    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
