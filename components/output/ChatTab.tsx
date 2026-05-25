'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useDigestStore } from '@/store/digestStore';

const SUGGESTED = [
  '这次会议的核心争议点是什么？',
  '谁负责最多的行动项？',
  '有哪些未解决的问题需要跟进？',
];

export function ChatTab() {
  const [input, setInput] = useState('');
  const { sendMessage, chatMessages, isChatting } = useChat();
  const setChatMessages = useDigestStore((s) => s.setChatMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isChatting) return;
    const q = input.trim();
    setInput('');
    await sendMessage(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1A3C5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">针对内容追问</p>
              <p className="text-xs text-gray-400">基于原始会议记录回答你的问题</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-xs px-3 py-2 bg-gray-50 hover:bg-[#E8F0FE] text-gray-600 hover:text-[#1A3C5E] rounded-lg transition-colors border border-gray-100"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
                    ${msg.role === 'user'
                      ? 'bg-[#1A3C5E] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}
                >
                  {msg.content ? msg.content : (
                    msg.role === 'assistant' && isChatting ? (
                      <span className="flex gap-1 items-center py-0.5">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 p-3 flex-shrink-0">
        {chatMessages.length > 0 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setChatMessages([])}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              清空对话
            </button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，Enter 发送，Shift+Enter 换行..."
            rows={2}
            className="flex-1 resize-none text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A3C5E] transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isChatting}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0
              ${!input.trim() || isChatting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#1A3C5E] text-white hover:bg-[#15324f]'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
