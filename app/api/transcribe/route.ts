export const runtime = 'nodejs';
export const maxDuration = 120; // long audio needs time

import OpenAI from 'openai';
import { getSession } from '@/lib/auth/session';

const MAX_SIZE_OPENAI = 25 * 1024 * 1024;
const MAX_SIZE_SV = 200 * 1024 * 1024;

export async function GET() {
  return Response.json({
    openai: !!process.env.OPENAI_API_KEY,
    sensevoice: !!process.env.SENSEVOICE_URL,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'unauthorized', message: '请先登录' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') ?? 'openai';

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

  if (provider === 'sensevoice') {
    return transcribeSenseVoice(file);
  }
  return transcribeOpenAI(file);
}

async function transcribeOpenAI(file: File): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'no_key', message: '未配置 OPENAI_API_KEY' }, { status: 503 });
  }
  if (file.size > MAX_SIZE_OPENAI) {
    return Response.json({ error: 'too_large', message: '文件超过 25MB，请压缩后重试' }, { status: 413 });
  }
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'zh',
    });
    return Response.json({ text: result.text });
  } catch (err) {
    return Response.json({ error: 'transcribe_failed', message: err instanceof Error ? err.message : '转录失败' }, { status: 500 });
  }
}

async function transcribeSenseVoice(file: File): Promise<Response> {
  const baseUrl = process.env.SENSEVOICE_URL;
  if (!baseUrl) {
    return Response.json({ error: 'no_url', message: '未配置 SENSEVOICE_URL' }, { status: 503 });
  }
  if (file.size > MAX_SIZE_SV) {
    return Response.json({ error: 'too_large', message: '文件超过 200MB 限制' }, { status: 413 });
  }
  try {
    const form = new FormData();
    form.append('files', file, file.name);
    form.append('lang', 'zh');
    form.append('use_itn', 'true');

    const res = await fetch(`${baseUrl}/api/v1/asr`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(110_000),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => 'SenseVoice 服务异常');
      return Response.json({ error: 'sv_error', message: msg }, { status: 502 });
    }

    const data = await res.json();
    // Response is either an object or array of objects with clean_text / text
    const item = Array.isArray(data) ? data[0] : data;
    const text: string = item?.clean_text ?? item?.text ?? item?.raw_text ?? '';
    return Response.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '连接 SenseVoice 失败';
    return Response.json({ error: 'sv_unreachable', message: msg }, { status: 502 });
  }
}
