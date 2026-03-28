// =============================================
// API تسجيل مستخدم جديد
// User Registration API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, transformUserToResponse, setAuthCookies, generateTokenPair, createSession, logAudit, getClientIP, getUserAgent } from '@/lib/auth';
import { registerSchema } from '@/lib/validators/auth';
import { UserStatus } from '@prisma/client';
import { AUTH_ERRORS } from '@/types/auth';
import { COMMISSION_RATES } from '@/lib/services/commission-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات
    const validationResult = registerSchema.safeParse(body);
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

    const data = validationResult.data;

    // التحقق من عدم وجود المستخدم مسبقاً
    const existingUser = await db.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: AUTH_ERRORS.PHONE_ALREADY_REGISTERED,
          error: {
            code: 'PHONE_EXISTS',
          },
        },
        { status: 409 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await hashPassword(data.password);

    // إنشاء المستخدم
    const user = await db.user.create({
      data: {
        phone: data.phone,
        password: hashedPassword,
        name: data.name,
        email: data.email || null,
        userType: data.userType,
        status: UserStatus.PENDING_VERIFICATION,
        isPhoneVerified: false,
        isEmailVerified: false,
        is2FAEnabled: false,
      },
    });

    // إنشاء الملف الشخصي حسب نوع المستخدم
    if (data.userType === 'BUYER') {
      await db.buyerProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (data.userType === 'MERCHANT') {
      const commissionRate = COMMISSION_RATES['FREE'];
      await db.merchantProfile.create({
        data: {
          userId: user.id,
          businessName: data.businessName,
          commercialRegNumber: data.commercialRegNumber,
          taxNumber: data.taxNumber,
          commissionRate,
        },
      });
    } else if (data.userType === 'STORE') {
      // إنشاء المتجر
      const slug = data.businessName?.toLowerCase().replace(/\s+/g, '-') || `store-${user.id}`;
      const commissionRate = COMMISSION_RATES['FREE'];
      await db.store.create({
        data: {
          userId: user.id,
          storeName: data.businessName || 'متجر جديد',
          slug,
          commissionRate,
        },
      });
    } else if (data.userType === 'ADMIN') {
      // لا يمكن إنشاء مدير عبر التسجيل العادي
      await db.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        {
          success: false,
          message: 'لا يمكن إنشاء حساب مدير عبر التسجيل',
          error: {
            code: 'INVALID_USER_TYPE',
          },
        },
        { status: 400 }
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

    // إنشاء Refresh Token
    const { token: refreshToken } = await generateTokenPair(
      user.id,
      user.phone,
      user.userType,
      session.id
    );

    // تعيين الكعكة
    await setAuthCookies(accessToken, refreshToken);

    // تسجيل النشاط
    await logAudit(
      user.id,
      'REGISTER',
      'User',
      user.id,
      null,
      JSON.stringify({ phone: user.phone, userType: user.userType }),
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من رقم الهاتف',
      data: {
        user: transformUserToResponse(user),
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إنشاء الحساب',
        error: {
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
