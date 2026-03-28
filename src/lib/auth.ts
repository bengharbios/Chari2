// =============================================
// نظام المصادقة والأمان
// Authentication & Security System
// =============================================

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { 
  User, 
  Session, 
  RefreshToken,
  UserType,
  UserStatus,
  OTPType 
} from '@prisma/client';
import { 
  SignJWT, 
  jwtVerify, 
  JWTPayload 
} from 'jose';
import { 
  hash, 
  compare, 
  genSalt 
} from 'bcryptjs';
import { 
  v4 as uuidv4 
} from 'uuid';
import {
  UserResponse,
  TokenPayload,
  TokenPair,
  TOKEN_CONFIG,
  AUTH_ERRORS,
} from '@/types/auth';

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
// إعدادات الكعكة
// Cookie Settings
// =============================================

const COOKIE_CONFIG = {
  accessToken: {
    name: 'access_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 15 * 60, // 15 دقيقة
    },
  },
  refreshToken: {
    name: 'refresh_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 أيام
    },
  },
};

// =============================================
// دوال كلمة المرور
// Password Functions
// =============================================

/**
 * تشفير كلمة المرور
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await genSalt(12);
  return hash(password, salt);
}

/**
 * التحقق من كلمة المرور
 * Verify password
 */
export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// =============================================
// دوال التوكن
// Token Functions
// =============================================

/**
 * إنشاء Access Token
 * Generate Access Token
 */
export async function generateAccessToken(
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
 */
export async function generateRefreshToken(
  userId: string,
  rememberMe: boolean = false
): Promise<{ token: string; tokenId: string }> {
  const tokenId = uuidv4();
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
 * إنشاء زوج من التوكنات
 * Generate token pair
 */
export async function generateTokenPair(
  userId: string,
  phone: string,
  userType: UserType,
  sessionId: string,
  rememberMe: boolean = false
): Promise<TokenPair> {
  const accessToken = await generateAccessToken(userId, phone, userType, sessionId);
  const { token: refreshToken } = await generateRefreshToken(userId, rememberMe);

  return {
    accessToken,
    refreshToken,
    expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY,
  };
}

/**
 * التحقق من Access Token
 * Verify Access Token
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
 * التحقق من Refresh Token
 * Verify Refresh Token
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
// دوال الجلسة
// Session Functions
// =============================================

/**
 * إنشاء جلسة جديدة
 * Create new session
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string,
  rememberMe: boolean = false
): Promise<{ session: Session; accessToken: string }> {
  const sessionToken = uuidv4();
  const expiryDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  const session = await db.session.create({
    data: {
      userId,
      token: sessionToken,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  // إنشاء Access Token
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { phone: true, userType: true },
  });

  if (!user) {
    throw new Error(AUTH_ERRORS.USER_NOT_FOUND);
  }

  const accessToken = await generateAccessToken(
    userId,
    user.phone,
    user.userType,
    session.id
  );

  return { session, accessToken };
}

/**
 * التحقق من الجلسة
 * Verify session
 */
export async function verifySession(sessionId: string): Promise<Session | null> {
  const session = await db.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
}

/**
 * حذف جلسة
 * Delete session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await db.session.deleteMany({
    where: { id: sessionId },
  });
}

/**
 * حذف جميع جلسات المستخدم
 * Delete all user sessions
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({
    where: { userId },
  });
}

// =============================================
// دوال Refresh Token
// Refresh Token Functions
// =============================================

/**
 * حفظ Refresh Token في قاعدة البيانات
 * Save refresh token to database
 */
export async function saveRefreshToken(
  userId: string,
  token: string,
  tokenId: string,
  rememberMe: boolean = false
): Promise<void> {
  const expiryDays = rememberMe ? 30 : 7;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  await db.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
}

/**
 * التحقق من Refresh Token في قاعدة البيانات
 * Verify refresh token in database
 */
export async function verifyRefreshTokenInDB(token: string): Promise<RefreshToken | null> {
  const storedToken = await db.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken) return null;
  if (storedToken.isRevoked) return null;
  if (storedToken.expiresAt < new Date()) {
    await db.refreshToken.delete({ where: { id: storedToken.id } });
    return null;
  }

  return storedToken;
}

/**
 * إلغاء Refresh Token
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { token },
    data: { isRevoked: true },
  });
}

/**
 * إلغاء جميع Refresh Tokens للمستخدم
 * Revoke all user refresh tokens
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
}

// =============================================
// دوال الكعكة
// Cookie Functions
// =============================================

/**
 * تعيين توكنات المصادقة في الكعكة
 * Set auth tokens in cookies
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(
    COOKIE_CONFIG.accessToken.name,
    accessToken,
    {
      ...COOKIE_CONFIG.accessToken.options,
      maxAge: 15 * 60,
    }
  );

  const refreshExpiry = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  cookieStore.set(
    COOKIE_CONFIG.refreshToken.name,
    refreshToken,
    {
      ...COOKIE_CONFIG.refreshToken.options,
      maxAge: refreshExpiry,
    }
  );
}

/**
 * الحصول على توكنات المصادقة من الكعكة
 * Get auth tokens from cookies
 */
export async function getAuthCookies(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const cookieStore = await cookies();
  
  return {
    accessToken: cookieStore.get(COOKIE_CONFIG.accessToken.name)?.value || null,
    refreshToken: cookieStore.get(COOKIE_CONFIG.refreshToken.name)?.value || null,
  };
}

/**
 * حذف توكنات المصادقة من الكعكة
 * Clear auth tokens from cookies
 */
export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(COOKIE_CONFIG.accessToken.name);
  cookieStore.delete(COOKIE_CONFIG.refreshToken.name);
}

// =============================================
// دوال المستخدم
// User Functions
// =============================================

/**
 * تحويل المستخدم إلى استجابة
 * Transform user to response
 */
export function transformUserToResponse(user: User): UserResponse {
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    userType: user.userType,
    status: user.status,
    language: user.language,
    currency: user.currency,
    isPhoneVerified: user.isPhoneVerified,
    isEmailVerified: user.isEmailVerified,
    is2FAEnabled: user.is2FAEnabled,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

/**
 * الحصول على المستخدم الحالي
 * Get current user
 */
export async function getCurrentUser(): Promise<UserResponse | null> {
  const { accessToken } = await getAuthCookies();
  
  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  const session = await verifySession(payload.sessionId);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return null;

  return transformUserToResponse(user);
}

/**
 * التحقق من المصادقة
 * Check authentication
 */
export async function checkAuth(): Promise<{
  isAuthenticated: boolean;
  user: UserResponse | null;
  sessionId: string | null;
}> {
  const { accessToken } = await getAuthCookies();
  
  if (!accessToken) {
    return { isAuthenticated: false, user: null, sessionId: null };
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return { isAuthenticated: false, user: null, sessionId: null };
  }

  const session = await verifySession(payload.sessionId);
  if (!session) {
    return { isAuthenticated: false, user: null, sessionId: null };
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return { isAuthenticated: false, user: null, sessionId: null };
  }

  // التحقق من حالة المستخدم
  if (user.status === UserStatus.SUSPENDED) {
    return { isAuthenticated: false, user: null, sessionId: null };
  }

  if (user.status === UserStatus.BANNED) {
    return { isAuthenticated: false, user: null, sessionId: null };
  }

  return {
    isAuthenticated: true,
    user: transformUserToResponse(user),
    sessionId: session.id,
  };
}

// =============================================
// دوال 2FA
// 2FA Functions
// =============================================

/**
 * توليد سر 2FA
 * Generate 2FA secret
 */
export function generate2FASecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 20; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * توليد رموز النسخ الاحتياطي
 * Generate backup codes
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
    codes.push(code);
  }
  return codes;
}

// =============================================
// دوال سجل التدقيق
// Audit Log Functions
// =============================================

/**
 * تسجيل نشاط في سجل التدقيق
 * Log activity in audit log
 */
export async function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string,
  oldValue?: string,
  newValue?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await db.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    },
  });
}

// =============================================
// دوال مساعدة
// Helper Functions
// =============================================

/**
 * الحصول على عنوان IP
 * Get IP address
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * الحصول على User Agent
 * Get User Agent
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * التحقق من حالة المستخدم
 * Check user status
 */
export function checkUserStatus(user: User): {
  valid: boolean;
  error?: string;
} {
  switch (user.status) {
    case UserStatus.SUSPENDED:
      return { valid: false, error: AUTH_ERRORS.ACCOUNT_SUSPENDED };
    case UserStatus.BANNED:
      return { valid: false, error: AUTH_ERRORS.ACCOUNT_BANNED };
    case UserStatus.PENDING_VERIFICATION:
      return { valid: false, error: AUTH_ERRORS.PHONE_NOT_VERIFIED };
    case UserStatus.ACTIVE:
      return { valid: true };
    default:
      return { valid: false, error: AUTH_ERRORS.UNAUTHORIZED };
  }
}

// =============================================
// تصدير الإعدادات
// Export Config
// =============================================

export { COOKIE_CONFIG };

// =============================================
// دوال API Helper
// API Helper Functions
// =============================================

/**
 * الحصول على المستخدم من الطلب
 * Get user from request
 */
export async function getUserFromRequest(request: Request): Promise<UserResponse | null> {
  const { accessToken } = await getAuthCookies();
  
  if (!accessToken) return null;

  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;

  const session = await verifySession(payload.sessionId);
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return null;

  return transformUserToResponse(user);
}

/**
 * التحقق من أن المستخدم نشط
 * Check if user is active
 */
export function isActiveUser(user: UserResponse): boolean {
  return user.status === 'ACTIVE';
}

/**
 * التحقق من صلاحيات المستخدم
 * Check user roles
 */
export function hasRole(user: UserResponse, roles: string[]): boolean {
  return roles.includes(user.userType);
}

/**
 * استجابات API للمصادقة
 * Auth API responses
 */
export const AuthResponses = {
  success: <T>(data: T, message?: string) => 
    Response.json({ success: true, data, message }),
  
  error: (message: string, status: number = 400) => 
    Response.json({ success: false, message }, { status }),
  
  unauthorized: () => 
    Response.json({ success: false, message: 'يجب تسجيل الدخول أولاً' }, { status: 401 }),
  
  forbidden: (message: string = 'ليس لديك صلاحية للوصول') => 
    Response.json({ success: false, message }, { status: 403 }),
  
  notFound: (message: string = 'العنصر غير موجود') => 
    Response.json({ success: false, message }, { status: 404 }),
  
  badRequest: (message: string, errors?: unknown) => 
    Response.json({ success: false, message, errors }, { status: 400 }),
  
  created: <T>(data: T, message?: string) => 
    Response.json({ success: true, data, message }, { status: 201 }),
};
