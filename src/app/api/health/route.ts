import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 基本健康检查
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}