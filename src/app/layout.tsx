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
  title: "定时任务管理系统",
  description: "用户注册登录后可以添加每多少分钟访问某一个网站的系统",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
