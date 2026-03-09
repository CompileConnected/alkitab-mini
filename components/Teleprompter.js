import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAITranslation, LANGUAGES } from '../src/hooks/useAITranslation';

const SIZE_STEPS = [18, 22, 28, 36, 44, 54, 64];
const DEFAULT_IDX = 2;

/**
 * Teleprompter
 *
 * Two modes:
 *  1. Verse mode  — pass `verse` / `verses` / `reference`
 *                   Multiple verses are paginated: `versesPerPage` (default 5)
 *                   ↑ / ↓ / PageUp / PageDown navigate between pages
 *  2. Slide mode  — pass `children` + `onPrev` / `onNext` / `slideIndex` / `slideTotal`
 *
 * Shared props:
 *  bg           — CSS background value
 *  theme        — 'dark' (default) | 'light'
 *  backdrop     — JSX rendered behind content (blobs / gradients)
 *  versesPerPage — how many verses per page in verse mode (default 5)
 *  onClose      — called on ✕ Exit or Escape
 */
export function Teleprompter({
  // verse mode
  verse, verses = [], reference, speaking, onSpeak,
  versesPerPage = 5,
  // slide navigation (slide mode)
  children, onPrev, onNext, slideIndex, slideTotal,
  // shell
  onClose, bg, theme = 'dark', backdrop,
}) {
  const [sizeIdx, setSizeIdx] = useState(DEFAULT_IDX);
  const [page, setPage]       = useState(0);
  const [vpp, setVpp]         = useState(versesPerPage);

  const vppDown = useCallback(() => setVpp(v => Math.max(1, v - 1)), []);
  const vppUp   = useCallback(() => setVpp(v => Math.min(20, v + 1)), []);
  const { translation, loading: aiLoading, error: aiError, targetLang, setTargetLang, translate, clear } = useAITranslation();
  const [showTranslate, setShowTranslate] = useState(false);

  const isSlideMode = Boolean(children);
  const hasNav      = Boolean(onPrev || onNext);
  const isDark      = theme !== 'light';

  // ── Verse pagination ──────────────────────────────────────────────────────
  const pages = useMemo(() => {
    if (verses.length <= 1) return [];
    const chunks = [];
    for (let i = 0; i < verses.length; i += vpp)
      chunks.push(verses.slice(i, i + vpp));
    return chunks;
  }, [verses, vpp]);

  const totalPages   = pages.length || 1;
  const currentPage  = pages[page] ?? [];
  const isMultiPage  = pages.length > 1;

  // Reset page when verses change (new search result)
  useEffect(() => { setPage(0); }, [verses]);

  const pageText = useMemo(() => {
    if (verses.length > 1) return currentPage.map(({ verse: n, text }) => `${n} ${text}`).join('\n');
    return verse ?? '';
  }, [verses, currentPage, verse]);

  const handleLangChange = useCallback((e) => {
    const lang = e.target.value;
    setTargetLang(lang);
    if (showTranslate) translate(pageText, lang);
  }, [setTargetLang, showTranslate, translate, pageText]);

  const toggleTranslate = useCallback(() => {
    if (showTranslate) { setShowTranslate(false); clear(); }
    else { setShowTranslate(true); translate(pageText, targetLang); }
  }, [showTranslate, clear, translate, pageText, targetLang]);

  const bigger  = useCallback(() => setSizeIdx(i => Math.min(i + 1, SIZE_STEPS.length - 1)), []);
  const smaller = useCallback(() => setSizeIdx(i => Math.max(i - 1, 0)), []);

  const goNextPage = useCallback(() => setPage(p => Math.min(p + 1, totalPages - 1)), [totalPages]);
  const goPrevPage = useCallback(() => setPage(p => Math.max(p - 1, 0)), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { onClose?.(); return; }
      const isDown = e.key === 'ArrowDown' || e.key === 'PageDown';
      const isUp   = e.key === 'ArrowUp'   || e.key === 'PageUp';
      if (!isDown && !isUp) return;
      e.preventDefault();
      if (isSlideMode) {
        if (isDown && onNext) onNext();
        if (isUp   && onPrev) onPrev();
      } else if (isMultiPage) {
        if (isDown) goNextPage();
        if (isUp)   goPrevPage();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrev, isSlideMode, isMultiPage, goNextPage, goPrevPage]);

  const fontSize = SIZE_STEPS[sizeIdx];

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bgColor     = bg ?? (isDark ? '#0d0d0d' : '#fafaf7');
  const borderColor = isDark ? 'border-white/10' : 'border-black/8';
  const btnCls      = isDark
    ? 'border-white/15 text-white/60 hover:text-white'
    : 'border-black/10 text-black/50 hover:text-black/80';
  const refCls      = isDark ? 'text-amber-400'  : 'text-amber-700';
  const selectBg    = isDark ? 'bg-[#0d0d0d]'    : 'bg-transparent';
  const dotActive   = isDark ? 'bg-amber-400'    : 'bg-amber-600';
  const dotInactive = isDark ? 'bg-white/20'     : 'bg-black/15';
  const counterCls  = isDark ? 'text-white/20'   : 'text-black/25';
  const textCls     = isDark ? 'text-white'      : 'text-gray-900';

  // Which dots/counter to show in the bottom bar
  const showPageNav  = !isSlideMode && isMultiPage;
  const showSlideNav = isSlideMode && hasNav && slideTotal > 1;
  const navTotal     = showPageNav  ? totalPages  : slideTotal;
  const navIndex     = showPageNav  ? page        : (slideIndex ?? 0);
  const navPrev      = showPageNav  ? goPrevPage  : onPrev;
  const navNext      = showPageNav  ? goNextPage  : onNext;
  const navPrevOff   = showPageNav  ? page === 0  : slideIndex === 0;
  const navNextOff   = showPageNav  ? page === totalPages - 1 : slideIndex === slideTotal - 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: bgColor }}>

      {/* ── Backdrop ── */}
      {backdrop && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {backdrop}
        </div>
      )}

      {/* ── Top bar ── */}
      <div className={`relative z-10 flex flex-wrap items-center gap-2 px-4 py-3 border-b ${borderColor}`}>
        {reference && (
          <span className={`text-xs font-bold tracking-widest uppercase mr-1 ${refCls}`}>
            📖 {reference}
          </span>
        )}

        {!isSlideMode && (
          <>
            <button onClick={smaller} disabled={sizeIdx === 0} title="Smaller text"
              className={`w-8 h-8 rounded-lg border disabled:opacity-25 transition text-sm font-bold ${btnCls}`}>A−</button>
            <button onClick={bigger} disabled={sizeIdx === SIZE_STEPS.length - 1} title="Larger text"
              className={`w-8 h-8 rounded-lg border disabled:opacity-25 transition text-base font-bold ${btnCls}`}>A+</button>

            {/* Verses per page — only relevant when there are multiple verses */}
            {verses.length > 1 && (
              <div className="flex items-center gap-1" title="Verses per page">
                <button onClick={vppDown} disabled={vpp <= 1}
                  className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}>−</button>
                <span className={`text-xs tabular-nums select-none ${isDark ? 'text-white/40' : 'text-black/35'}`}>
                  {vpp}v
                </span>
                <button onClick={vppUp} disabled={vpp >= 20}
                  className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}>+</button>
              </div>
            )}
          </>
        )}

        {!isSlideMode && onSpeak && (
          <button onClick={onSpeak} title={speaking ? 'Stop' : 'Read aloud'}
            className={`px-3 py-1.5 rounded-lg border active:scale-95 transition text-xs ${btnCls}`}>
            {speaking ? '⏹ Stop' : '🔊 Read'}
          </button>
        )}

        {!isSlideMode && (
          <>
            <select value={targetLang} onChange={handleLangChange}
              className={`text-xs rounded-lg border px-2 py-1.5 transition focus:outline-none ${btnCls} ${selectBg}`}>
              {LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code} className="bg-[#1a1a1a] text-white">{label}</option>
              ))}
            </select>
            <button onClick={toggleTranslate} title="Translate with on-device AI"
              className={`px-3 py-1.5 rounded-lg border active:scale-95 transition text-xs whitespace-nowrap ${
                showTranslate ? 'border-amber-500 text-amber-400 bg-amber-500/10' : btnCls
              }`}>
              {aiLoading ? '⏳…' : '🌐 Translate'}
            </button>
          </>
        )}

        <button onClick={onClose} title="Exit (Esc)"
          className={`px-3 py-1.5 rounded-lg border active:scale-95 transition text-xs ${btnCls}`}>
          ✕ Exit
        </button>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-center px-5 sm:px-10 py-8 sm:py-12 gap-8">
        {isSlideMode ? children : (
          <>
            <div className="w-full max-w-5xl">
              {verses.length > 1 ? (
                <ol className="flex flex-col gap-6 list-none w-full">
                  {currentPage.map(({ verse: num, text }) => (
                    <li key={num} className="flex gap-4 items-baseline">
                      <span className="text-amber-500 font-bold shrink-0"
                        style={{ fontSize: Math.max(14, fontSize - 12) }}>{num}</span>
                      <span className={`${textCls} leading-snug`}
                        style={{ fontSize, fontFamily: 'Inter, sans-serif', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.6 }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={`${textCls} text-center w-full leading-snug`}
                  style={{ fontSize, fontFamily: 'Inter, sans-serif', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.6 }}>
                  {verse}
                </p>
              )}
            </div>

            {showTranslate && (
              <div className="w-full max-w-5xl rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 sm:px-8 py-5 flex flex-col gap-3">
                <p className="text-[11px] text-amber-400/60 leading-tight">
                  ⚠️ Translation generated by <strong className="text-amber-400/80">Google Gemini Nano</strong> running on-device.
                  May contain errors — the website bears <strong className="text-amber-400/80">no responsibility</strong> for mistranslations.
                  Always verify with a trusted Bible translation.
                </p>
                {aiLoading && <p className="text-amber-300 animate-pulse text-center py-4" style={{ fontSize: Math.max(16, fontSize - 8) }}>Translating…</p>}
                {aiError   && <p className="text-red-400 text-sm">{aiError}</p>}
                {translation && !aiLoading && (
                  <p className="text-amber-100 leading-snug"
                    style={{ fontSize: Math.max(16, fontSize - 8), fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: 1.6 }}>
                    {translation}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className={`relative z-10 px-6 py-3 border-t ${borderColor} flex items-center justify-center gap-3`}>
        {(showPageNav || showSlideNav) ? (
          <>
            <button onClick={navPrev} disabled={navPrevOff}
              className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}>↑</button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(navTotal, 20) }).map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-200 ${
                  i === navIndex ? `w-2 h-2 ${dotActive}` : `w-1.5 h-1.5 ${dotInactive}`
                }`} />
              ))}
            </div>
            <button onClick={navNext} disabled={navNextOff}
              className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}>↓</button>
            <span className={`text-[10px] absolute right-5 ${counterCls}`}>
              {navIndex + 1} / {navTotal}
              {showPageNav && <span className="ml-1 opacity-60">· ↑↓ to navigate</span>}
            </span>
          </>
        ) : (
          <>
            {reference && (
              <span className={`tracking-widest uppercase ${refCls} opacity-70`}
                style={{ fontSize: Math.max(12, fontSize - 18), fontFamily: 'Inter, sans-serif' }}>
                {reference}
              </span>
            )}
            {showTranslate && (
              <span className={`text-[10px] ${counterCls}`}>· Gemini Nano · on-device AI</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
