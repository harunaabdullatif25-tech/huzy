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
    const adminSessionCookie = request.cookies.get('admin_session');
    let isAuthenticated = Boolean(adminSessionCookie && adminSessionCookie.value);
    let shouldSyncAdminCookie = false;
    let customerAdminToken = '';

    // If admin_session is missing, check if customer_session belongs to an admin
    if (!isAuthenticated) {
      const customerCookie = request.cookies.get('customer_session');
      if (customerCookie && customerCookie.value) {
        try {
          const parts = customerCookie.value.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.role === 'admin') {
              isAuthenticated = true;
              shouldSyncAdminCookie = true;
              customerAdminToken = customerCookie.value;
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    // If visiting /admin/login while already authenticated, go to /admin overview
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        const adminUrl = new URL('/admin', request.url);
        const res = NextResponse.redirect(adminUrl);
        if (shouldSyncAdminCookie) {
          res.cookies.set('admin_session', customerAdminToken, { path: '/', maxAge: 604800 });
        }
        return res;
      }
      return NextResponse.next();
    }

    // If accessing any /admin route unauthenticated, redirect to /admin/login
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (shouldSyncAdminCookie) {
      const res = NextResponse.next();
      res.cookies.set('admin_session', customerAdminToken, { path: '/', maxAge: 604800 });
      return res;
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
