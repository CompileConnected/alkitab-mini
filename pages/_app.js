import 'core-js/stable';
import 'regenerator-runtime/runtime';

import '../styles/globals.css';
import { useEffect } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { KokoroProvider } from '../src/context/KokoroContext';
import { SettingsModal } from '../src/components/SettingsModal';
import { useWebFeaturesStore } from '../src/stores/webFeaturesStore';
import { useSpeechStore } from '../src/stores/speechStore';

config.autoAddCss = false;

export default function MyApp({ Component, pageProps }) {
  // Probe async browser APIs once on app mount.
  // Sync flags (webgpu, wasm, speechSynthesis) are already populated.
  useEffect(() => {
    useWebFeaturesStore.getState().check();
    useSpeechStore.getState().initVoices();
  }, []);

  return (
    <KokoroProvider>
      <Component {...pageProps} />
      <SettingsModal />
    </KokoroProvider>
  );
}
