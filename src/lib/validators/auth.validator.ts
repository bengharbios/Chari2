/**
 * Authentication Validators
 * Zod schemas for authentication-related requests
 */

import { z } from 'zod';

// Phone number validation (Saudi format)
const phoneRegex = /^(\+966|0)?5\d{8}$/;

// Password validation (min 8 chars, at least one letter and one number)
const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[a-zA-Z]/, 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');

/**
 * Send OTP Schema
 */
export const sendOTPSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, 'رقم الجوال غير صالح')
    .transform((val) => {
      // Normalize to +966 format
      if (val.startsWith('0')) {
        return '+966' + val.slice(1);
      }
      if (!val.startsWith('+')) {
        return '+966' + val;
      }
      return val;
    }),
  type: z.enum(['PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET', 'TWO_FA']).optional(),
});

/**
 * Verify OTP Schema
 */
export const verifyOTPSchema = z.object({
  phone: z.string().regex(phoneRegex, 'رقم الجوال غير صالح'),
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

/**
 * Register Schema
 */
export const registerSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, 'رقم الجوال غير صالح'),
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  password: passwordSchema,
  userType: z.enum(['BUYER', 'MERCHANT', 'STORE']).default('BUYER'),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  phone: z.string().regex(phoneRegex, 'رقم الجوال غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

/**
 * Login with OTP Schema
 */
export const loginWithOTPSchema = z.object({
  phone: z.string().regex(phoneRegex, 'رقم الجوال غير صالح'),
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
});

/**
 * Refresh Token Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  phone: z.string().regex(phoneRegex, 'رقم الجوال غير صالح'),
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  avatar: z.string().url().optional().or(z.literal('')),
  language: z.enum(['ar', 'en']).optional(),
  currency: z.enum(['SAR', 'USD', 'AED']).optional(),
});

/**
 * Two-Factor Authentication Schema
 */
export const verify2FASchema = z.object({
  code: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام'),
  secret: z.string().optional(),
});

export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginWithOTPInput = z.infer<typeof loginWithOTPSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
