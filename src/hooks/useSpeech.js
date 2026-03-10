import { useCallback } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useKokoroStore } from '../stores/kokoroStore';
import { useSpeechStore } from '../stores/speechStore';
import { useKokoro } from '../context/KokoroContext';

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
  // Voice loading is handled once globally by initVoices() in _app.js

  const stopNative = useCallback(() => {
    window.speechSynthesis.cancel();
    setNativeSpeaking(false);
  }, [setNativeSpeaking]);

  const speakNative = useCallback(
    (text, label = '') => {
      if (!text) return;

      window.speechSynthesis.cancel();

      const fullText = label ? `${text}. — ${label}` : text;
      const utt = new SpeechSynthesisUtterance(fullText);
      utt.lang = lang;
      utt.rate = (ttsSpeed ?? 1) * 0.88; // scale: 1× = natural 0.88 rate
      utt.pitch = pitch;

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

      if (voice) utt.voice = voice;

      utt.onend = () => setNativeSpeaking(false);
      utt.onerror = () => setNativeSpeaking(false);

      setNativeSpeaking(true);
      window.speechSynthesis.speak(utt);
    },
    [lang, pitch, ttsSpeed, voices, setNativeSpeaking]
  );

  const speak = useCallback(
    (text, label = '') => {
      if (ttsEngine === 'kokoro') return kokoro.speak(text, ttsSpeed ?? 1);
      speakNative(text, label);
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
