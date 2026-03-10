import { create } from 'zustand';
import { withDevtools } from './withDevtools';

/**
 * Kokoro TTS reactive state store.
 * Non-serialisable engine refs (pipelineRef, audioRef, etc.) stay in
 * KokoroContext — this store owns everything that drives the UI.
 *
 * Capability flags (webgpu / wasm) have moved to webFeaturesStore.
 */
export const useKokoroStore = create(
  withDevtools(
    (set) => ({
      // Engine status
      status: 'idle', // 'idle' | 'downloading' | 'loading' | 'ready' | 'error'
      progress: 0,
      currentFile: '',
      speaking: false,

      // Active device after a successful load
      device: null, // 'webgpu' | 'wasm' | null

      // User's chosen backend — derived from webFeaturesStore at init time
      preferredDevice: null,

      // Setters used by KokoroContext actions
      setStatus: (status) => set({ status }),
      setProgress: (progress) => set({ progress }),
      setCurrentFile: (currentFile) => set({ currentFile }),
      setSpeaking: (speaking) => set({ speaking }),
      setDevice: (device) => set({ device }),
      setPreferredDevice: (preferredDevice) => set({ preferredDevice }),
      resetPipeline: () =>
        set({
          status: 'idle',
          progress: 0,
          currentFile: '',
          device: null,
        }),
    }),
    { name: 'KokoroStore', store: 'AlkitabMini' }
  )
);
