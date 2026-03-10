/**
 * useAITranslation
 *
 * Thin adapter over useTranslationStore.
 * All state now lives in the global store so VerseCard and Teleprompter
 * share a single translation result without prop-drilling.
 *
 * API is intentionally identical to the previous hook so call-sites need no changes.
 *
 * LANGUAGES is re-exported from the store for backward compatibility.
 */
import {
  useTranslationStore,
  LANGUAGES as _LANGUAGES,
} from '../stores/translationStore';

export const LANGUAGES = _LANGUAGES;

export function useAITranslation() {
  const translation = useTranslationStore((s) => s.translation);
  const loading = useTranslationStore((s) => s.loading);
  const error = useTranslationStore((s) => s.error);
  const targetLang = useTranslationStore((s) => s.targetLang);
  const setTargetLang = useTranslationStore((s) => s.setTargetLang);
  const translate = useTranslationStore((s) => s.translate);
  const clear = useTranslationStore((s) => s.clear);

  return {
    translation,
    loading,
    error,
    targetLang,
    setTargetLang,
    translate,
    clear,
  };
}
