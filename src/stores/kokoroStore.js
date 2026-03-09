import { create } from 'zustand';

// Evaluated once at module load — stable booleans, no hydration issues
const gpuSupported  = typeof navigator !== 'undefined' && !!navigator.gpu;
const wasmSupported = typeof WebAssembly !== 'undefined';

/**
 * Kokoro TTS reactive state store.
 * Non-serialisable engine refs (pipelineRef, audioRef, etc.) stay in
 * KokoroContext — this store owns everything that drives the UI.
 */
export const useKokoroStore = create((set) => ({
  // Engine status
  status:          'idle',   // 'idle' | 'downloading' | 'loading' | 'ready' | 'error'
  progress:        0,
  currentFile:     '',
  speaking:        false,

  // Active device after a successful load
  device:          null,     // 'webgpu' | 'wasm' | null

  // User's chosen backend — initialised from capability detection
  preferredDevice: gpuSupported ? 'webgpu' : 'wasm',

  // Capability flags — read-only after init
  gpuSupported,
  wasmSupported,

  // Setters used by KokoroContext actions
  setStatus:          (status)          => set({ status }),
  setProgress:        (progress)        => set({ progress }),
  setCurrentFile:     (currentFile)     => set({ currentFile }),
  setSpeaking:        (speaking)        => set({ speaking }),
  setDevice:          (device)          => set({ device }),
  setPreferredDevice: (preferredDevice) => set({ preferredDevice }),
  resetPipeline: () => set({
    status: 'idle', progress: 0, currentFile: '', device: null,
  }),
}));
