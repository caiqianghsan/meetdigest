'use client';

import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { useDigestStore } from '@/store/digestStore';
import { useTranscriber } from '@/hooks/useTranscriber';
import { useTranscriberApi, type ApiProvider } from '@/hooks/useTranscriberApi';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.m4a', '.webm', '.ogg', '.flac'];
const MAX_SIZE: Record<TranscribeMode, number> = {
  local: 500 * 1024 * 1024,
  openai: 25 * 1024 * 1024,
  sensevoice: 200 * 1024 * 1024,
};

type TranscribeMode = 'local' | 'openai' | 'sensevoice';

interface Availability {
  openai: boolean;
  sensevoice: boolean;
}

export function AudioUploadZone() {
  const { setInputText, setUploadedFileName, isStreaming } = useDigestStore();
  const local = useTranscriber();
  const api = useTranscriberApi();

  const [mode, setMode] = useState<TranscribeMode>('local');
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/transcribe')
      .then((r) => r.json())
      .then((d) => setAvailability(d))
      .catch(() => setAvailability({ openai: false, sensevoice: false }));
  }, []);

  const status = mode === 'local' ? local.status : api.status;
  const message = mode === 'local' ? local.message : api.message;
  const modelProgress = mode === 'local' ? local.modelProgress : 0;

  const isActive = ['loading', 'transcribing', 'uploading'].includes(status);
  const isDone = status === 'done';
  const isError = status === 'error';
  const isDisabled = isStreaming || isActive;

  const apiUnavailable =
    (mode === 'openai' && availability !== null && !availability.openai) ||
    (mode === 'sensevoice' && availability !== null && !availability.sensevoice);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    const ext = AUDIO_EXTENSIONS.find((e) => file.name.toLowerCase().endsWith(e));
    if (!ext) {
      setErrorMsg('请上传 MP3 / WAV / M4A / WebM / OGG / FLAC 格式的音频文件');
      return;
    }
    if (file.size > MAX_SIZE[mode]) {
      const limit = mode === 'openai' ? '25MB' : mode === 'sensevoice' ? '200MB' : '500MB';
      setErrorMsg(`文件超过 ${limit} 限制`);
      return;
    }
    setFileName(file.name);
    const onComplete = (text: string) => {
      setInputText(text);
      setUploadedFileName(file.name);
    };
    if (mode === 'local') {
      local.transcribe(file, onComplete);
    } else {
      await api.transcribe(file, mode as ApiProvider, onComplete);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header with mode tabs */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">或上传音频</label>
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {([
            { id: 'local', label: '本地' },
            { id: 'openai', label: 'Whisper API' },
            { id: 'sensevoice', label: 'SenseVoice' },
          ] as { id: TranscribeMode; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all ${
                mode === tab.id
                  ? 'bg-white text-gray-800 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone or unavailable notice */}
      {apiUnavailable ? (
        <UnavailableNotice mode={mode} />
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isDisabled && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed transition-colors
            ${isDragging ? 'border-violet-400 bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}
            ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isActive ? (
            <ActiveState status={status} message={message} modelProgress={modelProgress} />
          ) : isDone ? (
            <DoneState fileName={fileName} />
          ) : isError ? (
            <ErrorState message={message} />
          ) : (
            <IdleState mode={mode} />
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".mp3,.wav,.m4a,.webm,.ogg,.flac"
            onChange={onChange}
            disabled={isDisabled}
          />
        </div>
      )}

      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}

      <p className="text-xs text-gray-400">
        {mode === 'local' && '本地转录：隐私安全，首次下载模型约 460MB'}
        {mode === 'openai' && 'Whisper API：需要 OPENAI_API_KEY，文件限 25MB'}
        {mode === 'sensevoice' && 'SenseVoice：需本地运行服务（SENSEVOICE_URL），中文质量最佳'}
      </p>
    </div>
  );
}

function UnavailableNotice({ mode }: { mode: TranscribeMode }) {
  const config = {
    openai: {
      env: 'OPENAI_API_KEY',
      hint: '在 .env.local 中配置后重启服务',
    },
    sensevoice: {
      env: 'SENSEVOICE_URL',
      hint: '先启动 SenseVoice 本地服务，再在 .env.local 配置地址',
    },
  }[mode as 'openai' | 'sensevoice'];

  return (
    <div className="flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 px-4 text-center">
      <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs text-amber-700">
        需配置 <code className="bg-amber-100 px-1 rounded">{config.env}</code>
      </p>
      <p className="text-xs text-amber-600">{config.hint}</p>
    </div>
  );
}

function IdleState({ mode }: { mode: TranscribeMode }) {
  const hint = {
    local: 'MP3 / WAV / M4A，本地转录',
    openai: 'MP3 / WAV / M4A，最大 25MB',
    sensevoice: 'MP3 / WAV / M4A，最大 200MB',
  }[mode];
  return (
    <>
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
      <span className="text-xs text-gray-500">
        拖拽音频到此处，或<span className="text-violet-500">点击上传</span>
      </span>
      <span className="text-xs text-gray-400">{hint}</span>
    </>
  );
}

function ActiveState({ status, message, modelProgress }: { status: string; message: string; modelProgress: number }) {
  return (
    <>
      <svg className="w-5 h-5 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span className="text-xs text-gray-600 text-center px-4">{message}</span>
      {status === 'loading' && modelProgress > 0 && (
        <div className="flex items-center gap-2 w-40">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-400 rounded-full transition-all duration-300"
              style={{ width: `${modelProgress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8 text-right">{modelProgress}%</span>
        </div>
      )}
    </>
  );
}

function DoneState({ fileName }: { fileName: string | null }) {
  return (
    <>
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-xs text-gray-600 max-w-[80%] truncate">{fileName}</span>
      <span className="text-xs text-gray-400">转录完成，点击重新上传</span>
    </>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-xs text-red-500 text-center px-4">{message}</span>
      <span className="text-xs text-gray-400">点击重试</span>
    </>
  );
}
