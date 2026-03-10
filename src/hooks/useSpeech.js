import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useKokoroStore } from '../stores/kokoroStore';
import { useSpeechStore } from '../stores/speechStore';
import { useKokoro } from '../context/KokoroContext';

const NATIVE_MAX_CHARS = 220;

function normalizeSegments(textOrTexts) {
  if (Array.isArray(textOrTexts)) {
    return textOrTexts
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter(Boolean);
  }

  if (typeof textOrTexts !== 'string') return [];
  const text = textOrTexts.trim();
  return text ? [text] : [];
}

function splitForNative(text, maxChars = NATIVE_MAX_CHARS) {
  const src = (text ?? '').trim();
  if (!src) return [];

  const words = src.split(/\s+/);
  const chunks = [];
  let current = '';

  for (const word of words) {
    // Keep extremely long tokens as-is to avoid destructive splitting.
    if (!current) {
      current = word;
      continue;
    }

    const next = `${current} ${word}`;
    if (next.length > maxChars) {
      chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * useSpeech — unified TTS hook supporting native Web Speech API and Kokoro AI.
 * Engine is controlled via useSettingsStore (Zustand).
 *
 * All reactive state lives in global stores:
 *   - nativeSpeaking / voices  → useSpeechStore
 *   - kokoroSpeaking           → useKokoroStore
 *   - ttsEngine / ttsSpeed     → useSettingsStore
 *
 * Returns { speaking, speak, stop }
 */
export function useSpeech({ lang = 'en-US', pitch = 0.95 } = {}) {
  const ttsEngine = useSettingsStore((s) => s.ttsEngine);
  const ttsSpeed = useSettingsStore((s) => s.ttsSpeed);
  const kokoroSpeaking = useKokoroStore((s) => s.speaking);
  const nativeSpeaking = useSpeechStore((s) => s.nativeSpeaking);
  const setNativeSpeaking = useSpeechStore((s) => s.setNativeSpeaking);
  const voices = useSpeechStore((s) => s.voices);
  const kokoro = useKokoro();
  const nativeRunIdRef = useRef(0);
  // Voice loading is handled once globally by initVoices() in _app.js

  const stopNative = useCallback(() => {
    nativeRunIdRef.current += 1;
    window.speechSynthesis.cancel();
    setNativeSpeaking(false);
  }, [setNativeSpeaking]);

  const speakNative = useCallback(
    (textOrTexts, label = '') => {
      const segments = normalizeSegments(textOrTexts);
      if (!segments.length) return;

      nativeRunIdRef.current += 1;
      const runId = nativeRunIdRef.current;
      window.speechSynthesis.cancel();

      // Feed one chunk at a time to avoid huge utterances causing instability.
      const queue = segments.flatMap((segment) => splitForNative(segment));
      if (label) queue.push(`Reference ${label}`);
      if (!queue.length) return;

      // Pick the most natural voice available
      const voice =
        voices.find(
          (v) => /google.*natural/i.test(v.name) && v.lang.startsWith('en')
        ) ??
        voices.find((v) => /google/i.test(v.name) && v.lang === 'en-US') ??
        voices.find((v) => /samantha|alex/i.test(v.name)) ??
        voices.find((v) => v.lang === 'en-US') ??
        voices.find((v) => v.lang.startsWith('en')) ??
        null;

      setNativeSpeaking(true);

      let index = 0;
      const speakNext = () => {
        if (nativeRunIdRef.current !== runId) return;
        if (index >= queue.length) {
          setNativeSpeaking(false);
          return;
        }

        const utt = new SpeechSynthesisUtterance(queue[index]);
        index += 1;
        utt.lang = lang;
        utt.rate = (ttsSpeed ?? 1) * 0.88; // scale: 1× = natural 0.88 rate
        utt.pitch = pitch;

        if (voice) utt.voice = voice;

        utt.onend = speakNext;
        utt.onerror = () => {
          if (nativeRunIdRef.current !== runId) return;
          setNativeSpeaking(false);
        };

        window.speechSynthesis.speak(utt);
      };

      speakNext();
    },
    [lang, pitch, ttsSpeed, voices, setNativeSpeaking]
  );

  const speak = useCallback(
    (textOrTexts, label = '') => {
      const segments = normalizeSegments(textOrTexts);
      if (!segments.length) return;

      if (ttsEngine === 'kokoro') {
        const payload = segments.length === 1 ? segments[0] : segments;
        return kokoro.speak(payload, ttsSpeed ?? 1);
      }

      speakNative(segments, label);
    },
    [ttsEngine, ttsSpeed, kokoro, speakNative]
  );

  const stop = useCallback(() => {
    if (ttsEngine === 'kokoro') return kokoro.stop();
    stopNative();
  }, [ttsEngine, kokoro, stopNative]);

  const speaking = ttsEngine === 'kokoro' ? kokoroSpeaking : nativeSpeaking;

  return { speaking, speak, stop };
}
