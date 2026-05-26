'use client';

import { TextInputArea } from './TextInputArea';
import { FileUploadZone } from './FileUploadZone';
import { AudioUploadZone } from './AudioUploadZone';
import { useDigestStore } from '@/store/digestStore';
import { useDigest } from '@/hooks/useDigest';
import { MAX_CHARS } from '@/lib/utils/constants';

const PHASE_MESSAGES: Record<string, string> = {
  analyzing: '正在分析内容...',
  summarizing: '生成摘要...',
  extracting: '提取行动项...',
  insights: '提炼关键洞察...',
  done: '提炼完成',
};

export function InputPanel() {
  const { inputText, isStreaming, streamPhase, error, reset } = useDigestStore();
  const { startDigest } = useDigest();

  const isDisabled = isStreaming || !inputText.trim() || inputText.length > MAX_CHARS;

  return (
    <div className="flex flex-col gap-5">
      <TextInputArea />
      <FileUploadZone />
      <AudioUploadZone />

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={reset} className="text-red-500 hover:text-red-700 text-xs underline flex-shrink-0">重置</button>
        </div>
      )}

      {isStreaming && streamPhase !== 'idle' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <svg className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-blue-700">{PHASE_MESSAGES[streamPhase] ?? '处理中...'}</span>
            <div className="flex gap-1">
              {(['analyzing', 'summarizing', 'extracting', 'insights'] as const).map((phase, idx) => {
                const phases = ['analyzing', 'summarizing', 'extracting', 'insights', 'done'];
                const currentIdx = phases.indexOf(streamPhase);
                const isCompleted = idx < currentIdx;
                const isActive = phase === streamPhase;
                return (
                  <div key={phase} className={`h-1 w-8 rounded-full transition-colors ${isCompleted ? 'bg-blue-500' : isActive ? 'bg-blue-400' : 'bg-blue-200'}`} />
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={startDigest}
        disabled={isDisabled}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all
          ${isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-[#1A3C5E] text-white hover:bg-[#15324f] active:scale-[0.98] shadow-sm'
          }`}
      >
        {isStreaming ? '提炼中...' : '开始提炼'}
      </button>
    </div>
  );
}
