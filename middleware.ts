import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/admin/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!request.cookies.has('asca_admin_session')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
