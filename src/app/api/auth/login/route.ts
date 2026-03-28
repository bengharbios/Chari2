/**
 * API تسجيل الدخول
 * Login API Route
 * 
 * Enhanced with retry logic for database connection resilience
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // التحقق من البيانات
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'رقم الجوال وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // تنسيق رقم الهاتف
    let formattedPhone = phone.replace(/\s/g, '');
    if (formattedPhone.startsWith('+966')) {
      formattedPhone = '0' + formattedPhone.slice(4);
    } else if (formattedPhone.startsWith('966')) {
      formattedPhone = '0' + formattedPhone.slice(3);
    }

    // البحث عن المستخدم مع retry
    const user = await withRetry(async () => {
      return db.user.findUnique({
        where: { phone: formattedPhone },
        select: {
          id: true,
          phone: true,
          password: true,
          name: true,
          email: true,
          userType: true,
          avatar: true,
          status: true,
          buyerProfile: true,
          merchantProfile: true,
          store: true,
          adminProfile: true,
        },
      });
    }, 3, 500);

    if (!user) {
      return NextResponse.json(
        { error: 'رقم الجوال أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    if (!user.password) {
      return NextResponse.json(
        { error: 'يرجى استخدام رمز التحقق لتسجيل الدخول' },
        { status: 400 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'رقم الجوال أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من حالة المستخدم
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'تم تعليق حسابك. يرجى التواصل مع الدعم' },
        { status: 403 }
      );
    }

    if (user.status === 'BANNED') {
      return NextResponse.json(
        { error: 'تم حظر حسابك' },
        { status: 403 }
      );
    }

    // إنشاء التوكنات
    const accessToken = await generateAccessToken(user.id, user.userType);
    const { token: refreshToken } = await generateRefreshToken(user.id);

    // حفظ الـ Refresh Token في قاعدة البيانات مع retry
    await withRetry(async () => {
      return db.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        },
      });
    }, 3, 500);

    // تحديث آخر تسجيل دخول مع retry
    await withRetry(async () => {
      return db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }, 3, 500);

    // إنشاء الاستجابة مع الكعكات
    const response = NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
      },
      userType: user.userType,
    });

    // تعيين الكعكات
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 دقيقة
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 يوم
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Check if it's a database connection error
    if (error?.code === 'P1001' || error?.code === 'P1002' || error?.code === 'P1008') {
      return NextResponse.json(
        { error: 'خدمة قاعدة البيانات غير متاحة مؤقتاً، يرجى المحاولة مرة أخرى' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
