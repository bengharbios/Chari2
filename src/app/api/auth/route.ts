/**
 * Auth API Routes
 * Handles authentication endpoints
 */

import { NextRequest } from 'next/server';
import { sendOTPSchema, verifyOTPSchema, registerSchema, loginSchema } from '@/lib/validators';
import { createOTP, verifyOTPAndGetUser, sendOTPViaWhatsApp } from '@/lib/services';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken, toAuthUser, AuthResponses, getUserFromRequest } from '@/lib/auth';
import { hash, compare } from 'bcryptjs';
import { OTPType } from '@prisma/client';

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number
 */
export async function sendOTPHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = sendOTPSchema.parse(body);
    
    // Find or create user
    let user = await db.user.findUnique({
      where: { phone: validated.phone },
    });
    
    if (!user) {
      // Create a temporary user for OTP verification
      user = await db.user.create({
        data: {
          phone: validated.phone,
          status: 'PENDING_VERIFICATION',
        },
      });
    }
    
    // Create OTP
    const otp = await createOTP(
      user.id,
      validated.phone,
      (validated.type as OTPType) || OTPType.PHONE_VERIFICATION
    );
    
    // Send OTP via WhatsApp
    const result = await sendOTPViaWhatsApp(validated.phone, otp.code);
    
    if (!result.success) {
      return AuthResponses.error(result.error || 'فشل في إرسال رمز التحقق');
    }
    
    return Response.json({
      success: true,
      message: 'تم إرسال رمز التحقق بنجاح',
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return AuthResponses.error('حدث خطأ أثناء إرسال رمز التحقق');
  }
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP code
 */
export async function verifyOTPHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = verifyOTPSchema.parse(body);
    
    const user = await verifyOTPAndGetUser(
      validated.phone,
      validated.code,
      OTPType.PHONE_VERIFICATION
    );
    
    if (!user) {
      return AuthResponses.error('رمز التحقق غير صالح');
    }
    
    // Update user phone verification status
    await db.user.update({
      where: { id: user.id },
      data: {
        isPhoneVerified: true,
        status: 'ACTIVE',
      },
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
    
    return Response.json({
      success: true,
      user: toAuthUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return AuthResponses.error('حدث خطأ أثناء التحقق من الرمز');
  }
}

/**
 * POST /api/auth/register
 * Register new user
 */
export async function registerHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { phone: validated.phone },
    });
    
    if (existingUser) {
      return AuthResponses.error('رقم الجوال مسجل مسبقاً');
    }
    
    // Hash password
    const hashedPassword = await hash(validated.password, 12);
    
    // Create user
    const user = await db.user.create({
      data: {
        phone: validated.phone,
        name: validated.name,
        email: validated.email || null,
        password: hashedPassword,
        userType: validated.userType,
        status: 'PENDING_VERIFICATION',
      },
    });
    
    // Create profile based on user type
    if (validated.userType === 'BUYER') {
      await db.buyerProfile.create({
        data: { userId: user.id },
      });
    } else if (validated.userType === 'MERCHANT') {
      await db.merchantProfile.create({
        data: { userId: user.id },
      });
    } else if (validated.userType === 'STORE') {
      // Store profile will be created after store setup
    }
    
    // Create and send OTP
    const otp = await createOTP(user.id, validated.phone, OTPType.PHONE_VERIFICATION);
    await sendOTPViaWhatsApp(validated.phone, otp.code);
    
    return Response.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من رقم الجوال',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return AuthResponses.error('حدث خطأ أثناء إنشاء الحساب');
  }
}

/**
 * POST /api/auth/login
 * Login with password
 */
export async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);
    
    // Find user
    const user = await db.user.findUnique({
      where: { phone: validated.phone },
    });
    
    if (!user || !user.password) {
      return AuthResponses.error('رقم الجوال أو كلمة المرور غير صحيحة');
    }
    
    // Verify password
    const isValid = await compare(validated.password, user.password);
    
    if (!isValid) {
      return AuthResponses.error('رقم الجوال أو كلمة المرور غير صحيحة');
    }
    
    // Check if user is active
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return AuthResponses.error('تم تعليق حسابك. يرجى التواصل مع الدعم الفني');
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    return Response.json({
      success: true,
      user: toAuthUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return AuthResponses.error('حدث خطأ أثناء تسجيل الدخول');
  }
}

/**
 * GET /api/auth/me
 * Get current user
 */
export async function getCurrentUserHandler(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return AuthResponses.unauthorized();
  }
  
  return Response.json({
    success: true,
    user,
  });
}

/**
 * POST /api/auth/logout
 * Logout user
 */
export async function logoutHandler(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { refreshToken } = body;
    
    if (refreshToken) {
      await db.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    }
    
    return Response.json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return AuthResponses.error('حدث خطأ أثناء تسجيل الخروج');
  }
}

// Route handlers based on path
export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('action');
  
  switch (path) {
    case 'send-otp':
      return sendOTPHandler(request);
    case 'verify-otp':
      return verifyOTPHandler(request);
    case 'register':
      return registerHandler(request);
    case 'login':
      return loginHandler(request);
    case 'logout':
      return logoutHandler(request);
    default:
      return AuthResponses.error('Invalid action');
  }
}

export async function GET(request: NextRequest) {
  return getCurrentUserHandler(request);
}
