import React from 'react';
import { useWebFeaturesStore } from '../stores/webFeaturesStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCircleCheck,
  faCircleXmark,
  faCircleQuestion,
  faSpinner,
  faTriangleExclamation,
  faArrowUpRightFromSquare,
  faHandHoldingHeart,
} from '@fortawesome/free-solid-svg-icons';
import Section from './Section';

// ── Dependency manifest ───────────────────────────────────────────────────────
const DEPS = [
  {
    name: 'Next.js',
    version: 'latest',
    license: 'MIT',
    url: 'https://nextjs.org',
  },
  {
    name: 'React',
    version: 'latest',
    license: 'MIT',
    url: 'https://react.dev',
  },
  {
    name: 'Zustand',
    version: '^5.0.11',
    license: 'MIT',
    url: 'https://github.com/pmndrs/zustand',
    donateUrl: 'https://github.com/sponsors/dai-shi',
  },
  {
    name: 'kokoro-js',
    version: '^1.2.1',
    license: 'Apache-2.0',
    url: 'https://github.com/hexgrad/kokoro',
  },
  {
    name: '@huggingface/transformers',
    version: '^3.8.1',
    license: 'Apache-2.0',
    url: 'https://huggingface.co/docs/transformers.js',
  },
  {
    name: 'Anime.js',
    version: '^4.3.6',
    license: 'MIT',
    url: 'https://animejs.com',
    donateUrl: 'https://github.com/sponsors/juliangarnier',
  },
  {
    name: 'core-js',
    version: '^3.48.0',
    license: 'MIT',
    url: 'https://core-js.io/',
    donateUrl: 'https://opencollective.com/core-js',
  },
  {
    name: 'regenerator-runtime',
    version: '^0.14.1',
    license: 'MIT',
    url: 'https://github.com/facebook/regenerator/tree/main#readme',
  },
  {
    name: 'Tailwind CSS',
    version: '^4.2.1',
    license: 'MIT',
    url: 'https://tailwindcss.com',
    donateUrl: 'https://tailwindcss.com/sponsor',
  },
  {
    name: 'Font Awesome (core)',
    version: '^7.2.0',
    license: 'MIT',
    url: 'https://fontawesome.com',
  },
  {
    name: 'Font Awesome (solid icons)',
    version: '^7.2.0',
    license: 'CC BY 4.0',
    url: 'https://fontawesome.com',
  },
  {
    name: '@fortawesome/react-fontawesome',
    version: '^3.2.0',
    license: 'MIT',
    url: 'https://fontawesome.com/docs/web/use-with/react',
  },
  {
    name: 'PostCSS',
    version: '^8.5.8',
    license: 'MIT',
    url: 'https://postcss.org',
    donateUrl: 'https://opencollective.com/postcss',
  },
  {
    name: 'Autoprefixer',
    version: '^10.4.27',
    license: 'MIT',
    url: 'https://github.com/postcss/autoprefixer',
    donateUrl: 'https://opencollective.com/postcss',
  },
  {
    name: 'Browserslist',
    version: 'latest',
    license: 'MIT',
    url: 'https://browsersl.ist/',
    donateUrl: 'https://opencollective.com/browserslist',
  },
  {
    name: 'path-browserify',
    version: '^1.0.1',
    license: 'MIT',
    url: 'https://github.com/browserify/path-browserify',
  },
];

const SUPPORT_URL =
  process.env.NEXT_PUBLIC_SUPPORT_URL || 'https://forms.gle/kko8Y8seE3akUupb8';

// ── Feature definitions ───────────────────────────────────────────────────────
function useFeatures() {
  const webgpu = useWebFeaturesStore((s) => s.webgpu);
  const wasm = useWebFeaturesStore((s) => s.wasm);
  const speechSynthesis = useWebFeaturesStore((s) => s.speechSynthesis);
  const geminiNano = useWebFeaturesStore((s) => s.geminiNano);
  const translationApi = useWebFeaturesStore((s) => s.translationApi);

  return [
    {
      name: 'WebGPU',
      status: webgpu ? 'available' : 'unavailable',
      use: 'Kokoro AI — fast GPU-accelerated TTS (~320 MB model)',
      reason: !webgpu
        ? 'Browser does not support WebGPU. Requires Chrome 113+, Edge 113+, or Firefox Nightly with the flag enabled.'
        : null,
    },
    {
      name: 'WebAssembly',
      status: wasm ? 'available' : 'unavailable',
      use: 'Kokoro AI — WASM TTS backend (~92 MB model)',
      reason: !wasm
        ? 'Browser does not support WebAssembly. Nearly all modern browsers support it — try updating your browser.'
        : null,
    },
    {
      name: 'Web Speech API',
      status: speechSynthesis ? 'available' : 'unavailable',
      use: 'Native browser TTS — instant, no download',
      reason: !speechSynthesis
        ? 'Browser does not expose speechSynthesis. Supported in Chrome, Edge, Safari and Firefox.'
        : null,
    },
    {
      name: 'Gemini Nano (Prompt API)',
      status: geminiNano,
      use: 'On-device AI translation via Chrome Built-in AI',
      reason:
        geminiNano === 'unavailable'
          ? 'Requires Chrome 127+ with chrome://flags/#optimization-guide-on-device-model set to "Enabled BypassPerfRequirement", and chrome://flags/#prompt-api-for-gemini-nano enabled.'
          : null,
      minReq: 'Chrome 127+',
    },
    {
      name: 'Translation API',
      status: translationApi,
      use: 'On-device language translation (fallback to Gemini Nano)',
      reason:
        translationApi === 'unavailable'
          ? 'Requires Chrome 138+ with chrome://flags/#translation-api enabled.'
          : null,
      minReq: 'Chrome 138+',
    },
  ];
}

// ── Status icon + colour ──────────────────────────────────────────────────────
function StatusIcon({ status }) {
  if (status === 'available' || status === 'ready') {
    return (
      <FontAwesomeIcon
        icon={faCircleCheck}
        className="text-green-500 shrink-0 mt-0.5"
      />
    );
  }
  if (status === 'unavailable') {
    return (
      <FontAwesomeIcon
        icon={faCircleXmark}
        className="text-red-400 shrink-0 mt-0.5"
      />
    );
  }
  if (status === 'checking') {
    return (
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        className="text-amber-400 shrink-0 mt-0.5"
      />
    );
  }
  if (status === 'needs-download') {
    return (
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="text-amber-400 shrink-0 mt-0.5"
      />
    );
  }
  // unknown
  return (
    <FontAwesomeIcon
      icon={faCircleQuestion}
      className="text-gray-300 shrink-0 mt-0.5"
    />
  );
}

function statusLabel(status) {
  const map = {
    available: 'Available',
    ready: 'Ready',
    unavailable: 'Unavailable',
    checking: 'Checking…',
    'needs-download': 'Needs download',
    unknown: 'Not checked yet',
  };
  return map[status] ?? status;
}

function licenseColor(license) {
  if (license === 'MIT') return 'bg-green-50 text-green-700 border-green-200';
  if (license === 'Apache-2.0')
    return 'bg-blue-50 text-blue-700 border-blue-200';
  if (license === 'CC BY 4.0')
    return 'bg-purple-50 text-purple-700 border-purple-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

// ── Component ─────────────────────────────────────────────────────────────────
export function InfoModal({ open, onClose }) {
  const features = useFeatures();
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              App Info
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 text-sm"
              aria-label="Close info"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* ── Browser Feature Status ── */}
          <Section title="Browser Features">
            <div className="flex flex-col gap-2">
              {features.map((f) => (
                <div
                  key={f.name}
                  className={`rounded-2xl border p-3 flex flex-col gap-1 ${
                    f.status === 'unavailable'
                      ? 'bg-red-50/60 border-red-100'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <StatusIcon status={f.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800">
                          {f.name}
                        </span>
                        {f.minReq && (
                          <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full border border-gray-200">
                            min {f.minReq}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-medium ml-auto ${
                            f.status === 'available' || f.status === 'ready'
                              ? 'text-green-600'
                              : f.status === 'unavailable'
                                ? 'text-red-400'
                                : 'text-amber-500'
                          }`}
                        >
                          {statusLabel(f.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{f.use}</p>
                      {f.reason && (
                        <p className="text-xs text-red-400 mt-1 leading-relaxed">
                          <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="mr-1"
                          />
                          {f.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Support">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:border-amber-200 hover:bg-amber-50/40 transition-colors"
            >
              <span className="text-sm text-gray-700">
                Need help or want to report a bug?
              </span>
              <span className="text-xs font-medium text-amber-700">
                Open support
              </span>
            </a>
          </Section>

          {/* ── Dependencies ── */}
          <Section title="Open Source Libraries">
            <div className="flex flex-col gap-1.5">
              {DEPS.map((dep) => (
                <div
                  key={dep.name}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <a
                        href={dep.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-amber-700 transition-colors"
                      >
                        {dep.name}
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          className="text-[10px] opacity-60"
                        />
                      </a>
                      <span className="text-xs text-gray-400 ml-2">
                        {dep.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      {dep.donateUrl && (
                        <a
                          href={dep.donateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                        >
                          <FontAwesomeIcon
                            icon={faHandHoldingHeart}
                            className="text-[10px]"
                          />
                          Donate
                        </a>
                      )}

                      {dep.scope && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 bg-slate-50 text-slate-600 border-slate-200">
                          {dep.scope}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${licenseColor(dep.license)}`}
                      >
                        {dep.license}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 text-center">
              This app is open source · MIT License
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}
