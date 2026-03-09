import React from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useKokoroStore }  from '../stores/kokoroStore';
import { useKokoro }       from '../context/KokoroContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faTriangleExclamation, faSpinner, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const STATUS_LABEL = {
  idle:        'Not downloaded · click to load',
  downloading: 'Downloading model…',
  loading:     'Initialising model…',
  ready:       'Ready',
  error:       'Download failed — try again',
};

const STATUS_COLOR = {
  idle:        'text-gray-400',
  downloading: 'text-amber-500',
  loading:     'text-amber-500',
  ready:       'text-green-600',
  error:       'text-red-500',
};

export function SettingsModal() {
  // Selective subscriptions — each only re-renders when its own slice changes
  const update          = useSettingsStore(s => s.update);
  const ttsEngine       = useSettingsStore(s => s.ttsEngine);
  const ttsSpeed        = useSettingsStore(s => s.ttsSpeed);
  const fontSize        = useSettingsStore(s => s.fontSize);
  const fontFamily      = useSettingsStore(s => s.fontFamily);
  const settingsOpen    = useSettingsStore(s => s.settingsOpen);
  const setSettingsOpen = useSettingsStore(s => s.setSettingsOpen);

  const status          = useKokoroStore(s => s.status);
  const progress        = useKokoroStore(s => s.progress);
  const currentFile     = useKokoroStore(s => s.currentFile);
  const preferredDevice = useKokoroStore(s => s.preferredDevice);
  const gpuSupported    = useKokoroStore(s => s.gpuSupported);
  const wasmSupported   = useKokoroStore(s => s.wasmSupported);

  const { preload, selectDevice } = useKokoro();

  const selectKokoro = (d) => {
    selectDevice(d);
    update('ttsEngine', 'kokoro');
    if (status === 'idle' || status === 'error') preload();
  };

  if (!settingsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => setSettingsOpen(false)}
      />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <div className="fixed bottom-0 left-0 right-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full sm:max-w-md max-h-[85vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Settings
            </h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 text-sm"
              aria-label="Close settings"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* ── TTS Engine ── */}
          <Section title="Text-to-Speech Engine">
            <OptionRow
              label="Native (Browser)"
              description="Fast, works offline, no download"
              selected={ttsEngine === 'native'}
              onSelect={() => update('ttsEngine', 'native')}
            />
            <OptionRow
              label="Kokoro AI · WebGPU"
              description={gpuSupported
                ? 'Fastest · ~320 MB one-time download · requires GPU support'
                : 'Not supported on this browser / device'}
              selected={ttsEngine === 'kokoro' && preferredDevice === 'webgpu'}
              disabled={!gpuSupported}
              onSelect={() => selectKokoro('webgpu')}
              badge={
                gpuSupported && ttsEngine === 'kokoro' && preferredDevice === 'webgpu'
                  ? <span className={`text-xs font-medium flex items-center gap-1.5 ${STATUS_COLOR[status]}`}>
                      {(status === 'downloading' || status === 'loading') && (
                        <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />
                      )}
                      {status === 'ready' && (
                        <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                      )}
                      {STATUS_LABEL[status]}
                      {status === 'downloading' && ` · ${progress}%`}
                    </span>
                  : null
              }
            />
            <OptionRow
              label="Kokoro AI · WASM"
              description={wasmSupported
                ? 'Smaller download · ~92 MB · slower generation'
                : 'Not supported on this browser / device'}
              selected={ttsEngine === 'kokoro' && preferredDevice === 'wasm'}
              disabled={!wasmSupported}
              onSelect={() => selectKokoro('wasm')}
              badge={
                wasmSupported && ttsEngine === 'kokoro' && preferredDevice === 'wasm'
                  ? <span className={`text-xs font-medium flex items-center gap-1.5 ${STATUS_COLOR[status]}`}>
                      {(status === 'downloading' || status === 'loading') && (
                        <FontAwesomeIcon icon={faSpinner} spin className="text-[10px]" />
                      )}
                      {status === 'ready' && (
                        <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                      )}
                      {STATUS_LABEL[status]}
                      {status === 'downloading' && ` · ${progress}%`}
                    </span>
                  : null
              }
            />

            {/* Download progress bar + filename */}
            {(status === 'downloading' || status === 'loading') && (
              <div className="mt-1 mb-2 flex flex-col gap-1">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-200"
                    style={{ width: `${status === 'loading' ? 100 : progress}%` }}
                  />
                </div>
                {currentFile && status === 'downloading' && (
                  <p className="text-[10px] text-gray-400 tabular-nums truncate">
                    {currentFile} — {progress}%
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1 text-amber-400" />
              {preferredDevice === 'webgpu'
                ? 'Kokoro runs on your GPU via WebGPU — fast but requires ~320 MB download. Chrome 113+ required.'
                : 'Kokoro runs in your browser via WebAssembly — no GPU needed, smaller download (~92 MB), but slower.'}
            </p>
          </Section>

          {/* ── TTS Speed ── */}
          <Section title="Speech Speed">
            <div className="flex gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => update('ttsSpeed', s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    (ttsSpeed ?? 1) === s
                      ? 'bg-amber-400 border-amber-400 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {s === 1 ? '1×' : `${s}×`}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Font Size ── */}
          <Section title="Font Size">
            <div className="flex gap-2">
              {['sm', 'md', 'lg', 'xl'].map((size) => (
                <button
                  key={size}
                  onClick={() => update('fontSize', size)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    fontSize === size
                      ? 'bg-amber-400 border-amber-400 text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Font Family ── */}
          <Section title="Font Style">
            <div className="flex gap-2">
              <FontButton
                label="Serif"
                value="serif"
                current={fontFamily}
                onSelect={() => update('fontFamily', 'serif')}
                style={{ fontFamily: "'Playfair Display', serif" }}
              />
              <FontButton
                label="Sans"
                value="sans"
                current={fontFamily}
                onSelect={() => update('fontFamily', 'sans')}
                style={{ fontFamily: 'system-ui, sans-serif' }}
              />
            </div>
          </Section>

        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function OptionRow({ label, description, selected, disabled, onSelect, badge }) {
  return (
    <button
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`w-full flex items-start gap-3 p-3 rounded-2xl border mb-2 text-left transition-colors ${
        disabled
          ? 'border-gray-100 bg-gray-50 opacity-45 cursor-not-allowed'
          : selected
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-100 hover:border-amber-200 bg-gray-50'
      }`}
    >
      <span
        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
          selected && !disabled ? 'border-amber-400 bg-amber-400' : 'border-gray-300'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className={`text-xs mt-0.5 ${disabled ? 'text-red-400' : 'text-gray-400'}`}>{description}</p>
        {badge && <div className="mt-1">{badge}</div>}
      </div>
    </button>
  );
}

function FontButton({ label, value, current, onSelect, style }) {
  return (
    <button
      onClick={onSelect}
      style={style}
      className={`flex-1 py-3 rounded-xl border text-sm transition-colors ${
        current === value
          ? 'border-amber-400 bg-amber-50 text-amber-700'
          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-amber-300'
      }`}
    >
      {label}
    </button>
  );
}
