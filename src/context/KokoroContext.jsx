import React, { createContext, useContext, useRef, useCallback } from 'react';
import { useKokoroStore } from '../stores/kokoroStore';

/**
 * KokoroContext — singleton wrapper for the Kokoro TTS engine.
 * Ensures only one pipeline instance exists across the whole app,
 * so download progress shown in SettingsModal reflects the actual load
 * triggered by useSpeech.
 */

const KokoroContext = createContext(null);

/**
 *
 * @param {HTMLElement} children
 * @returns
 */
export function KokoroProvider({ children }) {
  const pipelineRef = useRef(null);
  const loadingRef = useRef(false);
  const audioRef = useRef(null); // AudioBufferSourceNode (single verse)
  const audioCtxRef = useRef(null);
  const scheduledSourcesRef = useRef([]); // AudioBufferSourceNodes (multi-verse stream)

  const loadPipeline = useCallback(async () => {
    if (pipelineRef.current) return pipelineRef.current;
    if (loadingRef.current) return null;
    loadingRef.current = true;

    const fileBytes = {};

    const progress_callback = (p) => {
      if (p.status === 'initiate') {
        useKokoroStore.getState().setStatus('downloading');
        useKokoroStore
          .getState()
          .setCurrentFile(p.file?.split('/').pop() ?? '');
      }

      if (p.status === 'progress') {
        fileBytes[p.file] = { loaded: p.loaded ?? 0, total: p.total ?? 0 };

        const totalLoaded = Object.values(fileBytes).reduce(
          (s, f) => s + f.loaded,
          0
        );
        const totalSize = Object.values(fileBytes).reduce(
          (s, f) => s + f.total,
          0
        );

        useKokoroStore
          .getState()
          .setCurrentFile(p.file?.split('/').pop() ?? '');
        useKokoroStore
          .getState()
          .setProgress(
            totalSize > 0
              ? Math.round((totalLoaded / totalSize) * 100)
              : (p.progress ?? 0)
          );
      }

      if (p.status === 'done') {
        if (p.file && fileBytes[p.file]) {
          fileBytes[p.file].loaded = fileBytes[p.file].total;
        }
      }

      if (p.status === 'ready') {
        useKokoroStore.getState().setStatus('loading');
        useKokoroStore.getState().setProgress(100);
      }
    };

    try {
      useKokoroStore.getState().setStatus('downloading');
      const { KokoroTTS } = await import('kokoro-js');

      const selectedDevice = useKokoroStore.getState().preferredDevice;
      // fp32 for WebGPU (best compatibility); q8 for wasm (smaller + faster download)
      const dtype = selectedDevice === 'webgpu' ? 'fp32' : 'q8';
      useKokoroStore.getState().setDevice(selectedDevice);

      const tts = await KokoroTTS.from_pretrained(
        'onnx-community/Kokoro-82M-v1.0-ONNX',
        { dtype, device: selectedDevice, progress_callback }
      );

      pipelineRef.current = tts;
      loadingRef.current = false;
      useKokoroStore.getState().setStatus('ready');
      useKokoroStore.getState().setProgress(100);
      return tts;
    } catch (err) {
      useKokoroStore.getState().setStatus('error');
      loadingRef.current = false;
      console.error('[Kokoro]', err);
      throw err;
    }
  }, []);

  // Switch backend — resets pipeline so next preload() uses the new device
  const selectDevice = useCallback((d) => {
    useKokoroStore.getState().setPreferredDevice(d);
    if (pipelineRef.current) {
      pipelineRef.current = null;
      loadingRef.current = false;
      useKokoroStore.getState().resetPipeline();
    }
  }, []);

  const speakSingle = useCallback(
    async (text, speed = 1.0) => {
      if (!text) return;

      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current = null;
      }

      useKokoroStore.getState().setSpeaking(true);
      try {
        const tts = await loadPipeline();
        if (!tts) {
          useKokoroStore.getState().setSpeaking(false);
          return;
        }

        // af_heart = American Female, warm — hardcoded
        const result = await tts.generate(text, { voice: 'af_heart', speed });

        // Stream Float32Array directly via Web Audio API — no WAV encoding needed
        const ctx = new AudioContext({ sampleRate: result.sampling_rate });
        audioCtxRef.current = ctx;

        const buffer = ctx.createBuffer(
          1,
          result.audio.length,
          result.sampling_rate
        );
        buffer.copyToChannel(result.audio, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        audioRef.current = source;

        source.onended = () => {
          useKokoroStore.getState().setSpeaking(false);
          ctx.close();
        };

        source.start();
      } catch (err) {
        useKokoroStore.getState().setSpeaking(false);
        console.error('[Kokoro speak]', err);
      }
    },
    [loadPipeline]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current = null;
    }
    // Stop all streaming scheduled sources
    scheduledSourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch {}
    });
    scheduledSourcesRef.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    useKokoroStore.getState().setSpeaking(false);
  }, []);

  // Multiple verses — uses TextSplitterStream so Kokoro can pipeline
  // synthesis while text is still being fed in, avoiding load failures.
  // (kept as internal; consumers call speak() which dispatches automatically)

  const speakMultiple = useCallback(
    async (texts, speed = 1.0) => {
      if (!texts || texts.length === 0) return;

      // Stop anything currently playing
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current = null;
      }
      scheduledSourcesRef.current.forEach((s) => {
        try {
          s.stop();
        } catch {}
      });
      scheduledSourcesRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }

      useKokoroStore.getState().setSpeaking(true);

      try {
        const tts = await loadPipeline();
        if (!tts) {
          useKokoroStore.getState().setSpeaking(false);
          return;
        }

        const { TextSplitterStream } = await import('kokoro-js');
        const splitter = new TextSplitterStream();
        const stream = tts.stream(splitter, { voice: 'af_heart', speed });

        // Kokoro outputs 24 kHz mono audio
        const SAMPLE_RATE = 24000;
        const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
        audioCtxRef.current = ctx;

        let nextStartTime = ctx.currentTime;
        let totalSources = 0;
        let finishedSources = 0;
        let streamDone = false;

        const checkDone = () => {
          if (
            streamDone &&
            finishedSources >= totalSources &&
            audioCtxRef.current === ctx
          ) {
            useKokoroStore.getState().setSpeaking(false);
            ctx.close();
            audioCtxRef.current = null;
          }
        };

        // Consume audio chunks and schedule them back-to-back
        (async () => {
          try {
            for await (const { audio } of stream) {
              if (audioCtxRef.current !== ctx) break; // stopped externally

              const samples = audio.audio;
              const sampleRate = audio.sampling_rate ?? SAMPLE_RATE;
              if (!samples || samples.length === 0) continue; // skip empty chunks

              const buffer = ctx.createBuffer(1, samples.length, sampleRate);
              buffer.copyToChannel(samples, 0);

              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);

              const startAt = Math.max(nextStartTime, ctx.currentTime);
              source.start(startAt);
              nextStartTime = startAt + buffer.duration;

              totalSources++;
              scheduledSourcesRef.current.push(source);

              source.onended = () => {
                finishedSources++;
                checkDone();
              };
            }
          } catch (err) {
            console.error('[Kokoro speakMultiple stream]', err);
            useKokoroStore.getState().setSpeaking(false);
          } finally {
            streamDone = true;
            checkDone();
          }
        })();

        // Feed each verse into the splitter token-by-token
        for (let i = 0; i < texts.length; i++) {
          const tokens = (texts[i] ?? '').match(/\s*\S+/g) ?? [];
          for (const token of tokens) {
            splitter.push(token);
            await new Promise((r) => setTimeout(r, 10));
          }
          // Separate verses with a short pause marker
          if (i < texts.length - 1) splitter.push(' ');
        }
        splitter.close();
      } catch (err) {
        useKokoroStore.getState().setSpeaking(false);
        console.error('[Kokoro speakMultiple]', err);
      }
    },
    [loadPipeline]
  );

  // Public API — accepts a string (single verse) or string[] (multiple verses)
  const speak = useCallback(
    (textOrTexts, speed = 1.0) => {
      if (Array.isArray(textOrTexts)) {
        return speakMultiple(textOrTexts, speed);
      }
      return speakSingle(textOrTexts, speed);
    },
    [speakSingle, speakMultiple]
  );

  return (
    <KokoroContext.Provider
      value={{ speak, stop, preload: loadPipeline, selectDevice }}
    >
      {children}
    </KokoroContext.Provider>
  );
}

export function useKokoro() {
  const ctx = useContext(KokoroContext);
  if (!ctx) throw new Error('useKokoro must be used within KokoroProvider');
  return ctx;
}
