import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useSpeech — thin wrapper around the Web Speech API.
 *
 * Returns { speaking, speak, stop }
 *   speak(text, label?) — reads `text` followed by an optional `label` (e.g. reference).
 *   stop()              — cancels any ongoing utterance.
 *   speaking            — true while the browser is reading.
 */
export function useSpeech({ lang = 'en-US', rate = 0.88, pitch = 0.95 } = {}) {
  const [speaking, setSpeaking] = useState(false);
  const voicesRef = useRef([]);

  // Voices load asynchronously in most browsers
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text, label = '') => {
    if (!text) return;

    window.speechSynthesis.cancel(); // clear any previous

    const fullText = label ? `${text}. — ${label}` : text;
    const utt = new SpeechSynthesisUtterance(fullText);
    utt.lang  = lang;
    utt.rate  = rate;
    utt.pitch = pitch;

    // Pick the most natural voice available
    const voices = voicesRef.current;
    const voice =
      // 1. Google Natural voices (Chrome)
      voices.find(v => /google.*natural/i.test(v.name) && v.lang.startsWith('en')) ??
      // 2. Any Google en-US
      voices.find(v => /google/i.test(v.name) && v.lang === 'en-US') ??
      // 3. Samantha / Alex (macOS)
      voices.find(v => /samantha|alex/i.test(v.name)) ??
      // 4. Any en-US
      voices.find(v => v.lang === 'en-US') ??
      // 5. Any English
      voices.find(v => v.lang.startsWith('en')) ??
      null;

    if (voice) utt.voice = voice;

    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  }, [lang, rate, pitch]);

  return { speaking, speak, stop };
}
