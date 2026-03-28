// =============================================
// API تحديث التوكن
// Refresh Token API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyRefreshToken,
  verifyRefreshTokenInDB,
  verifyAccessToken,
  verifySession,
  transformUserToResponse,
  setAuthCookies,
  generateTokenPair,
  createSession,
  logAudit,
  getClientIP,
  getUserAgent,
  revokeRefreshToken,
  getAuthCookies,
  clearAuthCookies,
} from '@/lib/auth';
import { AUTH_ERRORS } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    // الحصول على Refresh Token من الكعكة أو الجسم
    const cookieData = await getAuthCookies();
    let refreshToken = cookieData.refreshToken;

    // إذا لم يوجد في الكعكة، نحاول من الجسم
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERRORS.TOKEN_INVALID,
          error: {
            code: 'NO_REFRESH_TOKEN',
          },
        },
        { status: 401 }
      );
    }

    // التحقق من Refresh Token
    const tokenPayload = await verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      await clearAuthCookies();
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERRORS.TOKEN_INVALID,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
          },
        },
        { status: 401 }
      );
    }

    // التحقق من Refresh Token في قاعدة البيانات
    const storedToken = await verifyRefreshTokenInDB(refreshToken);
    if (!storedToken) {
      await clearAuthCookies();
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERRORS.TOKEN_EXPIRED,
          error: {
            code: 'EXPIRED_REFRESH_TOKEN',
          },
        },
        { status: 401 }
      );
    }

    // التحقق من الجلسة الحالية
    const { accessToken } = cookieData;
    let sessionId: string | null = null;

    if (accessToken) {
      const accessPayload = await verifyAccessToken(accessToken);
      if (accessPayload) {
        sessionId = accessPayload.sessionId;
      }
    }

    // الحصول على المستخدم
    const user = await db.user.findUnique({
      where: { id: tokenPayload.userId },
    });

    if (!user) {
      await clearAuthCookies();
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERRORS.USER_NOT_FOUND,
          error: {
            code: 'USER_NOT_FOUND',
          },
        },
        { status: 401 }
      );
    }

    // التحقق من حالة المستخدم
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      await clearAuthCookies();
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERRORS.ACCOUNT_SUSPENDED,
          error: {
            code: 'ACCOUNT_DISABLED',
          },
        },
        { status: 403 }
      );
    }

    // إلغاء Refresh Token القديم
    await revokeRefreshToken(refreshToken);

    // إنشاء جلسة جديدة
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);
    const { session, accessToken: newAccessToken } = await createSession(
      user.id,
      userAgent,
      ipAddress
    );

    // إنشاء Refresh Token جديد
    const { token: newRefreshToken } = await generateTokenPair(
      user.id,
      user.phone,
      user.userType,
      session.id
    );

    // تعيين الكعكة الجديدة
    await setAuthCookies(newAccessToken, newRefreshToken);

    // حذف الجلسة القديمة إن وجدت
    if (sessionId) {
      try {
        await db.session.delete({ where: { id: sessionId } });
      } catch {
        // الجلسة قد تكون محذوفة بالفعل
      }
    }

    // تسجيل النشاط
    await logAudit(
      user.id,
      'TOKEN_REFRESH',
      'User',
      user.id,
      null,
      JSON.stringify({ oldSessionId: sessionId, newSessionId: session.id }),
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الجلسة بنجاح',
      data: {
        user: transformUserToResponse(user),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    await clearAuthCookies();
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء تحديث الجلسة',
        error: {
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
