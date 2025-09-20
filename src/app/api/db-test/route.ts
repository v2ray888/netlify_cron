import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 尝试简单查询
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}