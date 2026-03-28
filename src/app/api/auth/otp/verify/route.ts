// =============================================
// API التحقق من رمز OTP
// Verify OTP API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpService } from '@/lib/services/otp-service';
import { 
  transformUserToResponse, 
  setAuthCookies, 
  generateTokenPair, 
  createSession, 
  logAudit, 
  getClientIP, 
  getUserAgent,
  checkUserStatus,
} from '@/lib/auth';
import { verifyOTPSchema } from '@/lib/validators/auth';
import { OTPType, UserStatus } from '@prisma/client';
import { AUTH_ERRORS } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات
    const validationResult = verifyOTPSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'بيانات غير صحيحة',
          error: {
            code: 'VALIDATION_ERROR',
            details: validationResult.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { phone, code, type } = validationResult.data;

    // التحقق من OTP حسب النوع
    if (type === OTPType.PHONE_VERIFICATION) {
      // التحقق من OTP للتسجيل
      const result = await otpService.verifyOTPForRegistration(phone, code, type);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            error: {
              code: 'OTP_VERIFY_FAILED',
              details: {
                attemptsRemaining: result.attemptsRemaining,
              },
            },
          },
          { status: 400 }
        );
      }

      // تحديث حالة المستخدم إذا كان موجوداً
      const user = await db.user.findUnique({
        where: { phone },
      });

      if (user && result.otpId) {
        // تحديث الـ OTP userId
        await otpService.updateOTPUserId(result.otpId, user.id);

        // تحديث حالة التحقق
        await db.user.update({
          where: { id: user.id },
          data: {
            isPhoneVerified: true,
            status: UserStatus.ACTIVE,
          },
        });

        // إنشاء جلسة
        const ipAddress = getClientIP(request);
        const userAgent = getUserAgent(request);
        const { session, accessToken } = await createSession(
          user.id,
          userAgent,
          ipAddress
        );

        const { token: refreshToken } = await generateTokenPair(
          user.id,
          user.phone,
          user.userType,
          session.id
        );

        await setAuthCookies(accessToken, refreshToken);

        // تسجيل النشاط
        await logAudit(
          user.id,
          'PHONE_VERIFIED',
          'User',
          user.id,
          null,
          JSON.stringify({ phone }),
          ipAddress,
          userAgent
        );

        return NextResponse.json({
          success: true,
          message: 'تم التحقق من رقم الهاتف بنجاح',
          data: {
            user: transformUserToResponse({ ...user, isPhoneVerified: true, status: UserStatus.ACTIVE }),
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
          },
        });
      }

      // إرجاع نجاح مع طلب إكمال التسجيل
      return NextResponse.json({
        success: true,
        message: 'تم التحقق من الرمز بنجاح',
        data: {
          verified: true,
          otpId: result.otpId,
          phone,
        },
      });
    }

    // التحقق من OTP لتسجيل الدخول
    if (type === OTPType.LOGIN) {
      const user = await db.user.findUnique({
        where: { phone },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: AUTH_ERRORS.USER_NOT_FOUND,
            error: {
              code: 'USER_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      const result = await otpService.verifyOTP(user.id, phone, code, type);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            error: {
              code: 'OTP_VERIFY_FAILED',
              details: {
                attemptsRemaining: result.attemptsRemaining,
              },
            },
          },
          { status: 400 }
        );
      }

      // التحقق من حالة المستخدم
      const statusCheck = checkUserStatus(user);
      if (!statusCheck.valid) {
        return NextResponse.json(
          {
            success: false,
            message: statusCheck.error,
            error: {
              code: 'USER_STATUS_ERROR',
            },
          },
          { status: 403 }
        );
      }

      // إنشاء جلسة
      const ipAddress = getClientIP(request);
      const userAgent = getUserAgent(request);
      const { session, accessToken } = await createSession(
        user.id,
        userAgent,
        ipAddress
      );

      const { token: refreshToken } = await generateTokenPair(
        user.id,
        user.phone,
        user.userType,
        session.id
      );

      // تحديث وقت آخر تسجيل دخول
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await setAuthCookies(accessToken, refreshToken);

      // تسجيل النشاط
      await logAudit(
        user.id,
        'LOGIN',
        'User',
        user.id,
        null,
        JSON.stringify({ loginMethod: 'otp' }),
        ipAddress,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: {
          user: transformUserToResponse(user),
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
        },
      });
    }

    // التحقق من OTP لإعادة تعيين كلمة المرور
    if (type === OTPType.PASSWORD_RESET) {
      const user = await db.user.findUnique({
        where: { phone },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: AUTH_ERRORS.USER_NOT_FOUND,
            error: {
              code: 'USER_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      const result = await otpService.verifyOTP(user.id, phone, code, type);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            error: {
              code: 'OTP_VERIFY_FAILED',
              details: {
                attemptsRemaining: result.attemptsRemaining,
              },
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'تم التحقق من الرمز بنجاح',
        data: {
          verified: true,
          userId: user.id,
          phone,
        },
      });
    }

    // التحقق من OTP للـ 2FA
    if (type === OTPType.TWO_FA) {
      const user = await db.user.findUnique({
        where: { phone },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: AUTH_ERRORS.USER_NOT_FOUND,
            error: {
              code: 'USER_NOT_FOUND',
            },
          },
          { status: 404 }
        );
      }

      const result = await otpService.verifyOTP(user.id, phone, code, type);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            error: {
              code: 'OTP_VERIFY_FAILED',
              details: {
                attemptsRemaining: result.attemptsRemaining,
              },
            },
          },
          { status: 400 }
        );
      }

      // إنشاء جلسة بعد التحقق من 2FA
      const ipAddress = getClientIP(request);
      const userAgent = getUserAgent(request);
      const { session, accessToken } = await createSession(
        user.id,
        userAgent,
        ipAddress
      );

      const { token: refreshToken } = await generateTokenPair(
        user.id,
        user.phone,
        user.userType,
        session.id
      );

      // تحديث وقت آخر تسجيل دخول
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      await setAuthCookies(accessToken, refreshToken);

      // تسجيل النشاط
      await logAudit(
        user.id,
        'LOGIN',
        'User',
        user.id,
        null,
        JSON.stringify({ loginMethod: '2fa' }),
        ipAddress,
        userAgent
      );

      return NextResponse.json({
        success: true,
        message: 'تم التحقق بنجاح',
        data: {
          user: transformUserToResponse(user),
          accessToken,
          refreshToken,
          expiresIn: 15 * 60,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'نوع OTP غير مدعوم',
        error: {
          code: 'INVALID_OTP_TYPE',
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء التحقق من الرمز',
        error: {
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
