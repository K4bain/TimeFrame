import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getBackendOrigin(): string {
  return "";
}

function generateCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "frame-src http://web.archive.org https://web.archive.org",
    `connect-src 'self' ${getBackendOrigin()} https://plausible.io`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Content-Security-Policy', generateCSP());
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (request.nextUrl.protocol === "https:") {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.svg).*)',
  ],
};
