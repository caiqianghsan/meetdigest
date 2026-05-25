'use client';

import { useDigestStore } from '@/store/digestStore';
import { SummaryTab } from './SummaryTab';
import { ActionItemsTab } from './ActionItemsTab';
import { InsightsTab } from './InsightsTab';
import { MarkdownPreviewTab } from './MarkdownPreviewTab';
import { CopyButton } from '@/components/export/CopyButton';
import { DownloadButton } from '@/components/export/DownloadButton';
import { ChatTab } from './ChatTab';
import { buildMarkdown } from '@/lib/utils/markdownBuilder';
import type { ActiveTab } from '@/types';

const STATIC_TABS: { id: ActiveTab; label: string }[] = [
  { id: 'summary', label: '摘要' },
  { id: 'actions', label: 'Action Items' },
  { id: 'insights', label: '关键洞察' },
  { id: 'preview', label: 'Markdown' },
  { id: 'chat', label: '追问' },
];

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-16 px-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#E8F0FE] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-[#1A3C5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">输入内容，开始提炼</p>
        <p className="text-xs text-gray-400">支持会议记录、访谈内容、报告文档等</p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { icon: '📋', title: '结构化摘要', desc: '3句话版 + 详细版' },
          { icon: '✅', title: 'Action Items', desc: '谁负责 / 做什么 / 什么时间' },
          { icon: '💡', title: '关键洞察', desc: '决策 / 风险 / 机会' },
        ].map((card) => (
          <div key={card.title} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
            <span className="text-xl">{card.icon}</span>
            <span className="text-xs font-medium text-gray-700">{card.title}</span>
            <span className="text-[10px] text-gray-400 leading-tight">{card.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OutputPanel() {
  const { result, isStreaming, activeTab, setActiveTab } = useDigestStore();
  const hasResult = !!result;

  const TABS = hasResult ? STATIC_TABS : STATIC_TABS.filter((t) => t.id !== 'chat');

  const tabReadiness: Record<ActiveTab, boolean> = {
    summary: !!result?.summary,
    actions: !!result?.actionItems,
    insights: !!result?.insights,
    preview: hasResult,
    chat: hasResult,
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!hasResult && !isStreaming}
              className={`relative px-3 py-1.5 text-sm rounded-lg transition-colors
                ${activeTab === tab.id
                  ? 'bg-[#E8F0FE] text-[#1A3C5E] font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
                ${(!hasResult && !isStreaming) ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {tab.label}
              {tabReadiness[tab.id] && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Export buttons */}
        {hasResult && (
          <div className="flex gap-2">
            <CopyButton getText={() => buildMarkdown(result)} label="复制全部" />
            <DownloadButton result={result} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasResult && !isStreaming ? (
          <EmptyState />
        ) : (
          <>
            {activeTab === 'summary' && <SummaryTab />}
            {activeTab === 'actions' && <ActionItemsTab />}
            {activeTab === 'insights' && <InsightsTab />}
            {activeTab === 'preview' && <MarkdownPreviewTab />}
            {activeTab === 'chat' && <ChatTab />}
          </>
        )}
      </div>
    </div>
  );
}
