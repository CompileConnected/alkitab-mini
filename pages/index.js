import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getVerseOfTheDay } from '../src/services/BibleService';
import dynamic from 'next/dynamic';
import Head from '../src/components/Head';
import { VerseCard } from '../src/components/VerseCard';
import { SearchForm } from '../src/components/SearchForm';
import { useBible } from '../src/hooks/useBible';
import { useSpeech } from '../src/hooks/useSpeech';
import { useSettingsStore } from '../src/stores/settingsStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const VerseAnimation = dynamic(
  () => import('../src/components/VerseAnimation').then(m => m.VerseAnimation),
  { ssr: false }
);

export default function Home({ initialVerse }) {
  const router = useRouter();
  const { verse, verses, reference, loading, error, search } = useBible(initialVerse);
  const [input,        setInput]        = useState('');
  const [copied,       setCopied]       = useState(false);
  const [isSearched,   setIsSearched]   = useState(false);
  const { speaking, speak, stop } = useSpeech();
  const openSettings = useSettingsStore(s => s.setSettingsOpen);

  const handleCopy = useCallback(() => {
    if (!verse) return;
    navigator.clipboard.writeText(`"${verse}" — ${reference}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [verse, reference]);

  const handleSpeak = useCallback(() => {
    if (speaking) { stop(); return; }
    const text = verses.length > 1
      ? verses.map(({ verse: num, text }) => `${num}. ${text}`)
      : verse;
    speak(text, reference);
  }, [speaking, speak, stop, verse, verses, reference]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsSearched(true);
    search(input.trim());
  }, [input, search]);

  return (
    <>
      <Head title="Alkitab Mini" />

      {/* ── Background ── */}
      <div className="fixed inset-0 bg-[#fafaf7] -z-10" />
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-amber-100/60 blur-[120px] animate-breathe" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-orange-50/80 blur-[100px] animate-breathe delay-300" />
      </div>

      {/* ── Layout ── */}
      <div className="min-h-screen flex flex-col items-center px-4 py-6 sm:py-10 gap-5 sm:gap-8 max-w-2xl mx-auto pb-28 sm:pb-10">

        {/* ── Header ── */}
        <header className="w-full flex items-center justify-between animate-fade-up">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-black text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Alkitab Mini
            </h1>
            <p className="text-black/40 text-sm tracking-widest uppercase">Verse of the Day</p>
          </div>
          <button
            onClick={() => openSettings(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 hover:bg-amber-50 hover:border-amber-200 transition-colors"
            aria-label="Open settings"
          >
            <FontAwesomeIcon icon={faGear} className="text-gray-500 w-4 h-4" />
          </button>
        </header>

        {/* ── Verse Animation ── */}
        {!isSearched && (
          <div className="w-full rounded-2xl shadow-lg overflow-hidden animate-fade-up delay-100">
            <VerseAnimation verseText={verse} reference={reference} />
          </div>
        )}

        {/* ── Verse card ── */}
        <VerseCard
          reference={reference}
          loading={loading}
          verse={verse}
          verses={verses}
          error={error}
          speaking={speaking}
          onSpeak={handleSpeak}
          onCopy={handleCopy}
          copied={copied}
          onPresent={() => router.push(`/present?passage=${encodeURIComponent(reference || 'votd')}`)}
        />

        {/* ── Search ── */}
        <SearchForm
          input={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleSearch}
          loading={loading}
        />

      </div>
    </>
  );
}

/**
 * ISR: pre-render the homepage with the Verse of the Day at build time.
 * Revalidate every hour so the page stays fresh without a serverless call
 * on every visitor request.
 */
export async function getStaticProps() {
  try {
    const initialVerse = await getVerseOfTheDay();
    return {
      props: { initialVerse },
      revalidate: 43200, // regenerate at most twice per day
    };
  } catch {
    // If the upstream API is unavailable at build time, render without data
    // and let the client-side fallback in useBible handle it.
    return {
      props: { initialVerse: null },
      revalidate: 300, // retry in 5 min if upstream was down
    };
  }
}
