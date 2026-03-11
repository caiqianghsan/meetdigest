'use client';

import { useDigestStore } from '@/store/digestStore';
import { buildMarkdown } from '@/lib/utils/markdownBuilder';

export function MarkdownPreviewTab() {
  const { result } = useDigestStore();

  if (!result) return null;

  const markdown = buildMarkdown(result);

  return (
    <div className="p-4">
      <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[500px]">
        {markdown}
      </pre>
    </div>
  );
}
