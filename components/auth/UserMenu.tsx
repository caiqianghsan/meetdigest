"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserMenuProps {
  username: string;
}

export function UserMenu({ username }: UserMenuProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 ml-auto">
      <span className="text-sm text-gray-600">
        <span className="text-gray-400 mr-1">你好，</span>
        <span className="font-medium text-gray-800">{username}</span>
      </span>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50"
      >
        {loading ? "退出中..." : "退出登录"}
      </button>
    </div>
  );
}
