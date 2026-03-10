import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from '../src/components/Head';
import { Teleprompter } from '../src/components/Teleprompter';
import { useBible } from '../src/hooks/useBible';
import { useSpeech } from '../src/hooks/useSpeech';
import { useTeleprompterStore } from '../src/stores/teleprompterStore';

/**
 * /present?passage=John+3:16&vpp=5
 *
 * Opens directly in full-screen teleprompter mode.
 * Share or bookmark the URL to present any verse.
 * ?vpp=N overrides the stored verses-per-page preference once on load.
 */
export default function PresentPage() {
  const router = useRouter();
  const { passage, vpp } = router.query;
  const { verse, verses, reference, loading, error, search } = useBible();
  const { speaking, speak, stop } = useSpeech();
  const setVpp = useTeleprompterStore((s) => s.setVpp);

  // Fetch the requested passage once the router is ready
  useEffect(() => {
    if (!router.isReady) return;
    if (passage) search(passage);
    // Honour ?vpp= URL override
    if (vpp) {
      const parsed = Math.max(1, Math.min(20, parseInt(vpp, 10) || 5));
      setVpp(parsed);
    }
    // If no passage param, useBible already loads votd on mount
  }, [router.isReady, passage, vpp, search, setVpp]);

  const handleSpeak = () => {
    if (speaking) {
      stop();
      return;
    }
    const text =
      verses.length > 1
        ? verses.map(({ verse: num, text }) => `${num}. ${text}`).join(' ')
        : verse;
    speak(text, reference);
  };

  const handleClose = () => {
    stop();
    router.push('/');
  };

  return (
    <>
      <Head
        title={reference ? `${reference} · Present` : 'Present · Alkitab Mini'}
      />

      {loading && (
        <div className="fixed inset-0 bg-[#0d0d0d] flex items-center justify-center">
          <span className="text-white/40 text-sm animate-pulse">Loading…</span>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center gap-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={handleClose}
            className="text-xs text-white/40 hover:text-white/70 underline transition"
          >
            ← Back home
          </button>
        </div>
      )}

      {!loading && !error && verse && (
        <Teleprompter
          key={reference}
          verse={verse}
          verses={verses}
          reference={reference}
          speaking={speaking}
          onSpeak={handleSpeak}
          onClose={handleClose}
        />
      )}
    </>
  );
}
