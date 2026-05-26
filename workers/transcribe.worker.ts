import { pipeline, env, type AutomaticSpeechRecognitionPipeline } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber: AutomaticSpeechRecognitionPipeline | null = null;

async function loadModel() {
  self.postMessage({ type: 'loading', message: '正在加载模型，首次需下载约 460MB...' });
  transcriber = await pipeline(
    'automatic-speech-recognition',
    'onnx-community/whisper-small',
    {
      dtype: 'fp32',
      progress_callback: (p: Record<string, unknown>) => {
        self.postMessage({ type: 'model_progress', ...p });
      },
    }
  ) as AutomaticSpeechRecognitionPipeline;
  self.postMessage({ type: 'ready' });
}

async function transcribeAudio(audioData: Float32Array, sampleRate: number) {
  if (!transcriber) await loadModel();

  self.postMessage({ type: 'transcribing', message: '正在转录音频，较长录音请耐心等待...' });

  const result = await transcriber!(audioData, {
    sampling_rate: sampleRate,
    language: 'chinese',
    task: 'transcribe',
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: false,
  });

  const text = Array.isArray(result)
    ? result.map((r) => (r as { text: string }).text).join('')
    : (result as { text: string }).text;

  self.postMessage({ type: 'done', text });
}

self.addEventListener('message', async (e: MessageEvent<{ type: string; audioData?: Float32Array; sampleRate?: number }>) => {
  try {
    if (e.data.type === 'preload') {
      await loadModel();
    } else if (e.data.type === 'transcribe' && e.data.audioData) {
      await transcribeAudio(e.data.audioData, e.data.sampleRate ?? 16000);
    }
  } catch (err) {
    self.postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : '转录失败，请重试',
    });
  }
});
