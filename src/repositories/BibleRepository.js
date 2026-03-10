/**
 * BibleRepository
 *
 * Sole responsibility: communicate with the NET Bible Web Service.
 * All other layers depend on this; nothing else should talk directly
 * to labs.bible.org.
 *
 * API base: https://labs.bible.org/api/
 * Docs:     https://labs.bible.org/api_web_service
 */

const BASE_URL = 'https://labs.bible.org/api/';

/**
 * Build a URL for the NET Bible API.
 * Always requests JSON + plain text so callers get clean strings.
 *
 * @param {string} passage  e.g. "John 3:16", "random", "votd"
 * @returns {string}
 */
function buildUrl(passage) {
  const params = new URLSearchParams({
    passage: passage,
    type: 'json',
    formatting: 'plain',
  });
  return `${BASE_URL}?${params.toString()}`;
}

/**
 * Fetch one or more verses by passage string.
 *
 * @param {string} passage
 * @returns {Promise<VerseRaw[]>}  Array of raw verse objects from the API
 * @throws {Error} on non-2xx response or network failure
 */
export async function fetchVersesByPassage(passage) {
  if (!passage || typeof passage !== 'string') {
    throw new Error('passage must be a non-empty string');
  }

  const res = await fetch(buildUrl(passage.trim()));

  if (!res.ok) {
    throw new Error(`NET Bible API responded with ${res.status}`);
  }

  const data = await res.json();

  // The API returns a single object (not an array) when using type=json
  // for some edge cases — normalise to always be an array.
  return Array.isArray(data) ? data : [data];
}

/**
 * Fetch the Verse of the Day.
 *
 * @returns {Promise<VerseRaw[]>}
 */
export async function fetchVerseOfTheDay() {
  return fetchVersesByPassage('votd');
}

/**
 * Fetch a random verse.
 *
 * @returns {Promise<VerseRaw[]>}
 */
export async function fetchRandomVerse() {
  return fetchVersesByPassage('random');
}

/**
 * @typedef {Object} VerseRaw
 * @property {string} bookname
 * @property {string} chapter
 * @property {string} verse
 * @property {string} text
 * @property {string} [title]
 */
