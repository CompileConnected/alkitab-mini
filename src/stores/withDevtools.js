import { devtools } from 'zustand/middleware';

/**
 * Conditionally apply Zustand devtools middleware.
 * In production builds devtools is a passthrough — zero overhead,
 * no action history kept in memory, nothing shipped to the browser.
 *
 * Usage (identical to plain devtools):
 *   create(withDevtools(fn, { name: 'MyStore', store: 'AlkitabMini' }))
 */
export const withDevtools =
  process.env.NODE_ENV === 'production'
    ? (fn) => fn // production: passthrough, ignore options
    : (fn, options) => devtools(fn, options); // development: full devtools
