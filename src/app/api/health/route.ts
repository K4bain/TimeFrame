import { NextResponse } from 'next/server';
import { cachedFetch, getCacheKey } from '@/server/services/cache-service';

export async function GET() {
  try {
    const result = await cachedFetch(
      getCacheKey("health", "archive"),
      async () => {
        const response = await fetch('https://web.archive.org/cdx/search/cdx?url=example.com&output=json&fl=timestamp&limit=1&matchType=host');
        if (!response.ok) throw new Error('CDX request failed');
        const data = await response.json();
        return Array.isArray(data) && data.length > 1;
      },
      60
    );
    return NextResponse.json({
      status: result ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { archive: result ? 'ok' : 'no_data' },
    });
  } catch {
    return NextResponse.json({
      status: 'down',
      timestamp: new Date().toISOString(),
      checks: { archive: 'error' },
    }, { status: 503 });
  }
}
