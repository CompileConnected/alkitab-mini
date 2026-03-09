import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Head from '../components/head';
import { VerseCard } from '../components/VerseCard';
import { SearchForm } from '../components/SearchForm';
import { useBible } from '../src/hooks/useBible';
import { useSpeech } from '../src/hooks/useSpeech';

const VerseAnimation = dynamic(
  () => import('../components/VerseAnimation').then(m => m.VerseAnimation),
  { ssr: false }
);

export default function Home() {
  const router = useRouter();
  const { verse, verses, reference, loading, error, search } = useBible();
  const [input,        setInput]        = useState('');
  const [copied,       setCopied]       = useState(false);
  const [isSearched,   setIsSearched]   = useState(false);
  const { speaking, speak, stop } = useSpeech();

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
      ? verses.map(({ verse: num, text }) => `${num}. ${text}`).join(' ')
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
        <header className="w-full flex flex-col items-center gap-2 animate-fade-up">
          <h1 className="text-black text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Alkitab Mini
          </h1>
          <p className="text-black/40 text-sm tracking-widest uppercase">Verse of the Day</p>
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
