'use client';

import { useState, useCallback } from 'react';

export type ApiTranscriberStatus = 'idle' | 'uploading' | 'done' | 'error';

interface State {
  status: ApiTranscriberStatus;
  message: string;
}

export function useTranscriberApi() {
  const [state, setState] = useState<State>({ status: 'idle', message: '' });

  const transcribe = useCallback(async (file: File, onComplete: (text: string) => void) => {
    setState({ status: 'uploading', message: '正在上传并转录...' });

    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/transcribe', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        setState({ status: 'error', message: data.message ?? '转录失败，请重试' });
        return;
      }

      setState({ status: 'done', message: '转录完成' });
      onComplete(data.text);
    } catch {
      setState({ status: 'error', message: '网络错误，请重试' });
    }
  }, []);

  return { transcribe, ...state };
}
