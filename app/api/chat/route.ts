export const runtime = 'nodejs';

import OpenAI from 'openai';
import { getSession } from '@/lib/auth/session';

const client = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: 'https://open.bigmodel.cn/api/paas/v4/',
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response('请先登录', { status: 401 });
  }

  let content: string, messages: { role: string; content: string }[], question: string;
  try {
    const body = await request.json();
    content = String(body.content ?? '');
    messages = Array.isArray(body.messages) ? body.messages : [];
    question = String(body.question ?? '').trim();
  } catch {
    return new Response('请求格式错误', { status: 400 });
  }

  if (!question) return new Response('问题不能为空', { status: 400 });

  const systemPrompt =
    '你是一位专业的会议分析助手。用户提供了一段会议记录，请根据原始内容准确回答用户的追问。回答要简洁、有针对性，不要重复摘要，直接回应问题。';

  const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `以下是会议记录原文：\n\n${content.slice(0, 30000)}` },
    { role: 'assistant', content: '好的，我已阅读这份会议记录，请问有什么问题？' },
    ...messages.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: question },
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: 'glm-4v-plus-0111',
          messages: apiMessages,
          stream: true,
        });
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '请求失败';
        controller.enqueue(encoder.encode(`\n[错误: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
