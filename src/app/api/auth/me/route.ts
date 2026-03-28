/**
 * API التحقق من المستخدم الحالي
 * Get Current User API Route
 * 
 * Enhanced with retry logic for database connection resilience
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // الحصول على الـ Access Token من الكعكة
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({
        success: false,
        data: {
          isAuthenticated: false,
          user: null,
        },
      });
    }

    // التحقق من صحة الـ Token
    const decoded = verifyAccessToken(accessToken);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json({
        success: false,
        data: {
          isAuthenticated: false,
          user: null,
        },
      });
    }

    // البحث عن المستخدم مع retry
    const user = await withRetry(async () => {
      return db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          phone: true,
          email: true,
          name: true,
          avatar: true,
          userType: true,
          status: true,
          language: true,
          currency: true,
          isPhoneVerified: true,
          isEmailVerified: true,
          is2FAEnabled: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });
    }, 3, 500);

    if (!user) {
      return NextResponse.json({
        success: false,
        data: {
          isAuthenticated: false,
          user: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isAuthenticated: true,
        user,
      },
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    
    // Return a safe response instead of error for auth check
    return NextResponse.json({
      success: false,
      data: {
        isAuthenticated: false,
        user: null,
        error: error?.code === 'P1001' || error?.code === 'P1002' || error?.code === 'P1008'
          ? 'خدمة قاعدة البيانات غير متاحة مؤقتاً'
          : undefined,
      },
    });
  }
}
