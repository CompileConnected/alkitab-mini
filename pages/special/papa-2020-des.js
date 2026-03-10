import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from '../../src/components/Head';
import { Teleprompter } from '../../src/components/Teleprompter';

const slides = [
  { id: 'cover', title: null },
  { id: 'papa', title: 'Papa' },
  { id: 'wish', title: 'Wish' },
  { id: 'maybe', title: 'Maybe' },
  { id: 'believe', title: 'Believe' },
  { id: 'closing', title: 'Tuhan Selalu Menyertai Kita' },
];

export default function WebRendering() {
  const router = useRouter();
  const [verse, setVerse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    fetch('/api/bible?passage=John%203:16')
      .then((r) => r.json())
      .then((d) => setVerse(d.text));
  }, []);

  const go = useCallback(
    (next) => {
      if (next < 0 || next >= slides.length) return;
      setDir(next > current ? 1 : -1);
      setAnimKey((k) => k + 1);
      setCurrent(next);
    },
    [current]
  );

  const slide = slides[current];

  const backdrop = (
    <>
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(251,191,36,0.08)',
          filter: 'blur(100px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'rgba(216,180,254,0.08)',
          filter: 'blur(100px)',
        }}
      />
    </>
  );

  return (
    <>
      <Head title="Buat Papa" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600&display=swap');
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(48px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(-48px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-enter-down { animation: slideInDown 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .slide-enter-up   { animation: slideInUp   0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>

      <Teleprompter
        bg="#faf9f7"
        theme="light"
        key={'default'}
        backdrop={backdrop}
        onClose={() => router.back()}
        onPrev={() => go(current - 1)}
        onNext={() => go(current + 1)}
        slideIndex={current}
        slideTotal={slides.length}
      >
        <div
          key={animKey}
          className={dir >= 0 ? 'slide-enter-down' : 'slide-enter-up'}
          style={{ width: '100%', maxWidth: 680 }}
        >
          {slide.id === 'cover' && (
            <SlideLayout>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: 13,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#a16207',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Desember 2020
                </p>
                <h1
                  style={{
                    margin: '0 0 28px',
                    fontSize: 'clamp(36px, 7vw, 64px)',
                    fontWeight: 700,
                    color: '#1c1917',
                    fontFamily: "'Lora', serif",
                    lineHeight: 1.15,
                  }}
                >
                  Untuk Papa
                </h1>
                <Divider />
                <p
                  style={{
                    margin: '28px auto 0',
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    fontStyle: 'italic',
                    color: '#57534e',
                    lineHeight: 1.9,
                    fontFamily: "'Lora', serif",
                    maxWidth: 480,
                  }}
                >
                  {verse || 'Loading verse...'}
                </p>
                <p
                  style={{
                    margin: '14px 0 0',
                    fontSize: 12,
                    color: '#d97706',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  John 3:16
                </p>
              </div>
            </SlideLayout>
          )}

          {slide.id === 'papa' && (
            <SlideLayout title="Papa">
              <Body>Natal ini mungkin berbeda bagi seluruh Indonesia.</Body>
              <Body>
                Tapi natal ini sama seperti sebelumnya, kita dak bisa rayain
                bareng sama cece atau sama mama
              </Body>
            </SlideLayout>
          )}

          {slide.id === 'wish' && (
            <SlideLayout title="Wish">
              {[
                'Selalu berdoa',
                'Selalu sehat.',
                'Selalu diberkati',
                'Selalu memberkati',
                'Selalu mengampuni',
                'Selalu kuat',
                'Diberikan hikmat dan pernyertaan Tuhan',
              ].map((w, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'baseline',
                    padding: '5px 0',
                  }}
                >
                  <span
                    style={{
                      color: '#d97706',
                      fontWeight: 700,
                      fontSize: 12,
                      fontFamily: 'Inter, sans-serif',
                      minWidth: 20,
                      textAlign: 'right',
                    }}
                  >
                    {i + 1}.
                  </span>
                  <span
                    style={{
                      fontSize: 'clamp(15px, 2vw, 17px)',
                      color: '#292524',
                      fontFamily: "'Lora', serif",
                      lineHeight: 1.7,
                    }}
                  >
                    {w}
                  </span>
                </div>
              ))}
            </SlideLayout>
          )}

          {slide.id === 'maybe' && (
            <SlideLayout title="Maybe">
              <Body>
                Mungkin han2 blom bisa jadi apa yang papa doakan waktu itu, tapi
                yang papa harus tau Tuhan selalu menjaga han2, cece, mama, dan
                keluarga yang lain
              </Body>
            </SlideLayout>
          )}

          {slide.id === 'believe' && (
            <SlideLayout title="Believe">
              <Body>
                Terkadang kita sendiri yang menghambat berkat dan janji Tuhan.
              </Body>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  margin: '4px 0 8px',
                  paddingLeft: 4,
                }}
              >
                {[
                  <span key="a">
                    - yang mungkin <b>lalai</b>
                  </span>,
                  <span key="b">
                    - yang mungkin <b>gak melakukan aksi</b>
                  </span>,
                  <span key="c">
                    - yang mungkin <b>keras kepala</b>
                  </span>,
                  <span key="d">
                    - yang mungkin <b>keras hati</b> nya
                  </span>,
                  <span key="e">
                    - yang mungkin <b>kecewa sama Tuhan</b>
                  </span>,
                  <span key="f">
                    - yang mungkin <b>gak peka terhadap suara Tuhan</b>
                  </span>,
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 'clamp(14px, 1.8vw, 16px)',
                      color: '#57534e',
                      lineHeight: 1.75,
                      fontFamily: "'Lora', serif",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: '16px 20px',
                  background: 'rgba(251,191,36,0.08)',
                  borderLeft: '3px solid #d97706',
                  borderRadius: '0 10px 10px 0',
                  color: '#1c1917',
                  lineHeight: 1.8,
                  fontFamily: "'Lora', serif",
                  fontSize: 'clamp(15px, 2vw, 17px)',
                }}
              >
                Tapi Papa percayalah{' '}
                <b>
                  janji Tuhan <u>selalu ditepati</u>.
                </b>
              </div>
            </SlideLayout>
          )}

          {slide.id === 'closing' && (
            <SlideLayout>
              <div style={{ textAlign: 'center' }}>
                <h2
                  style={{
                    margin: '0 0 24px',
                    fontSize: 'clamp(22px, 4vw, 36px)',
                    fontWeight: 700,
                    color: '#1c1917',
                    fontFamily: "'Lora', serif",
                    lineHeight: 1.3,
                  }}
                >
                  Tuhan Selalu Menyertai Kita
                </h2>
                <Divider />
                <p
                  style={{
                    margin: '28px 0 0',
                    fontSize: 'clamp(16px, 2.2vw, 20px)',
                    color: '#44403c',
                    lineHeight: 1.9,
                    fontFamily: "'Lora', serif",
                  }}
                >
                  Selamat Natal dan Tahun Baru ❤️ han2 dan keluarga
                </p>
              </div>
            </SlideLayout>
          )}
        </div>
      </Teleprompter>
    </>
  );
}

function SlideLayout({ title, children }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 24,
        padding: 'clamp(28px, 5vw, 52px) clamp(24px, 5vw, 52px)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
      }}
    >
      {title && (
        <>
          <h2
            style={{
              margin: '0 0 6px',
              fontSize: 'clamp(11px, 1.5vw, 13px)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#a16207',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {title}
          </h2>
          <Divider left />
          <div style={{ marginBottom: 24 }} />
        </>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function Body({ children }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 'clamp(15px, 2vw, 18px)',
        color: '#292524',
        lineHeight: 1.85,
        fontFamily: "'Lora', serif",
      }}
    >
      {children}
    </p>
  );
}

function Divider({ left }) {
  return (
    <div
      style={{
        width: 40,
        height: 2,
        background: 'linear-gradient(90deg, #d97706, #fbbf24)',
        borderRadius: 1,
        margin: left ? '12px 0' : '0 auto',
      }}
    />
  );
}
