'use client';

import { useDigestStore } from '@/store/digestStore';
import type { ChatMessage } from '@/types';

export function useChat() {
  const appendChatMessage = useDigestStore((s) => s.appendChatMessage);
  const updateLastAssistantMessage = useDigestStore((s) => s.updateLastAssistantMessage);
  const setIsChatting = useDigestStore((s) => s.setIsChatting);
  const chatMessages = useDigestStore((s) => s.chatMessages);
  const isChatting = useDigestStore((s) => s.isChatting);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isChatting) return;

    // Snapshot history before appending new messages
    const historySnapshot = useDigestStore.getState().chatMessages;
    const inputText = useDigestStore.getState().inputText;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
    };
    appendChatMessage(userMsg);
    setIsChatting(true);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };
    appendChatMessage(assistantMsg);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText, messages: historySnapshot, question }),
      });

      if (!response.ok) throw new Error('请求失败');
      if (!response.body) throw new Error('无响应');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        updateLastAssistantMessage(accumulated);
      }
    } catch (err) {
      updateLastAssistantMessage(err instanceof Error ? `错误: ${err.message}` : '请求失败，请重试');
    } finally {
      setIsChatting(false);
    }
  };

  return { sendMessage, chatMessages, isChatting };
}
