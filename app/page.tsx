import { InputPanel } from "@/components/input/InputPanel";
import { OutputPanel } from "@/components/output/OutputPanel";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { UserMenu } from "@/components/auth/UserMenu";
import { getSession } from "@/lib/auth/session";

export default async function Home() {
  const session = await getSession();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#1A3C5E] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-base">MeetDigest</span>
          <span className="text-xs text-gray-400 ml-1">智能会议内容提炼助手</span>
          {session && <UserMenu username={session.username} />}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* Left: History + Input */}
          <div className="flex flex-col gap-4">
            <HistoryPanel />
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <InputPanel />
            </div>
          </div>

          {/* Right: Output */}
          <div className="min-h-[600px]">
            <OutputPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 border-t border-gray-100 bg-white">
        AI 生成内容，请核对后使用
      </footer>
    </div>
  );
}
