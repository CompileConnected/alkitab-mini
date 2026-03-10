/**
 * BibleService
 *
 * Business logic layer. Consumes BibleRepository and returns
 * shaped, UI-ready data. Never touches HTTP request/response objects.
 */

import {
  fetchVersesByPassage,
  fetchVerseOfTheDay,
  fetchRandomVerse,
} from '../repositories/BibleRepository';

/**
 * Build a human-readable reference string from a raw verse object.
 * e.g. { bookname: 'John', chapter: '3', verse: '16' } → "John 3:16"
 *
 * @param {import('../repositories/BibleRepository').VerseRaw} raw
 * @returns {string}
 */
function formatReference(raw) {
  return `${raw.bookname} ${raw.chapter}:${raw.verse}`;
}

/**
 * Combine an array of verse objects into a single passage result.
 * Multiple verses are concatenated with a space.
 *
 * @param {import('../repositories/BibleRepository').VerseRaw[]} raws
 * @returns {VerseResult}
 */
function toVerseResult(raws) {
  if (!raws || raws.length === 0) {
    throw new Error('No verse data returned from API');
  }

  const text = raws.map((v) => v.text.trim()).join(' ');

  // Individual verses with their numbers preserved
  const verses = raws.map((v) => ({
    verse: parseInt(v.verse, 10),
    text: v.text.trim(),
  }));

  // Reference: "John 3:16" for single verse, "John 3:16–17" for range
  const first = raws[0];
  const last = raws[raws.length - 1];

  let reference;
  if (raws.length === 1) {
    reference = formatReference(first);
  } else if (
    first.bookname === last.bookname &&
    first.chapter === last.chapter
  ) {
    reference = `${first.bookname} ${first.chapter}:${first.verse}–${last.verse}`;
  } else {
    reference = `${formatReference(first)}–${formatReference(last)}`;
  }

  return { text, verses, reference };
}

/**
 * Get verses for a given passage string.
 *
 * @param {string} passage  e.g. "John 3:16", "Psalm 23:1-3"
 * @returns {Promise<VerseResult>}
 */
export async function getVerse(passage) {
  const raws = await fetchVersesByPassage(passage);
  return toVerseResult(raws);
}

/**
 * Get the Verse of the Day.
 *
 * @returns {Promise<VerseResult>}
 */
export async function getVerseOfTheDay() {
  const raws = await fetchVerseOfTheDay();
  return toVerseResult(raws);
}

/**
 * Get a random verse.
 *
 * @returns {Promise<VerseResult>}
 */
export async function getRandomVerse() {
  const raws = await fetchRandomVerse();
  return toVerseResult(raws);
}

/**
 * @typedef {Object} VerseResult
 * @property {string}       text       Full concatenated text (no HTML)
 * @property {string}       reference  Human-readable reference, e.g. "John 3:16"
 * @property {VerseItem[]}  verses     Individual verse objects with numbers
 */

/**
 * @typedef {Object} VerseItem
 * @property {number} verse  Verse number
 * @property {string} text   Verse text
 */
