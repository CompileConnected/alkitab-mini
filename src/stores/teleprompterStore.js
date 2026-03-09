import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { withDevtools } from './withDevtools';

const SIZE_STEPS   = [18, 22, 28, 36, 44, 54, 64];
const DEFAULT_IDX  = 2;
const DEFAULT_VPP  = 5;

export { SIZE_STEPS };

/**
 * teleprompterStore — persisted user preferences for the Teleprompter view.
 *
 * `sizeIdx` and `vpp` are user-configurable display preferences that should
 * survive navigation and page refreshes, so they are persisted to localStorage.
 *
 * `page` (current verse page) is intentionally kept as local component state
 * in Teleprompter.js because it must reset whenever the verse content changes.
 */
export const useTeleprompterStore = create(
  withDevtools(
    persist(
    (set, get) => ({
      // Index into SIZE_STEPS array — controls displayed font size
      sizeIdx: DEFAULT_IDX,

      // Verses rendered per page in multi-verse passages
      vpp: DEFAULT_VPP,

      // Actions
      setSizeIdx: (sizeIdx) => set({ sizeIdx }),
      setVpp:     (vpp)     => set({ vpp }),

      bigger:  () => set((s) => ({ sizeIdx: Math.min(s.sizeIdx + 1, SIZE_STEPS.length - 1) })),
      smaller: () => set((s) => ({ sizeIdx: Math.max(s.sizeIdx - 1, 0) })),
      vppUp:   () => set((s) => ({ vpp: Math.min(s.vpp + 1, 20) })),
      vppDown: () => set((s) => ({ vpp: Math.max(s.vpp - 1, 1) })),
    }),
    {
      name: 'alkitab-teleprompter',
      partialize: (s) => ({ sizeIdx: s.sizeIdx, vpp: s.vpp }),
    },
    ),
    { name: 'TeleprompterStore', store: 'AlkitabMini' },
  ),
);
