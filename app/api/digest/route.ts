export const runtime = 'nodejs';

import OpenAI from 'openai';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/claude/prompts';
import { MAX_CHARS } from '@/lib/utils/constants';
import type { StreamEvent } from '@/types';
import { getSession } from '@/lib/auth/session';

const client = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

function sseData(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ message: '请先登录' }), { status: 401 });
  }

  let content: string;
  try {
    const body = await request.json();
    content = String(body.content ?? '').slice(0, MAX_CHARS);
  } catch {
    return new Response(JSON.stringify({ message: '请求格式错误' }), { status: 400 });
  }

  if (!content.trim()) {
    return new Response(JSON.stringify({ message: '内容不能为空' }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(sseData(event)));
      };

      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 55000);

      try {
        send({ type: 'progress', data: { phase: 'analyzing', message: '正在分析内容...' } });

        const response = await client.chat.completions.create(
          {
            model: 'glm-4v-plus-0111',
            max_tokens: 4096,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: buildUserPrompt(content) },
            ],
          },
          { signal: abort.signal }
        );

        clearTimeout(timeout);

        const raw = (response.choices[0].message.content ?? '')
          .replace(/^```json\s*/m, '')
          .replace(/^```\s*/m, '')
          .replace(/```\s*$/m, '')
          .trim();

        const parsed = JSON.parse(raw);

        send({ type: 'progress', data: { phase: 'summarizing', message: '生成摘要...' } });
        send({ type: 'summary', data: parsed.summary });

        send({ type: 'progress', data: { phase: 'extracting', message: '提取行动项...' } });
        send({ type: 'actionItems', data: { items: parsed.actionItems ?? [] } });

        send({ type: 'progress', data: { phase: 'insights', message: '提炼关键洞察...' } });
        send({ type: 'insights', data: parsed.insights });

        send({ type: 'done', data: null });
      } catch (err) {
        clearTimeout(timeout);
        const isAbort = err instanceof Error && err.name === 'AbortError';
        send({
          type: 'error',
          data: {
            message: isAbort
              ? '处理超时，请尝试缩短内容后重试'
              : err instanceof SyntaxError
              ? 'AI 返回格式异常，请重试'
              : (err instanceof Error ? err.message : '生成失败，请重试'),
          },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
