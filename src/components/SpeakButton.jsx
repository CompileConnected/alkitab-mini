import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh, faStop } from '@fortawesome/free-solid-svg-icons';
import { useWebFeaturesStore } from '../stores/webFeaturesStore';

/**
 * SpeakButton — TTS play/stop toggle.
 * Returns null if no TTS engine is available on this device.
 *
 * @param {{
 *   speaking: boolean,
 *   onClick: () => void,
 *   theme?: 'light' | 'dark',
 *   className?: string,
 * }} props
 */
export function SpeakButton({
  speaking,
  onClick,
  theme = 'light',
  className = '',
}) {
  const webgpu = useWebFeaturesStore((s) => s.webgpu);
  const wasm = useWebFeaturesStore((s) => s.wasm);
  const speechSynthesis = useWebFeaturesStore((s) => s.speechSynthesis);

  if (!webgpu && !wasm && !speechSynthesis) return null;

  const base =
    'px-3 py-1.5 rounded-lg border active:scale-95 transition text-xs';
  const colors =
    theme === 'dark'
      ? 'border-white/15 text-white/60 hover:text-white'
      : 'border-black/10 text-black/50 hover:text-black/80 hover:border-black/25';

  return (
    <button
      onClick={onClick}
      title={speaking ? 'Stop reading' : 'Read aloud'}
      className={`${base} ${colors} ${className}`}
    >
      <FontAwesomeIcon
        icon={speaking ? faStop : faVolumeHigh}
        className="mr-1"
      />
      {speaking ? 'Stop' : 'Read'}
    </button>
  );
}
