/**
 * BibleController
 *
 * HTTP layer only — Edge Runtime version.
 * Uses Web API Request/Response (no Node.js APIs).
 * Relies on Vercel's CDN edge cache (Cache-Control headers)
 * instead of in-memory caching (edge isolates are short-lived).
 */

import {
  getVerse,
  getVerseOfTheDay,
  getRandomVerse,
} from '../services/BibleService';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
import { CACHE_POLICIES } from '../lib/policy';

function cacheControl(normalisedPassage) {
  if (normalisedPassage === 'random') return 'no-store';

  const policy =
    normalisedPassage === 'votd'
      ? CACHE_POLICIES.BIBLE_VOTD
      : CACHE_POLICIES.BIBLE_PASSAGE;

  return `public, s-maxage=${policy.cdn_maxage}, stale-while-revalidate=${policy.cdn_swr}`;
}

function json(data, status, normalisedPassage) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': normalisedPassage
        ? cacheControl(normalisedPassage)
        : 'no-store',
      ...CORS_HEADERS,
    },
  });
}

/**
 * GET /api/bible?passage=<string>
 *
 * Returns: { text: string, reference: string, verses: [...] }
 */
export async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const { searchParams } = new URL(req.url);
  const passage = searchParams.get('passage');

  if (!passage || !passage.trim()) {
    return json({ error: 'Missing required query parameter: passage' }, 400);
  }

  const normalised = passage.trim().toLowerCase();

  try {
    let result;

    if (normalised === 'votd') {
      result = await getVerseOfTheDay();
    } else if (normalised === 'random') {
      result = await getRandomVerse();
    } else {
      result = await getVerse(passage.trim());
    }

    return json(result, 200, normalised);
  } catch (err) {
    console.error('[BibleController] error:', err.message);

    if (err.message.includes('NET Bible API')) {
      return json(
        { error: 'Upstream Bible API is unavailable. Please try again.' },
        502
      );
    }

    return json({ error: 'Unexpected server error' }, 500);
  }
}
