import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Generate a Content Security Policy with a per-request nonce.
 *
 * Spec reference: SEC.1. No 'unsafe-inline' or 'unsafe-eval' in script-src.
 * Inline scripts require the nonce. frame-src restricted to Wayback Machine.
 */
function generateCSP(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `frame-src https://web.archive.org`,
    `connect-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy redirects: /timeline/:site and /viewer/:site → /search?q=:site
  const timelineMatch = pathname.match(/^\/timeline\/(.+)$/);
  const viewerMatch = pathname.match(/^\/viewer\/(.+)$/);
  const redirectTarget = timelineMatch?.[1] ?? viewerMatch?.[1];

  if (redirectTarget) {
    const url = request.nextUrl.clone();
    url.pathname = '/search';
    url.searchParams.set('q', redirectTarget);
    return NextResponse.redirect(url);
  }

  // Generate per-request nonce for CSP (SEC.1)
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = btoa(String.fromCharCode(...nonceBytes));
  const csp = generateCSP(nonce);

  // Pass nonce to the app via a request header so the layout can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', csp);
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
