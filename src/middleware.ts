// src/middleware.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';


export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      
      // ถ้าโหวตแล้ว แต่พยายามจะเข้าหน้าเลือกตั้ง -> ดีดไปหน้า Success
      if (decoded.has_voted && (pathname.startsWith('/voting') || pathname.startsWith('/summary'))) {
        return NextResponse.redirect(new URL('/success', request.url));
      }
      
      // ถ้า Login แล้วแต่จะไปหน้า Login -> ดีดไปหน้าโหวต (หรือ Success ถ้าโหวตแล้ว)
      if (pathname === '/login') {
        return NextResponse.redirect(new URL(decoded.has_voted ? '/success' : '/voting', request.url));
      }
    } catch (e) {
      // Token ผิดพลาด ลบออกแล้วให้ไป Login ใหม่
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // กรณีไม่ได้ Login และพยายามเข้าหน้าที่ต้องใช้สิทธิ์
  if (!token && !['/', '/login'].includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


/* import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. ดึง Token จาก Cookie
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // 2. กำหนดหน้าที่อนุญาตให้เข้าได้โดยไม่ต้อง Login (Public Routes)
  const isPublicPage = pathname === '/' || pathname === '/login';

  // 3. Logic การตรวจสอบ
  // ถ้าไม่มี Token และไม่ได้กำลังเข้าหน้า Public -> ให้ดีดไปหน้า /login
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. (เพิ่มเติม) ถ้า Login แล้ว แต่จะพยายามเข้าหน้า /login อีก -> ให้ส่งไปหน้า /voting
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/voting', request.url));
  }

  return NextResponse.next();
}

// 5. กำหนด Matcher เพื่อระบุว่าให้ Middleware ทำงานที่ Path ไหนบ้าง
// ในที่นี้เรายกเว้นไฟล์ Static และรูปภาพต่างๆ เพื่อไม่ให้เว็บอืด
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * /
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
*/



/*import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  if (request.nextUrl.pathname.startsWith('/voting') && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/voting/:path*', '/summary/:path*'],
};*/