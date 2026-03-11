export const runtime = 'nodejs';

import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '@/lib/utils/constants';
import { cleanText } from '@/lib/parsers/textCleaner';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'no_file', message: '未收到文件' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: 'too_large', message: '文件超过 10MB 限制' }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const ext = SUPPORTED_EXTENSIONS.find((e) => name.endsWith(e));
    if (!ext) {
      return Response.json(
        { error: 'unsupported_type', message: '不支持的文件格式，请上传 TXT/PDF/Word/Markdown' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (ext === '.pdf') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (ext === '.docx' || ext === '.doc') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      // .txt or .md
      text = buffer.toString('utf-8');
    }

    const cleaned = cleanText(text);
    return Response.json({ text: cleaned, fileName: file.name, charCount: cleaned.length });
  } catch (err) {
    console.error('[parse-file]', err);
    return Response.json(
      { error: 'parse_failed', message: '文件读取失败，请尝试复制内容粘贴' },
      { status: 500 }
    );
  }
}
