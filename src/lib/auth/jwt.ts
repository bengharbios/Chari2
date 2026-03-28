// =============================================
// نظام JWT للمصادقة
// JWT Authentication System
// =============================================

import { SignJWT, jwtVerify } from 'jose';
import { hash, compare, genSalt } from 'bcryptjs';
import { UserType } from '@prisma/client';
import { TokenPayload, TOKEN_CONFIG } from '@/types/auth';

// =============================================
// مفاتيح التشفير
// Encryption Keys
// =============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production'
);

// =============================================
// دوال كلمة المرور
// Password Functions
// =============================================

/**
 * تشفير كلمة المرور
 * Hash password using bcrypt
 * @param password - كلمة المرور الأصلية
 * @returns كلمة المرور المشفرة
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(12);
  return hash(password, salt);
}

/**
 * مقارنة كلمة المرور
 * Compare password with hash
 * @param password - كلمة المرور الأصلية
 * @param hash - كلمة المرور المشفرة
 * @returns true إذا تطابقت
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return compare(password, hash);
}

// =============================================
// دوال التوكن
// Token Functions
// =============================================

/**
 * إنشاء Access Token
 * Generate Access Token
 * @param userId - معرف المستخدم
 * @param userType - نوع المستخدم
 * @returns Access Token
 */
export async function generateAccessToken(
  userId: string,
  userType: string
): Promise<string> {
  const payload = {
    userId,
    userType,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY / 1000),
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * إنشاء Access Token مع بيانات إضافية
 * Generate Access Token with extra data
 */
export async function generateAccessTokenWithSession(
  userId: string,
  phone: string,
  userType: UserType,
  sessionId: string
): Promise<string> {
  const payload: TokenPayload = {
    userId,
    phone,
    userType,
    sessionId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY / 1000),
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

/**
 * إنشاء Refresh Token
 * Generate Refresh Token
 * @param userId - معرف المستخدم
 * @param rememberMe - تذكرني (30 يوم بدلاً من 7)
 * @returns Refresh Token و Token ID
 */
export async function generateRefreshToken(
  userId: string,
  rememberMe: boolean = false
): Promise<{ token: string; tokenId: string }> {
  const tokenId = crypto.randomUUID();
  const expiryDays = rememberMe ? 30 : 7;
  const expiryTime = rememberMe
    ? TOKEN_CONFIG.REMEMBER_ME_TOKEN_EXPIRY
    : TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY;

  const payload = {
    userId,
    tokenId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (expiryTime / 1000),
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(REFRESH_SECRET);

  return { token, tokenId };
}

/**
 * التحقق من التوكن (Access أو Refresh)
 * Verify token (Access or Refresh)
 * @param token - التوكن للتحقق
 * @returns payload أو null
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    // حاول مع Refresh Secret
    try {
      const { payload } = await jwtVerify(token, REFRESH_SECRET);
      return payload as unknown as TokenPayload;
    } catch {
      return null;
    }
  }
}

/**
 * التحقق من Access Token فقط
 * Verify Access Token only
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * التحقق من Refresh Token فقط
 * Verify Refresh Token only
 */
export async function verifyRefreshToken(token: string): Promise<{
  userId: string;
  tokenId: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return {
      userId: payload.userId as string,
      tokenId: payload.tokenId as string,
    };
  } catch {
    return null;
  }
}

// =============================================
// تصدير الإعدادات
// Export Settings
// =============================================

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY, // 15 دقيقة
  REFRESH_TOKEN_EXPIRY: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY, // 7 أيام
  REMEMBER_ME_EXPIRY: TOKEN_CONFIG.REMEMBER_ME_TOKEN_EXPIRY, // 30 يوم
};
