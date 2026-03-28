// =============================================
// مزودي التحقق من المصادقة
// Authentication Validators
// =============================================

import { z } from 'zod';
import { UserType, OTPType } from '@prisma/client';

// =============================================
// أنماط التحقق المشتركة
// Common Validation Patterns
// =============================================

/**
 * التحقق من رقم الهاتف السعودي
 * Saudi phone number validation
 * 
 * الأشكال المقبولة:
 * - 05xxxxxxxx (10 أرقام تبدأ بـ 05)
 * - 9665xxxxxxxx (12 رقم تبدأ بـ 9665)
 * - +9665xxxxxxxx (13 رقم مع +)
 */
const saudiPhoneRegex = /^(\+966|966|0)?5\d{8}$/;

export const saudiPhoneSchema = z.string()
  .min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل')
  .max(13, 'رقم الهاتف يجب ألا يتجاوز 13 رقم')
  .regex(saudiPhoneRegex, 'رقم الهاتف السعودي غير صحيح')
  .transform(phone => {
    // توحيد صيغة الرقم
    let normalized = phone.replace(/\s|-/g, '');
    if (normalized.startsWith('+966')) {
      normalized = '0' + normalized.slice(4);
    } else if (normalized.startsWith('966')) {
      normalized = '0' + normalized.slice(3);
    }
    return normalized;
  });

/**
 * التحقق من كلمة المرور
 * Password validation
 * 
 * المتطلبات:
 * - 8 أحرف على الأقل
 * - حرف كبير واحد على الأقل
 * - حرف صغير واحد على الأقل
 * - رقم واحد على الأقل
 * - رمز خاص واحد على الأقل
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]{8,}$/;

export const passwordSchema = z.string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
  .regex(/\d/, 'كلمة المرور يجب أن تحتوي على رقم')
  .regex(/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]/, 'كلمة المرور يجب أن تحتوي على رمز خاص');

/**
 * تحقق من البريد الإلكتروني (اختياري)
 * Email validation (optional)
 */
export const emailSchema = z.string()
  .email('البريد الإلكتروني غير صحيح')
  .optional()
  .or(z.literal(''));

/**
 * التحقق من الاسم
 * Name validation
 */
export const nameSchema = z.string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(100, 'الاسم يجب ألا يتجاوز 100 حرف')
  .optional();

/**
 * التحقق من رقم السجل التجاري
 * Commercial registration number validation
 */
export const commercialRegSchema = z.string()
  .length(10, 'رقم السجل التجاري يجب أن يكون 10 أرقام')
  .regex(/^\d{10}$/, 'رقم السجل التجاري يجب أن يحتوي على أرقام فقط')
  .optional();

/**
 * التحقق من الرقم الضريبي
 * Tax number validation
 */
export const taxNumberSchema = z.string()
  .length(15, 'الرقم الضريبي يجب أن يكون 15 رقم')
  .regex(/^\d{15}$/, 'الرقم الضريبي يجب أن يحتوي على أرقام فقط')
  .optional();

// =============================================
// أنماط التحقق للطلبات
// Request Validation Schemas
// =============================================

/**
 * مخطط التسجيل
 * Registration schema
 */
export const registerSchema = z.object({
  phone: saudiPhoneSchema,
  password: passwordSchema,
  name: nameSchema,
  email: emailSchema,
  userType: z.nativeEnum(UserType, {
    errorMap: () => ({ message: 'نوع المستخدم غير صحيح' })
  }),
  // حقول إضافية للتجار
  businessName: z.string().max(200).optional(),
  commercialRegNumber: commercialRegSchema,
  taxNumber: taxNumberSchema,
}).superRefine((data, ctx) => {
  // التحقق من الحقول المطلوبة للتجار والمتاجر
  if (data.userType === 'MERCHANT' || data.userType === 'STORE') {
    if (!data.businessName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'اسم النشاط التجاري مطلوب',
        path: ['businessName']
      });
    }
  }
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * مخطط تسجيل الدخول
 * Login schema
 */
export const loginSchema = z.object({
  phone: saudiPhoneSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * مخطط إرسال OTP
 * Send OTP schema
 */
export const sendOTPSchema = z.object({
  phone: saudiPhoneSchema,
  type: z.nativeEnum(OTPType, {
    errorMap: () => ({ message: 'نوع رمز التحقق غير صحيح' })
  }),
});

export type SendOTPInput = z.infer<typeof sendOTPSchema>;

/**
 * مخطط التحقق من OTP
 * Verify OTP schema
 */
export const verifyOTPSchema = z.object({
  phone: saudiPhoneSchema,
  code: z.string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
  type: z.nativeEnum(OTPType, {
    errorMap: () => ({ message: 'نوع رمز التحقق غير صحيح' })
  }),
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

/**
 * مخطط تحديث التوكن
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'رمز التحديث مطلوب'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

/**
 * مخطط تسجيل الخروج
 * Logout schema
 */
export const logoutSchema = z.object({
  allSessions: z.boolean().optional().default(false),
});

export type LogoutInput = z.infer<typeof logoutSchema>;

/**
 * مخطط تحديث الملف الشخصي
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  avatar: z.string().url('رابط الصورة غير صحيح').optional(),
  language: z.enum(['ar', 'en'], {
    errorMap: () => ({ message: 'اللغة يجب أن تكون العربية أو الإنجليزية' })
  }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * مخطط تغيير كلمة المرور
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'كلمة المرور الجديدة غير متطابقة',
      path: ['confirmPassword']
    });
  }
  if (data.currentPassword === data.newPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية',
      path: ['newPassword']
    });
  }
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * مخطط إعادة تعيين كلمة المرور
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  phone: saudiPhoneSchema,
  code: z.string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'كلمة المرور الجديدة غير متطابقة',
      path: ['confirmPassword']
    });
  }
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * مخطط تفعيل/إلغاء 2FA
 * Toggle 2FA schema
 */
export const toggle2FASchema = z.object({
  enable: z.boolean(),
  code: z.string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط')
    .optional(),
});

export type Toggle2FAInput = z.infer<typeof toggle2FASchema>;

// =============================================
// دوال التحقق المساعدة
// Helper Validation Functions
// =============================================

/**
 * التحقق من قوة كلمة المرور
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]/.test(password)) score++;

  // التحقق من المتطلبات وإضافة ملاحظات
  if (password.length < 8) feedback.push('أضف المزيد من الأحرف (8 على الأقل)');
  if (!/[a-z]/.test(password)) feedback.push('أضف حرف صغير');
  if (!/[A-Z]/.test(password)) feedback.push('أضف حرف كبير');
  if (!/\d/.test(password)) feedback.push('أضف رقم');
  if (!/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]/.test(password)) feedback.push('أضف رمز خاص');

  return {
    score: Math.min(score, 4),
    feedback,
    isStrong: score >= 4
  };
}

/**
 * تنسيق رقم الهاتف للعرض
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  // افتراض أن الرقم بصيغة 05xxxxxxxx
  if (phone.length === 10 && phone.startsWith('05')) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  }
  return phone;
}

/**
 * تنسيق رقم الهاتف للإرسال
 * Format phone number for sending
 */
export function formatPhoneForSending(phone: string): string {
  // تحويل إلى صيغة دولية +966
  if (phone.startsWith('0')) {
    return '+966' + phone.slice(1);
  }
  return phone.startsWith('+') ? phone : '+' + phone;
}

/**
 * التحقق من صحة رقم السجل التجاري السعودي
 * Validate Saudi commercial registration number
 */
export function validateCommercialReg(number: string): boolean {
  if (!/^\d{10}$/.test(number)) return false;
  
  // خوارزمية التحقق من الرقم السعودي
  const digits = number.split('').map(Number);
  const sum = digits.reduce((acc, digit, index) => {
    const weight = index % 2 === 0 ? 2 : 1;
    const product = digit * weight;
    return acc + (product > 9 ? product - 9 : product);
  }, 0);
  
  return sum % 10 === 0;
}

/**
 * التحقق من صحة الرقم الضريبي السعودي
 * Validate Saudi tax number (VAT)
 */
export function validateTaxNumber(number: string): boolean {
  if (!/^\d{15}$/.test(number)) return false;
  
  // الرقم الضريبي السعودي يبدأ بـ 3
  return number.startsWith('3');
}
