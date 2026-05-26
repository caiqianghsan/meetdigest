'use client';

import { create } from 'zustand';
import type { DigestResult, ActionItem, ActiveTab, StreamPhase, ChatMessage } from '@/types';

interface DigestStore {
  // Input
  inputText: string;
  uploadedFileName: string | null;

  // Streaming state
  isStreaming: boolean;
  streamPhase: StreamPhase;
  progressMessage: string;

  // Result
  result: DigestResult | null;
  activeTab: ActiveTab;

  // Error
  error: string | null;

  // Chat
  chatMessages: ChatMessage[];
  isChatting: boolean;

  // Actions
  setInputText: (text: string) => void;
  setUploadedFileName: (name: string | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setStreaming: (streaming: boolean) => void;
  setProgress: (phase: StreamPhase, message: string) => void;
  setResult: (result: DigestResult) => void;
  updateSummary: (summary: DigestResult['summary']) => void;
  updateActionItems: (items: ActionItem[]) => void;
  updateInsights: (insights: DigestResult['insights']) => void;
  updateActionItem: (id: number, field: keyof ActionItem, value: string | boolean) => void;
  deleteActionItem: (id: number) => void;
  addActionItem: () => void;
  setError: (error: string | null) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  appendChatMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setIsChatting: (v: boolean) => void;
  reset: () => void;
}

export const useDigestStore = create<DigestStore>((set, get) => ({
  inputText: '',
  uploadedFileName: null,
  isStreaming: false,
  streamPhase: 'idle',
  progressMessage: '',
  result: null,
  activeTab: 'summary',
  error: null,
  chatMessages: [],
  isChatting: false,

  setInputText: (text) => set({ inputText: text }),
  setUploadedFileName: (name) => set({ uploadedFileName: name }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setProgress: (phase, message) => set({ streamPhase: phase, progressMessage: message }),
  setResult: (result) => set({ result }),
  updateSummary: (summary) =>
    set((s) => ({ result: s.result ? { ...s.result, summary } : null })),
  updateActionItems: (items) =>
    set((s) => ({
      result: s.result
        ? { ...s.result, actionItems: items.map((item) => Object.assign({ completed: false }, item)) }
        : null,
    })),
  updateInsights: (insights) =>
    set((s) => ({ result: s.result ? { ...s.result, insights } : null })),
  updateActionItem: (id, field, value) =>
    set((s) => ({
      result: s.result
        ? {
            ...s.result,
            actionItems: s.result.actionItems.map((item) =>
              item.id === id ? { ...item, [field]: value } : item
            ),
          }
        : null,
    })),

  deleteActionItem: (id) =>
    set((s) => ({
      result: s.result
        ? { ...s.result, actionItems: s.result.actionItems.filter((i) => i.id !== id) }
        : null,
    })),
  addActionItem: () =>
    set((s) => {
      if (!s.result) return {};
      const newId = Math.max(0, ...s.result.actionItems.map((i) => i.id)) + 1;
      return {
        result: {
          ...s.result,
          actionItems: [
            ...s.result.actionItems,
            { id: newId, completed: false, owner: '待定', task: '请填写任务描述', deadline: '-', priority: 'medium' },
          ],
        },
      };
    }),
  setError: (error) => set({ error }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  appendChatMessage: (message) =>
    set((s) => ({ chatMessages: [...s.chatMessages, message] })),
  updateLastAssistantMessage: (content) =>
    set((s) => {
      const messages = [...s.chatMessages];
      const lastIdx = messages.length - 1;
      if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
        messages[lastIdx] = { ...messages[lastIdx], content };
      }
      return { chatMessages: messages };
    }),
  setIsChatting: (v) => set({ isChatting: v }),
  reset: () =>
    set({
      isStreaming: false,
      streamPhase: 'idle',
      progressMessage: '',
      result: null,
      error: null,
      activeTab: 'summary',
      chatMessages: [],
      isChatting: false,
    }),
}));
