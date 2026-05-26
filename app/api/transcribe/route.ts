export const runtime = 'nodejs';

import OpenAI from 'openai';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const available = !!process.env.OPENAI_API_KEY;
  return Response.json({ available });
}

const MAX_SIZE = 25 * 1024 * 1024; // 25MB — OpenAI Whisper hard limit

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized', message: '请先登录' }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'no_key', message: '未配置 OPENAI_API_KEY' }, { status: 503 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    file = form.get('file') as File | null;
  } catch {
    return Response.json({ error: 'bad_request', message: '请求格式错误' }, { status: 400 });
  }

  if (!file) {
    return Response.json({ error: 'no_file', message: '未收到音频文件' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'too_large', message: '文件超过 25MB，请压缩后重试' }, { status: 413 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'zh',
    });
    return Response.json({ text: transcription.text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '转录失败';
    return Response.json({ error: 'transcribe_failed', message: msg }, { status: 500 });
  }
}
