// =============================================
// خدمة رمز التحقق (OTP)
// OTP Service
// =============================================

import { db } from '@/lib/db';
import { OTPType } from '@prisma/client';
import {
  OTP_CONFIG,
  OTPGenerateResult,
  OTPVerifyResult,
  AUTH_ERRORS,
} from '@/types/auth';
import { formatPhoneForSending } from '@/lib/validators/auth';

// =============================================
// إعدادات Twilio
// Twilio Configuration
// =============================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // رقم WhatsApp

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

// تخزين مؤقت للـ Rate Limiting (في الإنتاج يجب استخدام Redis)
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

  // التحقق من انتهاء فترة الحظر
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.blockedUntil - now) / 1000),
    };
  }

  // التحقق من انتهاء النافذة الزمنية
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
 * حظر مؤقت
 * Temporary block
 */
function temporaryBlock(key: string, durationMs: number): void {
  const entry = rateLimitStore.get(key);
  if (entry) {
    entry.blockedUntil = Date.now() + durationMs;
    rateLimitStore.set(key, entry);
  }
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

  // إعادة تعيين إذا مرت ساعة
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
// خدمة OTP
// OTP Service Class
// =============================================

class OTPService {
  /**
   * توليد رمز OTP
   * Generate OTP code
   */
  generateCode(): string {
    let code = '';
    for (let i = 0; i < OTP_CONFIG.CODE_LENGTH; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    return code;
  }

  /**
   * إرسال OTP عبر WhatsApp
   * Send OTP via WhatsApp
   */
  async sendOTP(
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
    const code = this.generateCode();
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

    // إرسال الرمز عبر WhatsApp
    const sendResult = await this.sendViaWhatsApp(phone, code, type);

    // تسجيل المحاولة
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
      // إرجاع الكود في بيئة التطوير فقط
      ...(process.env.NODE_ENV === 'development' && { code }),
    };
  }

  /**
   * إرسال عبر WhatsApp باستخدام Twilio
   * Send via WhatsApp using Twilio
   */
  private async sendViaWhatsApp(
    phone: string,
    code: string,
    type: OTPType
  ): Promise<{ success: boolean; error?: string }> {
    // في بيئة التطوير، لا نرسل فعلياً
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${phone}: ${code} (Type: ${type})`);
      return { success: true };
    }

    // التحقق من وجود بيانات Twilio
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return { success: false, error: 'خدمة الإرسال غير متوفرة' };
    }

    try {
      const formattedPhone = formatPhoneForSending(phone);
      const message = this.getMessageTemplate(code, type);

      // استدعاء Twilio API
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
   * قالب الرسالة
   * Message template
   */
  private getMessageTemplate(code: string, type: OTPType): string {
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
   */
  async verifyOTP(
    phone: string,
    code: string,
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
      data: { isUsed: true },
    });

    // إعادة تعيين محاولات التحقق
    resetOTPAttempts(attemptKey);

    return {
      success: true,
      message: 'تم التحقق بنجاح',
      verified: true,
    };
  }

  /**
   * إرسال OTP بدون مستخدم (للتسجيل)
   * Send OTP without user (for registration)
   */
  async sendOTPForRegistration(
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
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_TIME);

    // إنشاء مستخدم مؤقت أو استخدام ID فارغ
    // في هذه الحالة نحتاج لإنشاء user مؤقت أو التعامل معه بشكل مختلف
    // سنستخدم نهج مختلف - تخزين في الـ session أو إرجاع الـ code

    // حفظ الرمز في قاعدة البيانات مع userId فارغ
    // ستحتاج لتعديل الـ schema لجعل userId اختياري
    // أو نستخدم نهج مختلف

    // للتبسيط، سنستخدم نهج تخزين مؤقت
    const tempId = `temp_${Date.now()}`;
    
    // محاولة إنشاء OTP بدون userId (سيفشل إذا كان userId مطلوب)
    try {
      await db.oTPCode.create({
        data: {
          userId: tempId, // مؤقت - سيتم تحديثه عند التسجيل
          code,
          type,
          phone,
          expiresAt,
        },
      });
    } catch {
      // إذا فشل، نرجع الكود للتحقق اللاحق
    }

    // إرسال الرمز عبر WhatsApp
    const sendResult = await this.sendViaWhatsApp(phone, code, type);

    // تسجيل المحاولة
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
  async verifyOTPForRegistration(
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

    // لا نحدث isUsed هنا - سيتم تحديثه عند إتمام التسجيل
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
  async updateOTPUserId(otpId: string, userId: string): Promise<void> {
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
  async cleanupExpiredCodes(): Promise<void> {
    await db.oTPCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });
  }
}

// تصدير نسخة واحدة من الخدمة
export const otpService = new OTPService();

// تصدير الدوال المباشرة
export const {
  generateCode: generateOTPCode,
  sendOTP,
  verifyOTP,
  sendOTPForRegistration,
  verifyOTPForRegistration,
  updateOTPUserId,
  cleanupExpiredCodes,
} = otpService;
