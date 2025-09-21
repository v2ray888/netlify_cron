import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { ErrorBoundary } from "../components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "自动化定时任务平台 - 企业级定时任务管理系统",
  description: "专业的自动化定时任务平台，支持每分钟级别的精确任务调度，帮助企业自动化网站访问、健康检查和数据抓取等任务",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Failed to get server session:', error);
  }
  
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <ErrorBoundary>
          <SessionProviderWrapper session={session}>
            {children}
          </SessionProviderWrapper>
        </ErrorBoundary>
      </body>
    </html>
  );
}