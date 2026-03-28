/**
 * API التحقق من المستخدم الحالي
 * Get Current User API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth/jwt';

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

    // البحث عن المستخدم
    const user = await db.user.findUnique({
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
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({
      success: false,
      data: {
        isAuthenticated: false,
        user: null,
      },
    });
  }
}
