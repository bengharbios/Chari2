// =============================================
// نظام OTP للتحقق
// OTP Verification System
// =============================================

import { db } from '@/lib/db';
import { OTPType } from '@prisma/client';
import { OTP_CONFIG, OTPGenerateResult, OTPVerifyResult, AUTH_ERRORS } from '@/types/auth';
import { formatPhoneForSending } from '@/lib/validators/auth';

// =============================================
// إعدادات Twilio (اختياري)
// Twilio Configuration (optional)
// =============================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// =============================================
// واجهات Rate Limiting
// Rate Limiting Interfaces
// =============================================

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

interface OTPAttemptEntry {
  attempts: number;
  lastAttempt: number;
}

// تخزين مؤقت للـ Rate Limiting
const rateLimitStore = new Map<string, RateLimitEntry>();
const otpAttemptStore = new Map<string, OTPAttemptEntry>();

// =============================================
// دوال Rate Limiting
// Rate Limiting Functions
// =============================================

/**
 * التحقق من Rate Limit
 * Check rate limit
 */
function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return { allowed: true, remaining: OTP_CONFIG.MAX_REQUESTS_PER_WINDOW, resetIn: 0 };
  }

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  if (now - entry.firstAttempt > OTP_CONFIG.RATE_LIMIT_WINDOW) {
    rateLimitStore.delete(key);
    return { allowed: true, remaining: OTP_CONFIG.MAX_REQUESTS_PER_WINDOW, resetIn: 0 };
  }

  const remaining = OTP_CONFIG.MAX_REQUESTS_PER_WINDOW - entry.count;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resetIn: Math.ceil((OTP_CONFIG.RATE_LIMIT_WINDOW - (now - entry.firstAttempt)) / 1000),
  };
}

/**
 * تسجيل محاولة جديدة
 * Record new attempt
 */
function recordRateLimitAttempt(key: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstAttempt > OTP_CONFIG.RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { count: 1, firstAttempt: now });
    return;
  }

  entry.count++;
  rateLimitStore.set(key, entry);
}

/**
 * التحقق من محاولات OTP
 * Check OTP attempts
 */
function checkOTPAttempts(key: string): {
  attempts: number;
  remaining: number;
} {
  const entry = otpAttemptStore.get(key);

  if (!entry) {
    return { attempts: 0, remaining: OTP_CONFIG.MAX_ATTEMPTS };
  }

  if (Date.now() - entry.lastAttempt > 60 * 60 * 1000) {
    otpAttemptStore.delete(key);
    return { attempts: 0, remaining: OTP_CONFIG.MAX_ATTEMPTS };
  }

  return {
    attempts: entry.attempts,
    remaining: Math.max(0, OTP_CONFIG.MAX_ATTEMPTS - entry.attempts),
  };
}

/**
 * تسجيل محاولة تحقق OTP
 * Record OTP verification attempt
 */
function recordOTPAttempt(key: string): void {
  const now = Date.now();
  const entry = otpAttemptStore.get(key);

  if (!entry || now - entry.lastAttempt > 60 * 60 * 1000) {
    otpAttemptStore.set(key, { attempts: 1, lastAttempt: now });
    return;
  }

  entry.attempts++;
  entry.lastAttempt = now;
  otpAttemptStore.set(key, entry);
}

/**
 * إعادة تعيين محاولات OTP
 * Reset OTP attempts
 */
function resetOTPAttempts(key: string): void {
  otpAttemptStore.delete(key);
}

// =============================================
// دوال OTP الأساسية
// Core OTP Functions
// =============================================

/**
 * توليد رمز OTP عشوائي (6 أرقام)
 * Generate random 6-digit OTP code
 * @returns رمز OTP مكون من 6 أرقام
 */
export function generateOTP(): string {
  let code = '';
  for (let i = 0; i < OTP_CONFIG.CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

/**
 * إرسال رمز OTP عبر WhatsApp أو SMS
 * Send OTP via WhatsApp or SMS
 * @param phone - رقم الهاتف
 * @param code - رمز OTP
 * @param type - نوع OTP
 */
export async function sendOTP(
  phone: string,
  code: string,
  type: OTPType = OTPType.PHONE_VERIFICATION
): Promise<{ success: boolean; error?: string }> {
  // في بيئة التطوير، لا نرسل فعلياً
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${code} (Type: ${type})`);
    return { success: true };
  }

  // التحقق من وجود بيانات Twilio
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`[NO_TWILIO] OTP for ${phone}: ${code} (Type: ${type})`);
    return { success: true };
  }

  try {
    const formattedPhone = formatPhoneForSending(phone);
    const message = getMessageTemplate(code, type);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${TWILIO_PHONE_NUMBER}`,
          To: `whatsapp:${formattedPhone}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Twilio error:', error);
      return { success: false, error: 'فشل في إرسال الرسالة' };
    }

    return { success: true };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error: 'خطأ في الاتصال بخدمة الإرسال' };
  }
}

/**
 * قالب الرسالة حسب نوع OTP
 * Message template by OTP type
 */
function getMessageTemplate(code: string, type: OTPType): string {
  const messages: Record<OTPType, string> = {
    PHONE_VERIFICATION: `رمز التحقق الخاص بك: ${code}

صلاحية الرمز: 5 دقائق

إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`,
    LOGIN: `رمز تسجيل الدخول: ${code}

صلاحية الرمز: 5 دقائق

إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`,
    PASSWORD_RESET: `رمز استعادة كلمة المرور: ${code}

صلاحية الرمز: 5 دقائق

إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`,
    TWO_FA: `رمز التحقق بخطوتين: ${code}

صلاحية الرمز: 5 دقائق

إذا لم تطلب هذا الرمز، يرجى تغيير كلمة المرور فوراً.`,
  };

  return messages[type];
}

/**
 * التحقق من رمز OTP
 * Verify OTP code
 * @param userId - معرف المستخدم
 * @param code - رمز OTP
 * @param phone - رقم الهاتف
 * @param type - نوع OTP
 */
export async function verifyOTP(
  userId: string,
  code: string,
  phone: string,
  type: OTPType
): Promise<OTPVerifyResult> {
  const attemptKey = `verify_${phone}_${type}`;
  const attemptResult = checkOTPAttempts(attemptKey);

  if (attemptResult.remaining <= 0) {
    return {
      success: false,
      message: AUTH_ERRORS.OTP_MAX_ATTEMPTS,
      verified: false,
      attemptsRemaining: 0,
    };
  }

  // البحث عن الرمز
  const otpRecord = await db.oTPCode.findFirst({
    where: {
      phone,
      type,
      code,
      isUsed: false,
    },
  });

  if (!otpRecord) {
    recordOTPAttempt(attemptKey);
    return {
      success: false,
      message: AUTH_ERRORS.OTP_INVALID,
      verified: false,
      attemptsRemaining: attemptResult.remaining - 1,
    };
  }

  // التحقق من انتهاء الصلاحية
  if (otpRecord.expiresAt < new Date()) {
    await db.oTPCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    return {
      success: false,
      message: AUTH_ERRORS.OTP_EXPIRED,
      verified: false,
      attemptsRemaining: attemptResult.remaining,
    };
  }

  // تحديث الرمز كمستخدم
  await db.oTPCode.update({
    where: { id: otpRecord.id },
    data: { isUsed: true, userId },
  });

  resetOTPAttempts(attemptKey);

  return {
    success: true,
    message: 'تم التحقق بنجاح',
    verified: true,
  };
}

// =============================================
// خدمة OTP الشاملة
// Complete OTP Service
// =============================================

/**
 * إرسال OTP للمستخدم الموجود
 * Send OTP for existing user
 */
export async function sendOTPForUser(
  userId: string,
  phone: string,
  type: OTPType
): Promise<OTPGenerateResult> {
  const rateLimitKey = `otp_${phone}_${type}`;
  const rateLimitResult = checkRateLimit(rateLimitKey);

  if (!rateLimitResult.allowed) {
    return {
      success: false,
      message: AUTH_ERRORS.TOO_MANY_REQUESTS,
      attemptsRemaining: 0,
    };
  }

  // التحقق من cooldown للإرسال
  const lastOTP = await db.oTPCode.findFirst({
    where: {
      phone,
      type,
      createdAt: {
        gte: new Date(Date.now() - OTP_CONFIG.RESEND_COOLDOWN),
      },
    },
  });

  if (lastOTP) {
    const waitTime = Math.ceil(
      (OTP_CONFIG.RESEND_COOLDOWN - (Date.now() - lastOTP.createdAt.getTime())) / 1000
    );
    return {
      success: false,
      message: `يرجى الانتظار ${waitTime} ثانية قبل طلب رمز جديد`,
      expiresIn: waitTime,
      attemptsRemaining: rateLimitResult.remaining,
    };
  }

  // إبطال الرموز السابقة غير المستخدمة
  await db.oTPCode.updateMany({
    where: {
      phone,
      type,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  // توليد رمز جديد
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_TIME);

  // حفظ الرمز في قاعدة البيانات
  await db.oTPCode.create({
    data: {
      userId,
      code,
      type,
      phone,
      expiresAt,
    },
  });

  // إرسال الرمز
  const sendResult = await sendOTP(phone, code, type);

  recordRateLimitAttempt(rateLimitKey);

  if (!sendResult.success) {
    return {
      success: false,
      message: sendResult.error || 'فشل في إرسال الرمز',
      attemptsRemaining: rateLimitResult.remaining - 1,
    };
  }

  return {
    success: true,
    message: 'تم إرسال رمز التحقق بنجاح',
    expiresIn: OTP_CONFIG.EXPIRY_TIME / 1000,
    attemptsRemaining: rateLimitResult.remaining - 1,
    ...(process.env.NODE_ENV === 'development' && { code }),
  };
}

/**
 * إرسال OTP للتسجيل (مستخدم جديد)
 * Send OTP for registration (new user)
 */
export async function sendOTPForRegistration(
  phone: string,
  type: OTPType = OTPType.PHONE_VERIFICATION
): Promise<OTPGenerateResult> {
  const rateLimitKey = `otp_${phone}_${type}`;
  const rateLimitResult = checkRateLimit(rateLimitKey);

  if (!rateLimitResult.allowed) {
    return {
      success: false,
      message: AUTH_ERRORS.TOO_MANY_REQUESTS,
      attemptsRemaining: 0,
    };
  }

  // التحقق من cooldown للإرسال
  const lastOTP = await db.oTPCode.findFirst({
    where: {
      phone,
      type,
      createdAt: {
        gte: new Date(Date.now() - OTP_CONFIG.RESEND_COOLDOWN),
      },
    },
  });

  if (lastOTP) {
    const waitTime = Math.ceil(
      (OTP_CONFIG.RESEND_COOLDOWN - (Date.now() - lastOTP.createdAt.getTime())) / 1000
    );
    return {
      success: false,
      message: `يرجى الانتظار ${waitTime} ثانية قبل طلب رمز جديد`,
      expiresIn: waitTime,
      attemptsRemaining: rateLimitResult.remaining,
    };
  }

  // إبطال الرموز السابقة غير المستخدمة
  await db.oTPCode.updateMany({
    where: {
      phone,
      type,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  // توليد رمز جديد
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_TIME);

  // حفظ الرمز مع userId مؤقت
  const tempId = `temp_${Date.now()}`;

  await db.oTPCode.create({
    data: {
      userId: tempId,
      code,
      type,
      phone,
      expiresAt,
    },
  });

  // إرسال الرمز
  const sendResult = await sendOTP(phone, code, type);

  recordRateLimitAttempt(rateLimitKey);

  if (!sendResult.success) {
    return {
      success: false,
      message: sendResult.error || 'فشل في إرسال الرمز',
      attemptsRemaining: rateLimitResult.remaining - 1,
    };
  }

  return {
    success: true,
    message: 'تم إرسال رمز التحقق بنجاح',
    expiresIn: OTP_CONFIG.EXPIRY_TIME / 1000,
    attemptsRemaining: rateLimitResult.remaining - 1,
    ...(process.env.NODE_ENV === 'development' && { code }),
  };
}

/**
 * التحقق من OTP للتسجيل
 * Verify OTP for registration
 */
export async function verifyOTPForRegistration(
  phone: string,
  code: string,
  type: OTPType = OTPType.PHONE_VERIFICATION
): Promise<OTPVerifyResult & { otpId?: string }> {
  const attemptKey = `verify_${phone}_${type}`;
  const attemptResult = checkOTPAttempts(attemptKey);

  if (attemptResult.remaining <= 0) {
    return {
      success: false,
      message: AUTH_ERRORS.OTP_MAX_ATTEMPTS,
      verified: false,
      attemptsRemaining: 0,
    };
  }

  const otpRecord = await db.oTPCode.findFirst({
    where: {
      phone,
      type,
      code,
      isUsed: false,
    },
  });

  if (!otpRecord) {
    recordOTPAttempt(attemptKey);
    return {
      success: false,
      message: AUTH_ERRORS.OTP_INVALID,
      verified: false,
      attemptsRemaining: attemptResult.remaining - 1,
    };
  }

  if (otpRecord.expiresAt < new Date()) {
    await db.oTPCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });
    return {
      success: false,
      message: AUTH_ERRORS.OTP_EXPIRED,
      verified: false,
      attemptsRemaining: attemptResult.remaining,
    };
  }

  resetOTPAttempts(attemptKey);

  return {
    success: true,
    message: 'تم التحقق بنجاح',
    verified: true,
    otpId: otpRecord.id,
  };
}

/**
 * تحديث OTP userId بعد التسجيل
 * Update OTP userId after registration
 */
export async function updateOTPUserId(otpId: string, userId: string): Promise<void> {
  await db.oTPCode.update({
    where: { id: otpId },
    data: {
      userId,
      isUsed: true,
    },
  });
}

/**
 * حذف الرموز المنتهية
 * Delete expired codes
 */
export async function cleanupExpiredCodes(): Promise<void> {
  await db.oTPCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isUsed: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });
}

// =============================================
// تصدير الإعدادات
// Export Settings
// =============================================

export const OTP_SETTINGS = {
  CODE_LENGTH: OTP_CONFIG.CODE_LENGTH, // 6 أرقام
  EXPIRY_TIME: OTP_CONFIG.EXPIRY_TIME, // 5 دقائق
  MAX_ATTEMPTS: OTP_CONFIG.MAX_ATTEMPTS, // 5 محاولات
  RESEND_COOLDOWN: OTP_CONFIG.RESEND_COOLDOWN, // 60 ثانية
};
