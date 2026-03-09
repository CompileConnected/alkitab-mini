import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from '../components/head';
import { Teleprompter } from '../components/Teleprompter';
import { useBible } from '../src/hooks/useBible';
import { useSpeech } from '../src/hooks/useSpeech';

/**
 * /present?passage=John+3:16
 *
 * Opens directly in full-screen teleprompter mode.
 * Share or bookmark the URL to present any verse.
 */
export default function PresentPage() {
  const router   = useRouter();
  const { passage, vpp } = router.query;
  const { verse, verses, reference, loading, error, search } = useBible();
  const { speaking, speak, stop } = useSpeech();

  // Fetch the requested passage once the router is ready
  useEffect(() => {
    if (!router.isReady) return;
    if (passage) search(passage);
    // If no passage param, useBible already loads votd on mount
  }, [router.isReady, passage, search]);

  const handleSpeak = () => {
    if (speaking) { stop(); return; }
    const text = verses.length > 1
      ? verses.map(({ verse: num, text }) => `${num}. ${text}`).join(' ')
      : verse;
    speak(text, reference);
  };

  const handleClose = () => router.push('/');

  return (
    <>
      <Head title={reference ? `${reference} · Present` : 'Present · Alkitab Mini'} />

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
          verse={verse}
          verses={verses}
          reference={reference}
          speaking={speaking}
          onSpeak={handleSpeak}
          onClose={handleClose}
          versesPerPage={vpp ? Math.max(1, Math.min(20, parseInt(vpp, 10) || 5)) : 5}
        />
      )}
    </>
  );
}
