// =============================================
// API إرسال رمز التحقق
// Send OTP API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otpService } from '@/lib/services/otp-service';
import { sendOTPSchema } from '@/lib/validators/auth';
import { OTPType } from '@prisma/client';
import { AUTH_ERRORS } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات
    const validationResult = sendOTPSchema.safeParse(body);
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

    const { phone, type } = validationResult.data;

    // التحقق من وجود المستخدم للأنواع التي تتطلب مستخدم
    if (type === OTPType.LOGIN || type === OTPType.PASSWORD_RESET || type === OTPType.TWO_FA) {
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

      // إرسال OTP للمستخدم الموجود
      const result = await otpService.sendOTP(user.id, phone, type);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: result.success
          ? {
              expiresIn: result.expiresIn,
              attemptsRemaining: result.attemptsRemaining,
              // إرجاع الكود في بيئة التطوير
              ...(process.env.NODE_ENV === 'development' && { code: result.code }),
            }
          : undefined,
        error: !result.success
          ? {
              code: 'OTP_SEND_FAILED',
            }
          : undefined,
      }, { status: result.success ? 200 : 429 });
    }

    // إرسال OTP للتسجيل (مستخدم جديد)
    if (type === OTPType.PHONE_VERIFICATION) {
      const result = await otpService.sendOTPForRegistration(phone, type);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        data: result.success
          ? {
              expiresIn: result.expiresIn,
              attemptsRemaining: result.attemptsRemaining,
              // إرجاع الكود في بيئة التطوير
              ...(process.env.NODE_ENV === 'development' && { code: result.code }),
            }
          : undefined,
        error: !result.success
          ? {
              code: 'OTP_SEND_FAILED',
            }
          : undefined,
      }, { status: result.success ? 200 : 429 });
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
    console.error('Send OTP error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إرسال رمز التحقق',
        error: {
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
