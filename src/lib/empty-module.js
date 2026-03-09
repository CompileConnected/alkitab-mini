// Empty browser stub for Node.js-only modules (fs, fs/promises).
// kokoro-js checks for readFile at runtime and falls back to fetch() in the browser.
export default {};
export const readFile = undefined;
