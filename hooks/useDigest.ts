'use client';

import { useDigestStore } from '@/store/digestStore';
import { useHistoryStore } from '@/store/historyStore';
import type { StreamEvent, DigestResult } from '@/types';

export function useDigest() {
  const store = useDigestStore();
  const historyAdd = useHistoryStore((s) => s.add);

  const startDigest = async () => {
    if (!store.inputText.trim()) return;

    store.reset();
    store.setStreaming(true);
    store.setProgress('analyzing', '正在分析内容...');

    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: store.inputText }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: '请求失败' }));
        throw new Error(err.message || '请求失败');
      }

      if (!response.body) throw new Error('无响应数据');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Initialize empty result shell
      const partialResult: Partial<DigestResult> = {
        generatedAt: new Date().toISOString(),
        actionItems: [],
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          switch (event.type) {
            case 'progress': {
              const d = event.data as { phase: DigestResult['summary'] extends never ? never : 'analyzing' | 'summarizing' | 'extracting' | 'insights' | 'done'; message: string };
              store.setProgress(d.phase as never, d.message);
              break;
            }
            case 'summary': {
              const summary = event.data as DigestResult['summary'];
              partialResult.summary = summary;
              store.setResult({ ...partialResult, summary, actionItems: partialResult.actionItems ?? [], insights: partialResult.insights ?? { decisions: [], risks: [], opportunities: [], openQuestions: [] }, generatedAt: partialResult.generatedAt! });
              store.setActiveTab('summary');
              break;
            }
            case 'actionItems': {
              const { items } = event.data as { items: DigestResult['actionItems'] };
              partialResult.actionItems = items;
              store.updateActionItems(items);
              break;
            }
            case 'insights': {
              const insights = event.data as DigestResult['insights'];
              partialResult.insights = insights;
              store.updateInsights(insights);
              break;
            }
            case 'done': {
              store.setStreaming(false);
              store.setProgress('done', '提炼完成');
              const finalResult = useDigestStore.getState().result;
              if (finalResult) {
                historyAdd(useDigestStore.getState().inputText, finalResult);
              }
              break;
            }
            case 'error': {
              const { message } = event.data as { message: string };
              throw new Error(message);
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误，请重试';
      store.setError(msg);
      store.setStreaming(false);
      store.setProgress('idle', '');
    }
  };

  return { startDigest };
}
