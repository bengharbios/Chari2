// =============================================
// أنواع المصادقة والأمان
// Authentication & Security Types
// =============================================

import { UserType, UserStatus, OTPType, PlanType } from '@prisma/client';

// =============================================
// أنواع المستخدم
// User Types
// =============================================

export interface UserResponse {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  userType: UserType;
  status: UserStatus;
  language: string;
  currency: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface UserWithProfile extends UserResponse {
  buyerProfile?: BuyerProfileResponse | null;
  merchantProfile?: MerchantProfileResponse | null;
  store?: StoreResponse | null;
  adminProfile?: AdminProfileResponse | null;
}

export interface BuyerProfileResponse {
  id: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  defaultAddressId: string | null;
}

export interface MerchantProfileResponse {
  id: string;
  businessName: string | null;
  commercialRegNumber: string | null;
  taxNumber: string | null;
  verificationStatus: string;
  subscriptionPlan: PlanType;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  rating: number;
  totalReviews: number;
}

export interface StoreResponse {
  id: string;
  storeName: string;
  slug: string;
  logo: string | null;
  verificationStatus: string;
  subscriptionPlan: PlanType;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  rating: number;
  totalReviews: number;
}

export interface AdminProfileResponse {
  id: string;
  role: string;
  permissions: string[];
  department: string | null;
}

// =============================================
// أنواع التوكن
// Token Types
// =============================================

export interface TokenPayload {
  userId: string;
  phone: string;
  userType: UserType;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface AccessTokenPayload extends TokenPayload {
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenResponse {
  success: boolean;
  message: string;
  data?: TokenPair & {
    user: UserResponse;
  };
}

// =============================================
// أنواع OTP
// OTP Types
// =============================================

export interface OTPGenerateResult {
  success: boolean;
  message: string;
  code?: string; // Only for development
  expiresIn?: number;
  attemptsRemaining?: number;
}

export interface OTPVerifyResult {
  success: boolean;
  message: string;
  verified?: boolean;
  attemptsRemaining?: number;
}

export interface OTPData {
  id: string;
  userId: string;
  code: string;
  type: OTPType;
  phone: string;
  expiresAt: Date;
  isUsed: boolean;
}

// =============================================
// أنواع الجلسة
// Session Types
// =============================================

export interface SessionData {
  id: string;
  userId: string;
  token: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface SessionResponse {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

// =============================================
// أنواع طلبات المصادقة
// Auth Request Types
// =============================================

export interface RegisterRequest {
  phone: string;
  password: string;
  name?: string;
  email?: string;
  userType: UserType;
  // للتجار والمتاجر
  businessName?: string;
  commercialRegNumber?: string;
  taxNumber?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
  rememberMe?: boolean;
}

export interface OTPSendRequest {
  phone: string;
  type: OTPType;
}

export interface OTPVerifyRequest {
  phone: string;
  code: string;
  type: OTPType;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  allSessions?: boolean;
}

// =============================================
// أنواع استجابة المصادقة
// Auth Response Types
// =============================================

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserResponse;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    expiresIn: number;
    attemptsRemaining: number;
  };
  error?: {
    code: string;
    details?: Record<string, unknown>;
  };
}

// =============================================
// أنواع المصادقة الثنائية
// 2FA Types
// =============================================

export interface TwoFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFAVerify {
  success: boolean;
  message: string;
}

// =============================================
// أنواع العمولة والضريبة
// Commission & Tax Types
// =============================================

export interface CommissionCalculation {
  basePrice: number;
  discount: number;
  priceAfterDiscount: number;
  vat: number;
  vatRate: number;
  totalAmount: number;
  commissionRate: number;
  commission: number;
  netAmount: number;
}

export interface SettlementCalculation {
  periodStart: Date;
  periodEnd: Date;
  totalSales: number;
  totalCommission: number;
  totalVAT: number;
  totalRefunds: number;
  netAmount: number;
  orders: SettlementOrder[];
}

export interface SettlementOrder {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  commission: number;
  vat: number;
  createdAt: Date;
}

// =============================================
// معدلات العمولة حسب الخطة
// Commission Rates by Plan
// =============================================

export const COMMISSION_RATES: Record<PlanType, number> = {
  FREE: 0.15,         // 15%
  BASIC: 0.12,        // 12%
  PROFESSIONAL: 0.10, // 10%
  PREMIUM: 0.08       // 8%
} as const;

export const VAT_RATE = 0.15; // 15% للسعودية

// =============================================
// إعدادات التوكن
// Token Settings
// =============================================

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000, // 15 دقيقة
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  REMEMBER_ME_TOKEN_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 يوم
} as const;

// =============================================
// إعدادات OTP
// OTP Settings
// =============================================

export const OTP_CONFIG = {
  CODE_LENGTH: 6,
  EXPIRY_TIME: 5 * 60 * 1000, // 5 دقائق
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN: 60 * 1000, // 60 ثانية
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // ساعة واحدة
  MAX_REQUESTS_PER_WINDOW: 10,
} as const;

// =============================================
// رسائل الخطأ
// Error Messages
// =============================================

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  USER_ALREADY_EXISTS: 'المستخدم موجود بالفعل',
  PHONE_ALREADY_REGISTERED: 'رقم الهاتف مسجل مسبقاً',
  PHONE_NOT_VERIFIED: 'رقم الهاتف غير موثق',
  INVALID_PHONE_FORMAT: 'صيغة رقم الهاتف غير صحيحة',
  INVALID_PASSWORD: 'كلمة المرور غير صحيحة',
  WEAK_PASSWORD: 'كلمة المرور ضعيفة',
  OTP_EXPIRED: 'رمز التحقق منتهي الصلاحية',
  OTP_INVALID: 'رمز التحقق غير صحيح',
  OTP_MAX_ATTEMPTS: 'تم تجاوز عدد المحاولات المسموحة',
  TOO_MANY_REQUESTS: 'طلبات كثيرة، يرجى المحاولة لاحقاً',
  TOKEN_EXPIRED: 'انتهت صلاحية الجلسة',
  TOKEN_INVALID: 'جلسة غير صالحة',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  ACCOUNT_SUSPENDED: 'الحساب معلق',
  ACCOUNT_BANNED: 'الحساب محظور',
  TWO_FA_REQUIRED: 'مطلوب التحقق بخطوتين',
  SESSION_NOT_FOUND: 'الجلسة غير موجودة',
} as const;
