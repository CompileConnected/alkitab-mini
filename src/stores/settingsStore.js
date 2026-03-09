import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Centralised user-preference store.
 * `persist` middleware handles localStorage read/write automatically.
 * `partialize` excludes transient UI state (settingsOpen) from storage.
 */
export const useSettingsStore = create(
  persist(
    (set) => ({
      // Persisted preferences
      ttsEngine:   'native',  // 'native' | 'kokoro'
      ttsSpeed:    1,         // 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2
      fontSize:    'md',      // 'sm' | 'md' | 'lg' | 'xl'
      fontFamily:  'serif',   // 'serif' | 'sans'

      // Transient UI state
      settingsOpen: false,

      // Actions
      update:          (key, value) => set({ [key]: value }),
      setSettingsOpen: (open)       => set({ settingsOpen: open }),
    }),
    {
      name:        'alkitab-settings',
      // Only persist user preferences, not modal open state
      partialize:  (s) => ({
        ttsEngine:  s.ttsEngine,
        ttsSpeed:   s.ttsSpeed,
        fontSize:   s.fontSize,
        fontFamily: s.fontFamily,
      }),
    },
  ),
);
