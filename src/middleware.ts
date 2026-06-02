import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Next.js middleware — this file MUST be named middleware.ts and
// export a function named "middleware" for Next.js to recognize it.
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  // Note: Basic headers are also set in vercel.json, but this middleware
  // adds CSP and Permissions-Policy which vercel.json doesn't cover.
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.chatglm.site; frame-ancestors *;"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
