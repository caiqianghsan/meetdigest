'use client';

import { create } from 'zustand';
import type { HistoryRecord, DigestResult } from '@/types';

const STORAGE_KEY = 'meetdigest_history';
const MAX_RECORDS = 20;

function loadFromStorage(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records: HistoryRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}

interface HistoryStore {
  records: HistoryRecord[];
  isLoaded: boolean;
  load: () => void;
  add: (inputText: string, result: DigestResult) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  records: [],
  isLoaded: false,

  load: () => {
    if (get().isLoaded) return;
    set({ records: loadFromStorage(), isLoaded: true });
  },

  add: (inputText, result) => {
    const record: HistoryRecord = {
      id: Date.now().toString(),
      topic: result.summary.topic || '未命名会议',
      generatedAt: result.generatedAt,
      inputText,
      result,
    };
    const records = [record, ...get().records].slice(0, MAX_RECORDS);
    set({ records });
    saveToStorage(records);
  },

  remove: (id) => {
    const records = get().records.filter((r) => r.id !== id);
    set({ records });
    saveToStorage(records);
  },

  clear: () => {
    set({ records: [] });
    saveToStorage([]);
  },
}));
