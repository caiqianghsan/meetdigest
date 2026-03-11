'use client';

import { useDigestStore } from '@/store/digestStore';
import { CopyButton } from '@/components/export/CopyButton';

const INSIGHT_CATEGORIES = [
  {
    key: 'decisions' as const,
    label: '决策点',
    color: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    emptyMsg: '未识别到已确认决策',
  },
  {
    key: 'risks' as const,
    label: '风险',
    color: 'border-red-200 bg-red-50',
    badge: 'bg-red-100 text-red-700',
    dot: 'bg-red-500',
    emptyMsg: '未识别到风险',
  },
  {
    key: 'opportunities' as const,
    label: '机会',
    color: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
    emptyMsg: '未识别到机会',
  },
  {
    key: 'openQuestions' as const,
    label: '待澄清',
    color: 'border-orange-200 bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-500',
    emptyMsg: '无待澄清问题',
  },
];

export function InsightsTab() {
  const { result, isStreaming } = useDigestStore();
  const insights = result?.insights;

  if (!insights && isStreaming) {
    return (
      <div className="animate-pulse grid grid-cols-2 gap-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 border border-gray-100 rounded-xl">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!insights) return null;

  const copyText = INSIGHT_CATEGORIES.flatMap((cat) => {
    const items = insights[cat.key];
    if (!items?.length) return [];
    return [`### ${cat.label}`, ...items.map((i) => `- ${i}`), ''];
  }).join('\n');

  const hasAny = INSIGHT_CATEGORIES.some((cat) => insights[cat.key]?.length > 0);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">关键洞察</h3>
        {hasAny && <CopyButton getText={() => copyText} label="复制" />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INSIGHT_CATEGORIES.map((cat) => {
          const items = insights[cat.key] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={cat.key} className={`flex flex-col gap-2 p-3 rounded-xl border ${cat.color}`}>
              <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${cat.badge}`}>
                {cat.label}
              </span>
              <ul className="flex flex-col gap-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${cat.dot}`} />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!hasAny && (
        <p className="text-sm text-gray-400 text-center py-8">未从内容中识别到明确洞察</p>
      )}
    </div>
  );
}
