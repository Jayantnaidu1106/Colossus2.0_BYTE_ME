import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' ||
                       path === '/api/auth/signin' ||
                       path === '/api/auth/signup' ||
                       path === '/' ||
                       path.startsWith('/api/auth/') ||
                       path === '/api/signup' ||
                       path.includes('/api/auth/callback/');

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Redirect logic
  if (isPublicPath && token) {
    // If user is authenticated and tries to access login page, redirect to dashboard
    if (path === '/login' || path === '/api/auth/signin' || path === '/api/auth/signup') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // For other public paths, allow access
    return NextResponse.next();
  }

  if (!isPublicPath && !token) {
    // If user is not authenticated and tries to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/login',
    '/api/auth/:path*',
    '/mentor/:path*',
    '/quiz/:path*',
    '/result/:path*',
    '/studytools/:path*'
  ]
};
