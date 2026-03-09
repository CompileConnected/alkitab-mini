/**
 * Backward-compat shim.
 * State has fully moved to useSettingsStore (Zustand) in src/stores/settingsStore.js.
 * SettingsProvider is kept as a no-op so any remaining wrapping doesn't break.
 */
import React from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export function SettingsProvider({ children }) {
  return <>{children}</>;
}

/** @deprecated Import useSettingsStore from '../stores/settingsStore' directly. */
export function useSettings() {
  const { ttsEngine, ttsSpeed, fontSize, fontFamily, update, settingsOpen, setSettingsOpen } =
    useSettingsStore();
  return {
    settings: { ttsEngine, ttsSpeed, fontSize, fontFamily },
    update,
    open:    settingsOpen,
    setOpen: setSettingsOpen,
  };
}
