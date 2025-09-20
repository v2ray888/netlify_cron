import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '2025-09-20-20:00',
    dashboard: 'Chinese Localized',
    lastUpdate: 'Force update dashboard with Chinese UI',
    timestamp: new Date().toISOString()
  });
}