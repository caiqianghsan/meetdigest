'use client';

import { useRef, useState, useCallback } from 'react';

export type TranscriberStatus = 'idle' | 'loading' | 'ready' | 'transcribing' | 'done' | 'error';

interface TranscriberState {
  status: TranscriberStatus;
  message: string;
  modelProgress: number;
}

export function useTranscriber() {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<TranscriberState>({
    status: 'idle',
    message: '',
    modelProgress: 0,
  });

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('../workers/transcribe.worker.ts', import.meta.url),
        { type: 'module' }
      );
    }
    return workerRef.current;
  }, []);

  const transcribe = useCallback(
    async (file: File, onComplete: (text: string) => void) => {
      setState({ status: 'loading', message: '正在解码音频...', modelProgress: 0 });

      let audioData: Float32Array;
      let sampleRate: number;
      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioCtx = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioCtx.close();
        sampleRate = audioBuffer.sampleRate;
        // Mix down to mono
        const channels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;
        audioData = new Float32Array(length);
        for (let c = 0; c < channels; c++) {
          const channel = audioBuffer.getChannelData(c);
          for (let i = 0; i < length; i++) {
            audioData[i] += channel[i] / channels;
          }
        }
      } catch {
        setState({ status: 'error', message: '音频解码失败，请检查文件格式', modelProgress: 0 });
        return;
      }

      const worker = getWorker();

      worker.onmessage = (e: MessageEvent) => {
        const data = e.data;
        if (data.type === 'loading') {
          setState({ status: 'loading', message: data.message, modelProgress: 0 });
        } else if (data.type === 'model_progress') {
          if (typeof data.progress === 'number') {
            setState((s) => ({ ...s, modelProgress: Math.round(data.progress) }));
          }
        } else if (data.type === 'ready') {
          setState({ status: 'ready', message: '模型已就绪', modelProgress: 100 });
        } else if (data.type === 'transcribing') {
          setState({ status: 'transcribing', message: data.message, modelProgress: 100 });
        } else if (data.type === 'done') {
          setState({ status: 'done', message: '转录完成', modelProgress: 100 });
          onComplete(data.text);
        } else if (data.type === 'error') {
          setState({ status: 'error', message: data.message, modelProgress: 0 });
        }
      };

      worker.onerror = (e) => {
        setState({ status: 'error', message: e.message ?? '转录出错，请重试', modelProgress: 0 });
      };

      // Transfer the buffer to avoid copying
      worker.postMessage({ type: 'transcribe', audioData, sampleRate }, [audioData.buffer]);
    },
    [getWorker]
  );

  return { transcribe, ...state };
}
