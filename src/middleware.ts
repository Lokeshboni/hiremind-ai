import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const role = token.role as string;

    // Admin has access to everything
    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    // Recruiter routes protection
    if (path.startsWith('/dashboard/recruiter') && role !== 'RECRUITER') {
      return NextResponse.redirect(new URL('/dashboard/candidate', req.url));
    }

    // Candidate routes protection
    if (path.startsWith('/dashboard/candidate') && role !== 'CANDIDATE') {
      return NextResponse.redirect(new URL('/dashboard/recruiter', req.url));
    }

    // Admin routes protection
    if (path.startsWith('/admin') && role !== 'ADMIN') {
      const redirectUrl = role === 'RECRUITER' ? '/dashboard/recruiter' : '/dashboard/candidate';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/recruiter/:path*',
    '/dashboard/candidate/:path*',
    '/admin/:path*',
  ],
};
