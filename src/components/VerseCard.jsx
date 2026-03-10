import React from 'react';
import { TranslationSection } from './TranslationSection';
import { SpeakButton } from './SpeakButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookOpen,
  faExpand,
  faCopy,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

export function VerseCard({
  reference,
  loading,
  verse,
  verses,
  error,
  speaking,
  onSpeak,
  onCopy,
  copied,
  onPresent,
}) {
  const verseText =
    verses.length > 1
      ? verses.map(({ verse: n, text }) => `${n} ${text}`).join('\n')
      : verse;

  const hasVerse = !loading && (verse || verses.length > 0) && !error;

  return (
    <article className="w-full glass rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-3 animate-fade-up delay-200">
      {/* ── Header row: wraps on mobile ── */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-2">
        <span className="text-xs font-bold tracking-widest uppercase text-amber-700 mr-auto">
          <FontAwesomeIcon icon={faBookOpen} className="mr-1.5" />
          {reference || '—'}
        </span>
        {loading && (
          <span className="text-xs text-black/30 animate-pulse">Loading…</span>
        )}
        {!loading && verse && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPresent}
              title="Teleprompter view"
              className="text-xs px-3 py-1.5 rounded-lg border border-black/10 text-black/50 hover:text-black/80 hover:border-black/25 active:scale-95 transition-all"
            >
              <FontAwesomeIcon icon={faExpand} className="mr-1" />
              Present
            </button>
            <SpeakButton speaking={speaking} onClick={onSpeak} />
            <button
              onClick={onCopy}
              title="Copy verse"
              className="text-xs px-3 py-1.5 rounded-lg border border-black/10 text-black/50 hover:text-black/80 hover:border-black/25 active:scale-95 transition-all"
            >
              <FontAwesomeIcon
                icon={copied ? faCheck : faCopy}
                className="mr-1"
              />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-red-500 text-sm text-center">{error}</p>
      ) : loading ? (
        <p className="animate-pulse text-black/30 text-sm text-center py-4">
          Loading verse…
        </p>
      ) : verses.length > 1 ? (
        <ol className="flex flex-col gap-2 text-gray-800 text-sm leading-relaxed list-none">
          {verses.map(({ verse: num, text }) => (
            <li key={num} className="flex gap-2">
              <span className="text-amber-600 font-bold text-xs mt-0.5 min-w-[1.5rem]">
                {num}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p
          className="text-gray-800 leading-relaxed text-base text-center min-h-[56px]"
          style={{
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '0.01em',
            lineHeight: 1.75,
          }}
        >
          {verse}
        </p>
      )}

      {/* ── AI Translation ── */}
      {hasVerse && <TranslationSection verseText={verseText} />}
    </article>
  );
}
