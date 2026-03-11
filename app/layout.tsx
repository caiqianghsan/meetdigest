import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetDigest — 智能会议内容提炼助手",
  description: "将会议记录、文档内容自动提炼为结构化摘要、Action Items 和关键洞察",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
