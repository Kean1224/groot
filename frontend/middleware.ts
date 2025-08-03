import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for admin token in cookies or headers
    const token = request.cookies.get('admin_jwt')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // No token found, redirect to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode payload without verification (client-side check only)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (!payload.exp || Date.now() / 1000 > payload.exp) {
        throw new Error('Token expired');
      }

      // Check if user has admin role
      if (payload.role !== 'admin') {
        throw new Error('Not an admin');
      }

      // Token is valid, allow request to continue
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // For non-admin routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
};
