/**
 * API تسجيل الخروج
 * Logout API Route
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // إنشاء الاستجابة
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });

    // حذف جميع الكوكيز المتعلقة بالمصادقة
    const cookiesToClear = [
      'accessToken',
      'refreshToken', 
      'sessionId',
      'access_token',
      'refresh_token',
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // حتى لو حدث خطأ، نحذف الكوكيز
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الخروج',
    });

    response.cookies.set('accessToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}

// GET for quick logout via link
export async function GET(request: NextRequest) {
  return POST(request);
}
