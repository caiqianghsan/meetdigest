'use client';

import { useDigestStore } from '@/store/digestStore';
import { CopyButton } from '@/components/export/CopyButton';

export function SummaryTab() {
  const { result, isStreaming } = useDigestStore();
  const summary = result?.summary;

  if (!summary && isStreaming) {
    return (
      <div className="animate-pulse flex flex-col gap-4 p-4">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="flex flex-col gap-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-4" />
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${85 - i * 8}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const threeLineText = summary.threeLines.map((l) => `• ${l}`).join('\n');

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Three-line summary */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">三句话摘要</h3>
          <CopyButton getText={() => threeLineText} label="复制" />
        </div>
        <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
          {summary.threeLines.map((line, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-800">
              <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-[#1A3C5E] text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed summary */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">详细摘要</h3>
          <CopyButton
            getText={() => [
              summary.background && `背景与目标\n${summary.background}`,
              summary.keyPoints?.length && `讨论要点\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
              summary.conclusion && `核心结论\n${summary.conclusion}`,
            ].filter(Boolean).join('\n\n')}
            label="复制"
          />
        </div>

        {summary.date || summary.participants ? (
          <div className="flex gap-4 text-xs text-gray-500">
            {summary.date && <span>日期：{summary.date}</span>}
            {summary.participants && <span>参与人：{summary.participants}</span>}
          </div>
        ) : null}

        {summary.background && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">背景与目标</span>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.background}</p>
          </div>
        )}

        {summary.keyPoints?.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">讨论要点</span>
            <ol className="flex flex-col gap-1.5 list-none">
              {summary.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 text-gray-400 font-medium">{i + 1}.</span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {summary.conclusion && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">核心结论</span>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.conclusion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
