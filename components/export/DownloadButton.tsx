'use client';

import { buildMarkdown, generateFileName } from '@/lib/utils/markdownBuilder';
import type { DigestResult } from '@/types';

interface DownloadButtonProps {
  result: DigestResult;
  className?: string;
}

export function DownloadButton({ result, className = '' }: DownloadButtonProps) {
  const handleDownload = () => {
    const content = buildMarkdown(result);
    const filename = generateFileName(result.summary?.topic ?? '');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 transition-colors ${className}`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      下载 .md
    </button>
  );
}
