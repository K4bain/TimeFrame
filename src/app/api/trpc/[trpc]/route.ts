import type { NextRequest } from 'next/server';

const BACKEND_ORIGIN = 'https://timeframe-backend.vercel.app';

const handler = async (req: NextRequest, { params }: { params: Promise<{ trpc: string }> }) => {
  const { trpc: procedure } = await params;
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_ORIGIN}/api/trpc/${procedure}${url.search}`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.text();
  }

  const res = await fetch(targetUrl, init);
  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
    },
  });
};

export { handler as GET, handler as POST };
