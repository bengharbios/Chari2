// =============================================
// Middleware للحماية والمصادقة
// Authentication & Protection Middleware
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// =============================================
// مفاتيح التشفير
// Encryption Keys
// =============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// =============================================
// أنواع المستخدمين
// User Types
// =============================================

type UserType = 'BUYER' | 'MERCHANT' | 'STORE' | 'ADMIN';

interface TokenPayload {
  userId: string;
  phone: string;
  userType: UserType;
  sessionId: string;
  iat: number;
  exp: number;
}

// =============================================
// إعدادات المسارات
// Route Configuration
// =============================================

interface RouteConfig {
  path: string;
  allowedTypes: UserType[] | 'public' | 'authenticated';
  redirectTo?: string;
}

const routeConfigs: RouteConfig[] = [
  // المسارات العامة
  { path: '/', allowedTypes: 'public' },
  { path: '/auth', allowedTypes: 'public' },
  { path: '/auth/login', allowedTypes: 'public' },
  { path: '/auth/register', allowedTypes: 'public' },
  { path: '/auth/forgot-password', allowedTypes: 'public' },
  { path: '/products', allowedTypes: 'public' },
  { path: '/categories', allowedTypes: 'public' },
  { path: '/stores', allowedTypes: 'public' },
  { path: '/api/auth/login', allowedTypes: 'public' },
  { path: '/api/auth/register', allowedTypes: 'public' },
  { path: '/api/auth/otp', allowedTypes: 'public' },
  { path: '/api/auth/refresh', allowedTypes: 'public' },
  { path: '/api/products', allowedTypes: 'public' },
  { path: '/api/categories', allowedTypes: 'public' },

  // المسارات للمستخدمين المسجلين
  { path: '/buyer', allowedTypes: 'authenticated', redirectTo: '/auth/login' },
  { path: '/buyer/account', allowedTypes: ['BUYER'], redirectTo: '/auth/login' },
  { path: '/buyer/orders', allowedTypes: ['BUYER'], redirectTo: '/auth/login' },
  { path: '/buyer/wishlist', allowedTypes: ['BUYER'], redirectTo: '/auth/login' },
  { path: '/buyer/addresses', allowedTypes: ['BUYER'], redirectTo: '/auth/login' },
  { path: '/api/cart', allowedTypes: 'authenticated' },
  { path: '/api/orders', allowedTypes: 'authenticated' },

  // مسارات التجار
  { path: '/merchant', allowedTypes: ['MERCHANT'], redirectTo: '/auth/login' },
  { path: '/merchant/dashboard', allowedTypes: ['MERCHANT'], redirectTo: '/auth/login' },
  { path: '/merchant/products', allowedTypes: ['MERCHANT'], redirectTo: '/auth/login' },
  { path: '/merchant/orders', allowedTypes: ['MERCHANT'], redirectTo: '/auth/login' },
  { path: '/merchant/analytics', allowedTypes: ['MERCHANT'], redirectTo: '/auth/login' },
  { path: '/merchant/settings', allowedTypes: ['MERCHANT'], redirectTo: '/auth/login' },

  // مسارات المتاجر
  { path: '/store', allowedTypes: ['STORE'], redirectTo: '/auth/login' },
  { path: '/store/dashboard', allowedTypes: ['STORE'], redirectTo: '/auth/login' },
  { path: '/store/products', allowedTypes: ['STORE'], redirectTo: '/auth/login' },
  { path: '/store/orders', allowedTypes: ['STORE'], redirectTo: '/auth/login' },
  { path: '/store/analytics', allowedTypes: ['STORE'], redirectTo: '/auth/login' },
  { path: '/store/settings', allowedTypes: ['STORE'], redirectTo: '/auth/login' },

  // مسارات المديرين
  { path: '/admin', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/dashboard', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/users', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/products', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/orders', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/merchants', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/analytics', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/admin/settings', allowedTypes: ['ADMIN'], redirectTo: '/auth/login' },
  { path: '/api/admin', allowedTypes: ['ADMIN'] },
];

// =============================================
// دوال مساعدة
// Helper Functions
// =============================================

/**
 * الحصول على التوكن من الكعكة
 * Get token from cookies
 */
function getTokenFromCookie(request: NextRequest): string | null {
  // دعم أسماء مختلفة للكوكي
  return (
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('access_token')?.value ||
    null
  );
}

/**
 * التحقق من التوكن
 * Verify token
 */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * البحث عن تكوين المسار
 * Find route configuration
 */
function findRouteConfig(pathname: string): RouteConfig | null {
  for (const config of routeConfigs) {
    if (pathname.startsWith(config.path)) {
      return config;
    }
  }
  return null;
}

/**
 * التحقق من صلاحية الوصول
 * Check access permission
 */
function hasAccess(
  userType: UserType | null,
  allowedTypes: UserType[] | 'public' | 'authenticated'
): boolean {
  if (allowedTypes === 'public') {
    return true;
  }

  if (allowedTypes === 'authenticated') {
    return userType !== null;
  }

  if (Array.isArray(allowedTypes)) {
    return userType !== null && allowedTypes.includes(userType);
  }

  return false;
}

/**
 * إنشاء URL للتوجيه
 * Create redirect URL
 */
function createRedirectUrl(request: NextRequest, redirectTo: string): URL {
  const url = new URL(redirectTo, request.url);
  
  // إضافة المسار الحالي كمعامل للعودة
  if (redirectTo.includes('/auth/login')) {
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
  }
  
  return url;
}

// =============================================
// Middleware الرئيسي
// Main Middleware
// =============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // تجاهل الملفات الثابتة
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/refresh') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // البحث عن تكوين المسار
  const routeConfig = findRouteConfig(pathname);

  // إذا لم يوجد تكوين، السماح بالوصول
  if (!routeConfig) {
    return NextResponse.next();
  }

  // الحصول على التوكن
  const token = getTokenFromCookie(request);

  // التحقق من التوكن
  let payload: TokenPayload | null = null;
  if (token) {
    payload = await verifyToken(token);
  }

  const userType = payload?.userType || null;

  // التحقق من الصلاحيات
  if (hasAccess(userType, routeConfig.allowedTypes)) {
    return NextResponse.next();
  }

  // إذا لم يكن مسموحاً
  
  // إذا كان المستخدم مسجل دخوله لكن ليس لديه صلاحية
  if (userType && Array.isArray(routeConfig.allowedTypes)) {
    // توجيه إلى لوحة التحكم المناسبة لنوع المستخدم
    const dashboardUrl = new URL(`/${userType.toLowerCase()}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // إذا لم يكن المستخدم مسجل دخوله
  if (!userType && routeConfig.redirectTo) {
    const redirectUrl = createRedirectUrl(request, routeConfig.redirectTo);
    return NextResponse.redirect(redirectUrl);
  }

  // في أي حالة أخرى، رفض الوصول
  return NextResponse.json(
    { success: false, message: 'غير مصرح بالوصول' },
    { status: 403 }
  );
}

// =============================================
// إعدادات Matcher
// Matcher Configuration
// =============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
