import { NextResponse } from 'next/server';
import { searchCDX } from '@/server/services/archive';

export async function GET() {
  try {
    const results = await searchCDX('example.com', { limit: 1 });
    const hasData = Array.isArray(results) && results.length > 0;
    return NextResponse.json({
      status: hasData ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { archive: hasData ? 'ok' : 'no_data' },
    });
  } catch {
    return NextResponse.json({
      status: 'down',
      timestamp: new Date().toISOString(),
      checks: { archive: 'error' },
    }, { status: 503 });
  }
}
