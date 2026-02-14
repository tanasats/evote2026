// Next.js Middleware for Server-Side Route Protection
// This middleware runs on every request before the page is rendered

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '@/types/auth';
import { getRedirectPath, canAccessRoute } from '@/utils/rbac';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value;
    const { pathname } = request.nextUrl;

    // Decode token if exists
    let decoded: JWTPayload | null = null;
    if (token) {
        try {
            decoded = jwtDecode<JWTPayload>(token);

            // Check token expiration
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                // Token expired - clear cookie and redirect to login
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('auth-token');
                return response;
            }
        } catch (e) {
            // Invalid token - clear cookie and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth-token');
            return response;
        }
    }

    const userRole = decoded?.role;

    // Check if user has voted and trying to access voting pages
    if (decoded?.has_voted && (pathname.startsWith('/voting') || pathname.startsWith('/summary'))) {
        return NextResponse.redirect(new URL('/success', request.url));
    }

    // Get redirect path based on role and current path
    const redirectPath = getRedirectPath(userRole, pathname);
    if (redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Additional check: verify route access
    if (!canAccessRoute(userRole, pathname)) {
        // Redirect to appropriate page
        if (userRole) {
            return NextResponse.redirect(new URL('/', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
