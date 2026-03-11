'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useDigestStore } from '@/store/digestStore';
import { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE } from '@/lib/utils/constants';

export function FileUploadZone() {
  const { setInputText, setUploadedFileName, isStreaming } = useDigestStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedName, setParsedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMsg(null);
    setIsUploading(true);
    setParsedName(null);

    const ext = SUPPORTED_EXTENSIONS.find((e) => file.name.toLowerCase().endsWith(e));
    if (!ext) {
      setErrorMsg('不支持的格式，请上传 TXT / PDF / Word / Markdown 文件');
      setIsUploading(false);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('文件超过 10MB 限制');
      setIsUploading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/parse-file', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message ?? '文件读取失败');
      } else {
        setInputText(data.text);
        setUploadedFileName(file.name);
        setParsedName(file.name);
      }
    } catch {
      setErrorMsg('网络错误，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">或上传文件</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isStreaming && !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}
          ${(isStreaming || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isUploading ? (
          <>
            <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-gray-500">正在读取文件...</span>
          </>
        ) : parsedName ? (
          <>
            <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-600 max-w-[80%] truncate">{parsedName}</span>
            <span className="text-xs text-gray-400">点击重新上传</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-gray-500">拖拽文件到此处，或<span className="text-blue-500">点击上传</span></span>
            <span className="text-xs text-gray-400">支持 TXT / PDF / Word / Markdown，最大 10MB</span>
          </>
        )}
        <input ref={inputRef} type="file" className="hidden" accept=".txt,.pdf,.docx,.doc,.md" onChange={onChange} disabled={isStreaming || isUploading} />
      </div>
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  );
}
