import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect Admin panel routes and route dashboard aliases to /admin.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect legacy /admin-login to /admin/login
  if (pathname === '/admin-login') {
    const adminLoginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(adminLoginUrl);
  }

  // 2. Redirect legacy /dashboard paths to /admin equivalents
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const newPath = pathname.replace(/^\/dashboard/, '/admin');
    const redirectUrl = new URL(newPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Admin routes authentication
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionCookie = request.cookies.get('admin_session');
    const isAuthenticated = Boolean(sessionCookie && sessionCookie.value);

    // If visiting /admin/login while already authenticated, go to /admin overview
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        const adminUrl = new URL('/admin', request.url);
        return NextResponse.redirect(adminUrl);
      }
      return NextResponse.next();
    }

    // If accessing any /admin route unauthenticated, redirect to /admin/login
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/admin-login',
  ],
};
