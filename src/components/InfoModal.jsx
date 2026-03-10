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
  },
  {
    name: 'Tailwind CSS',
    version: '^4.2.1',
    license: 'MIT',
    url: 'https://tailwindcss.com',
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
    name: 'PostCSS',
    version: '^8.5.8',
    license: 'MIT',
    url: 'https://postcss.org',
  },
  {
    name: 'path-browserify',
    version: '^1.0.1',
    license: 'MIT',
    url: 'https://github.com/browserify/path-browserify',
  },
];

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
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 pointer-events-none">
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

          {/* ── Dependencies ── */}
          <Section title="Open Source Libraries">
            <div className="flex flex-col gap-1.5">
              {DEPS.map((dep) => (
                <a
                  key={dep.name}
                  href={dep.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:border-amber-200 hover:bg-amber-50/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800 group-hover:text-amber-700 transition-colors">
                      {dep.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {dep.version}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${licenseColor(dep.license)}`}
                  >
                    {dep.license}
                  </span>
                </a>
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
