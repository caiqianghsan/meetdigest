'use client';

import { useDigestStore } from '@/store/digestStore';
import { CopyButton } from '@/components/export/CopyButton';
import type { ActionItem, Priority } from '@/types';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: '高', color: 'bg-red-100 text-red-700' },
  medium: { label: '中', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: '低', color: 'bg-green-100 text-green-700' },
};

export function ActionItemsTab() {
  const { result, isStreaming, updateActionItem, deleteActionItem, addActionItem } = useDigestStore();
  const items = result?.actionItems ?? [];

  if (items.length === 0 && isStreaming) {
    return (
      <div className="animate-pulse flex flex-col gap-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 border border-gray-100 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded flex-1" />
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-8" />
          </div>
        ))}
      </div>
    );
  }

  const copyText = items
    .map((item) => {
      const deadline = item.deadline && item.deadline !== '-' ? `（截止：${item.deadline}）` : '';
      const priority = `[优先级：${PRIORITY_CONFIG[item.priority]?.label ?? item.priority}]`;
      return `- [ ] **${item.owner}** — ${item.task}${deadline} ${priority}`;
    })
    .join('\n');

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">行动清单</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length} 项</span>
        </div>
        <CopyButton getText={() => copyText} label="复制" />
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">未识别到行动项</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <ActionItemRow
              key={item.id}
              item={item}
              onUpdate={(field, value) => updateActionItem(item.id, field, value)}
              onDelete={() => deleteActionItem(item.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={addActionItem}
        className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 transition-colors mt-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        添加条目
      </button>
    </div>
  );
}

function ActionItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: ActionItem;
  onUpdate: (field: keyof ActionItem, value: string) => void;
  onDelete: () => void;
}) {
  const cfg = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <div className="group flex items-start gap-2 p-3 border border-gray-100 rounded-lg hover:border-gray-200 bg-white transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <input type="checkbox" className="w-4 h-4 rounded accent-[#1A3C5E] cursor-pointer" />
      </div>
      <div className="flex-1 grid grid-cols-[auto_1fr_auto_auto] gap-2 items-start min-w-0">
        <input
          value={item.owner}
          onChange={(e) => onUpdate('owner', e.target.value)}
          className="text-sm font-medium text-[#1A3C5E] bg-transparent border-none outline-none w-16 min-w-0 focus:bg-blue-50 rounded px-1"
          title="负责人"
        />
        <input
          value={item.task}
          onChange={(e) => onUpdate('task', e.target.value)}
          className="text-sm text-gray-700 bg-transparent border-none outline-none min-w-0 focus:bg-gray-50 rounded px-1"
          title="任务描述"
        />
        <input
          value={item.deadline}
          onChange={(e) => onUpdate('deadline', e.target.value)}
          className="text-xs text-gray-500 bg-transparent border-none outline-none w-20 focus:bg-gray-50 rounded px-1"
          title="截止时间"
          placeholder="-"
        />
        <select
          value={item.priority}
          onChange={(e) => onUpdate('priority', e.target.value)}
          className={`text-xs px-1.5 py-0.5 rounded-full border-none outline-none cursor-pointer ${cfg.color}`}
        >
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
      </div>
      <button
        onClick={onDelete}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all mt-0.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
