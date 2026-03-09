import '../styles/globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { KokoroProvider } from '../src/context/KokoroContext';
import { SettingsModal }  from '../src/components/SettingsModal';

config.autoAddCss = false;

export default function MyApp({ Component, pageProps }) {
  return (
    <KokoroProvider>
      <Component {...pageProps} />
      <SettingsModal />
    </KokoroProvider>
  );
}
