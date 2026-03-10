import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTeleprompterStore, SIZE_STEPS } from '../stores/teleprompterStore';
import { TeleprompterTranslationSection } from './TranslationSection';
import { SpeakButton } from './SpeakButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faXmark } from '@fortawesome/free-solid-svg-icons';

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
 *  onClose      — called on ✕ Exit or Escape
 */
export function Teleprompter({
  // verse mode
  verse,
  verses = [],
  reference,
  speaking,
  onSpeak,
  // slide navigation (slide mode)
  children,
  onPrev,
  onNext,
  slideIndex,
  slideTotal,
  // shell
  onClose,
  bg,
  theme = 'dark',
  backdrop,
}) {
  const sizeIdx = useTeleprompterStore((s) => s.sizeIdx);
  const bigger = useTeleprompterStore((s) => s.bigger);
  const smaller = useTeleprompterStore((s) => s.smaller);
  const vpp = useTeleprompterStore((s) => s.vpp);
  const vppUp = useTeleprompterStore((s) => s.vppUp);
  const vppDown = useTeleprompterStore((s) => s.vppDown);
  const [page, setPage] = useState(0);

  const isSlideMode = Boolean(children);
  const hasNav = Boolean(onPrev || onNext);
  const isDark = theme !== 'light';

  // ── Verse pagination ──────────────────────────────────────────────────────
  const pages = useMemo(() => {
    if (verses.length <= 1) return [];
    const chunks = [];
    for (let i = 0; i < verses.length; i += vpp)
      chunks.push(verses.slice(i, i + vpp));
    return chunks;
  }, [verses, vpp]);

  const totalPages = pages.length || 1;
  const currentPage = pages[page] ?? [];
  const isMultiPage = pages.length > 1;

  const pageText = useMemo(() => {
    if (verses.length > 1)
      return currentPage.map(({ verse: n, text }) => `${n} ${text}`).join('\n');
    return verse ?? '';
  }, [verses, currentPage, verse]);

  const goNextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages - 1)),
    [totalPages]
  );
  const goPrevPage = useCallback(() => setPage((p) => Math.max(p - 1, 0)), []);

  // ── Swipe navigation ──────────────────────────────────────────────────────
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      const startX = touchStartX.current;
      touchStartX.current = null;
      touchStartY.current = null;

      // Ignore swipes that begin within 30px of either edge — those are reserved
      // for the browser's back/forward navigation gesture.
      if (startX < 30 || startX > window.innerWidth - 30) return;

      // Require horizontal dominance and minimum distance to avoid scroll conflicts
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0) {
        // swipe left → next
        if (isSlideMode) {
          onNext?.();
        } else {
          goNextPage();
        }
      } else {
        // swipe right → prev
        if (isSlideMode) {
          onPrev?.();
        } else {
          goPrevPage();
        }
      }
    },
    [isSlideMode, onNext, onPrev, goNextPage, goPrevPage]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      const isDown = e.key === 'ArrowDown' || e.key === 'PageDown';
      const isUp = e.key === 'ArrowUp' || e.key === 'PageUp';
      if (!isDown && !isUp) return;
      e.preventDefault();
      if (isSlideMode) {
        if (isDown && onNext) onNext();
        if (isUp && onPrev) onPrev();
      } else if (isMultiPage) {
        if (isDown) goNextPage();
        if (isUp) goPrevPage();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    onClose,
    onNext,
    onPrev,
    isSlideMode,
    isMultiPage,
    goNextPage,
    goPrevPage,
  ]);

  const fontSize = SIZE_STEPS[sizeIdx];

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const bgColor = bg ?? (isDark ? '#0d0d0d' : '#fafaf7');
  const borderColor = isDark ? 'border-white/10' : 'border-black/8';
  const btnCls = isDark
    ? 'border-white/15 text-white/60 hover:text-white'
    : 'border-black/10 text-black/50 hover:text-black/80';
  const refCls = isDark ? 'text-amber-400' : 'text-amber-700';
  const selectBg = isDark ? 'bg-[#0d0d0d]' : 'bg-transparent';
  const dotActive = isDark ? 'bg-amber-400' : 'bg-amber-600';
  const dotInactive = isDark ? 'bg-white/20' : 'bg-black/15';
  const counterCls = isDark ? 'text-white/20' : 'text-black/25';
  const textCls = isDark ? 'text-white' : 'text-gray-900';

  // Which dots/counter to show in the bottom bar
  const showPageNav = !isSlideMode && isMultiPage;
  const showSlideNav = isSlideMode && hasNav && slideTotal > 1;
  const navTotal = showPageNav ? totalPages : slideTotal;
  const navIndex = showPageNav ? page : (slideIndex ?? 0);
  const navPrev = showPageNav ? goPrevPage : onPrev;
  const navNext = showPageNav ? goNextPage : onNext;
  const navPrevOff = showPageNav ? page === 0 : slideIndex === 0;
  const navNextOff = showPageNav
    ? page === totalPages - 1
    : slideIndex === slideTotal - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: bgColor, overscrollBehavior: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Backdrop ── */}
      {backdrop && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {backdrop}
        </div>
      )}

      {/* ── Top bar ── */}
      <div
        className={`relative z-10 flex flex-wrap items-center gap-2 px-4 py-3 border-b ${borderColor}`}
      >
        {reference && (
          <span
            className={`text-xs font-bold tracking-widest uppercase mr-1 ${refCls}`}
          >
            <FontAwesomeIcon icon={faBookOpen} className="mr-1.5" />
            {reference}
          </span>
        )}

        {!isSlideMode && (
          <>
            <button
              onClick={smaller}
              disabled={sizeIdx === 0}
              title="Smaller text"
              className={`w-8 h-8 rounded-lg border disabled:opacity-25 transition text-sm font-bold ${btnCls}`}
            >
              A−
            </button>
            <button
              onClick={bigger}
              disabled={sizeIdx === SIZE_STEPS.length - 1}
              title="Larger text"
              className={`w-8 h-8 rounded-lg border disabled:opacity-25 transition text-base font-bold ${btnCls}`}
            >
              A+
            </button>

            {/* Verses per page — only relevant when there are multiple verses */}
            {verses.length > 1 && (
              <div className="flex items-center gap-1" title="Verses per page">
                <button
                  onClick={vppDown}
                  disabled={vpp <= 1}
                  className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}
                >
                  −
                </button>
                <span
                  className={`text-xs tabular-nums select-none ${isDark ? 'text-white/40' : 'text-black/35'}`}
                >
                  {vpp}v
                </span>
                <button
                  onClick={vppUp}
                  disabled={vpp >= 20}
                  className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}
                >
                  +
                </button>
              </div>
            )}
          </>
        )}

        {!isSlideMode && onSpeak && (
          <SpeakButton speaking={speaking} onClick={onSpeak} theme="dark" />
        )}

        <button
          onClick={onClose}
          title="Exit (Esc)"
          className={`px-3 py-1.5 rounded-lg border active:scale-95 transition text-xs ${btnCls}`}
        >
          <FontAwesomeIcon icon={faXmark} className="mr-1" />
          Exit
        </button>
      </div>

      {/* ── Content ── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-center px-5 sm:px-10 py-8 sm:py-12 gap-8"
        style={{ overscrollBehavior: 'contain' }}
      >
        {isSlideMode ? (
          children
        ) : (
          <>
            <div className="w-full max-w-5xl">
              {verses.length > 1 ? (
                <ol className="flex flex-col gap-6 list-none w-full">
                  {currentPage.map(({ verse: num, text }) => (
                    <li key={num} className="flex gap-4 items-baseline">
                      <span
                        className="text-amber-500 font-bold shrink-0"
                        style={{ fontSize: Math.max(14, fontSize - 12) }}
                      >
                        {num}
                      </span>
                      <span
                        className={`${textCls} leading-snug`}
                        style={{
                          fontSize,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          letterSpacing: '0.01em',
                          lineHeight: 1.6,
                        }}
                      >
                        {text}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p
                  className={`${textCls} text-center w-full leading-snug`}
                  style={{
                    fontSize,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    letterSpacing: '0.01em',
                    lineHeight: 1.6,
                  }}
                >
                  {verse}
                </p>
              )}
            </div>

            {!isSlideMode && (
              <TeleprompterTranslationSection
                pageText={pageText}
                fontSize={fontSize}
                btnCls={btnCls}
                selectBg={selectBg}
              />
            )}
          </>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div
        className={`relative z-10 px-6 py-3 border-t ${borderColor} flex items-center justify-center gap-3`}
      >
        {showPageNav || showSlideNav ? (
          <>
            <button
              onClick={navPrev}
              disabled={navPrevOff}
              className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}
            >
              ↑
            </button>

            {/* Dots: only show on sm+ or when count is small; on mobile just show the counter */}
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: Math.min(navTotal, 20) }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === navIndex
                      ? `w-2 h-2 ${dotActive}`
                      : `w-1.5 h-1.5 ${dotInactive}`
                  }`}
                />
              ))}
            </div>

            <span className={`text-xs tabular-nums ${counterCls}`}>
              {navIndex + 1} / {navTotal}
            </span>

            <button
              onClick={navNext}
              disabled={navNextOff}
              className={`w-7 h-7 rounded-lg border disabled:opacity-25 transition text-xs ${btnCls}`}
            >
              ↓
            </button>
            <span
              className={`text-[10px] absolute right-5 hidden sm:inline ${counterCls}`}
            >
              {showPageNav && (
                <span className="opacity-60">↑↓ / swipe to navigate</span>
              )}
            </span>
          </>
        ) : (
          <>
            {reference && (
              <span
                className={`tracking-widest uppercase ${refCls} opacity-70`}
                style={{
                  fontSize: Math.max(12, fontSize - 18),
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {reference}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
