'use client';

import { useEffect, useState } from 'react';
import { useHistoryStore } from '@/store/historyStore';
import { useDigestStore } from '@/store/digestStore';

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function HistoryPanel() {
  const { records, isLoaded, load, remove, clear } = useHistoryStore();
  const { setInputText, setResult, setActiveTab, setChatMessages } = useDigestStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { load(); }, [load]);

  if (!isLoaded || records.length === 0) return null;

  const handleRestore = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setInputText(record.inputText);
    setResult(record.result);
    setChatMessages([]);
    setActiveTab('summary');
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">历史记录</span>
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{records.length}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100">
          <div className="max-h-60 overflow-y-auto">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 group"
              >
                <button onClick={() => handleRestore(record.id)} className="flex-1 text-left min-w-0">
                  <p className="text-sm text-gray-800 truncate font-medium">{record.topic}</p>
                  <p className="text-xs text-gray-400">{formatDate(record.generatedAt)}</p>
                </button>
                <button
                  onClick={() => remove(record.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <button onClick={clear} className="text-xs text-gray-400 hover:text-red-400 transition-colors">
              清空全部
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
