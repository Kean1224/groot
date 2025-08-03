import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for admin token in cookies first, then headers
    let token = request.cookies.get('admin_jwt')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      // No token found, redirect to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Basic JWT structure validation (client-side only)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode payload without verification (basic client-side check)
      const payloadBase64 = parts[1];
      // Add padding if needed for base64 decoding
      const paddedPayload = payloadBase64 + '='.repeat((4 - payloadBase64.length % 4) % 4);
      
      let payload;
      try {
        payload = JSON.parse(atob(paddedPayload));
      } catch (decodeError) {
        throw new Error('Invalid token payload');
      }
      
      // Check if token is expired (basic check)
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        throw new Error('Token expired');
      }

      // Check if user has admin role
      if (payload.role !== 'admin') {
        throw new Error('Not an admin');
      }

      // Token appears valid, allow request to continue
      // Note: Full verification happens on the client-side
      return NextResponse.next();
    } catch (error) {
      // Invalid token, redirect to login
      console.log('Middleware token validation failed:', error.message);
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
