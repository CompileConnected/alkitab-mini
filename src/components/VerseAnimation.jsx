import React, { memo, useEffect, useMemo, useRef } from 'react';
import { animate, stagger, createTimeline } from 'animejs';

// Static ambient orbs — hoisted so they're never recreated on re-render
const AmbientOrbs = (
  <>
    <div
      style={{
        position: 'absolute',
        top: '-20%',
        left: '-5%',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'rgba(251,191,36,0.18)',
        filter: 'blur(90px)',
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-5%',
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: 'rgba(245,158,11,0.12)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }}
    />
  </>
);

export const VerseAnimation = memo(function VerseAnimation({
  verseText = '',
  reference = '',
}) {
  const refTagRef = useRef(null);
  const dividerRef = useRef(null);
  const wordsContainerRef = useRef(null);

  const words = useMemo(
    () => (verseText ? verseText.split(' ') : []),
    [verseText]
  );

  useEffect(() => {
    if (!refTagRef.current) return;

    const wordEls = wordsContainerRef.current
      ? Array.from(wordsContainerRef.current.querySelectorAll('.verse-word'))
      : [];

    // Snap to hidden
    animate(refTagRef.current, { opacity: 0, translateY: 28, duration: 0 });
    animate(dividerRef.current, { width: '0px', duration: 0 });
    if (wordEls.length)
      animate(wordEls, { opacity: 0, translateY: 18, duration: 0 });

    // Entrance timeline
    const tl = createTimeline({ defaults: { ease: 'outExpo' } });

    tl.add(refTagRef.current, {
      opacity: [0, 1],
      translateY: [28, 0],
      duration: 700,
    });
    tl.add(
      dividerRef.current,
      { width: ['0px', '60px'], duration: 600, ease: 'outQuart' },
      '-=400'
    );

    if (wordEls.length) {
      tl.add(
        wordEls,
        {
          opacity: [0, 1],
          translateY: [18, 0],
          duration: 500,
          delay: stagger(55),
          ease: 'spring(1, 80, 12, 0)',
        },
        '-=300'
      );
    }
  }, [verseText, reference]);

  return (
    <div
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, #fffbf0 0%, #fafaf7 55%, #f3f3ee 100%)',
        borderRadius: '1rem',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        position: 'relative',
        minHeight: 240,
      }}
    >
      {/* Ambient orbs — static, hoisted outside component */}
      {AmbientOrbs}

      {/* Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 24,
          padding: '36px 40px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Reference tag */}
        <div
          ref={refTagRef}
          style={{
            opacity: 0,
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            borderRadius: 999,
            padding: '6px 20px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {reference}
        </div>

        {/* Gold divider */}
        <div
          ref={dividerRef}
          style={{
            width: 0,
            height: 2,
            background:
              'linear-gradient(90deg, transparent, #fbbf24, transparent)',
            borderRadius: 1,
          }}
        />

        {/* Verse words */}
        <div
          ref={wordsContainerRef}
          style={{ textAlign: 'center', lineHeight: 1.75 }}
        >
          {words.map((word, i) => (
            <span
              key={`${verseText}-${i}`}
              className="verse-word"
              style={{
                display: 'inline-block',
                opacity: 0,
                marginRight: '0.28em',
                color: '#1a1a1a',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(16px, 2.5vw, 22px)',
                fontStyle: 'italic',
                lineHeight: 1.75,
              }}
            >
              {word}
            </span>
          ))}
          {words.length === 0 && (
            <span
              style={{
                color: 'rgba(0,0,0,0.25)',
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontSize: 18,
              }}
            >
              Loading verse...
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
