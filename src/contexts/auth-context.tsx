// =============================================
// سياق المصادقة مع Zustand
// Auth Context with Zustand
// =============================================

'use client';

import { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserType, UserStatus } from '@prisma/client';

// =============================================
// أنواع المستخدم
// User Types
// =============================================

export interface User {
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

export interface AuthState {
  // الحالة
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // الإجراءات
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  logoutWithAPI: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

// =============================================
// Zustand Store
// =============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // الحالة الابتدائية
      user: null,
      isAuthenticated: false,
      isLoading: true,
      accessToken: null,
      refreshToken: null,

      // إعداد المستخدم
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // إعداد التوكنات
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      // إعداد التحميل
      setLoading: (isLoading) => set({ isLoading }),

      // تسجيل الدخول
      login: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      // تسجيل الخروج - يحتاج استدعاء API من الـ Provider
      logout: () => {
        // مسح الحالة
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // مسح localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      // تسجيل الخروج مع API
      logoutWithAPI: async () => {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout API error:', error);
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        // مسح localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
        }
      },

      // تحديث المستخدم
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // التحقق من المصادقة
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success && data.data?.isAuthenticated && data.data?.user) {
            set({
              user: data.data.user as User,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // تحديث المصادقة
      refreshAuth: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          const data = await response.json();

          if (data.success && data.data) {
            set({
              user: data.data.user as User,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              isAuthenticated: true,
            });
            return true;
          }

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return false;
        } catch (error) {
          console.error('Refresh auth error:', error);
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// =============================================
// Auth Context
// =============================================

interface AuthContextType extends AuthState {
  // دوال إضافية
  loginWithPassword: (phone: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message: string; requires2FA?: boolean }>;
  loginWithOTP: (phone: string, code: string) => Promise<{ success: boolean; message: string }>;
  sendOTP: (phone: string, type: 'LOGIN' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET') => Promise<{ success: boolean; message: string; expiresIn?: number }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logoutAll: () => Promise<void>;
  performLogout: () => Promise<void>;
}

interface RegisterData {
  phone: string;
  password: string;
  name?: string;
  email?: string;
  userType: UserType;
  businessName?: string;
  commercialRegNumber?: string;
  taxNumber?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// =============================================
// Auth Provider
// =============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  // التحقق من المصادقة عند التحميل
  useEffect(() => {
    store.checkAuth();
  }, []);

  // تسجيل الدخول بكلمة المرور
  const loginWithPassword = useCallback(
    async (phone: string, password: string, rememberMe: boolean = false) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password, rememberMe }),
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success && data.data) {
          if (data.data.requires2FA) {
            return { success: true, message: data.message, requires2FA: true };
          }

          store.login(
            data.data.user as User,
            data.data.accessToken,
            data.data.refreshToken
          );
          return { success: true, message: data.message };
        }

        return { success: false, message: data.message || 'فشل تسجيل الدخول' };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
      }
    },
    [store]
  );

  // تسجيل الدخول بـ OTP
  const loginWithOTP = useCallback(
    async (phone: string, code: string) => {
      try {
        const response = await fetch('/api/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, code, type: 'LOGIN' }),
          credentials: 'include',
        });

        const data = await response.json();

        if (data.success && data.data) {
          store.login(
            data.data.user as User,
            data.data.accessToken,
            data.data.refreshToken
          );
          return { success: true, message: data.message };
        }

        return { success: false, message: data.message || 'فشل التحقق' };
      } catch (error) {
        console.error('OTP login error:', error);
        return { success: false, message: 'حدث خطأ أثناء التحقق' };
      }
    },
    [store]
  );

  // إرسال OTP
  const sendOTP = useCallback(
    async (phone: string, type: 'LOGIN' | 'PHONE_VERIFICATION' | 'PASSWORD_RESET') => {
      try {
        const response = await fetch('/api/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, type }),
        });

        const data = await response.json();

        return {
          success: data.success,
          message: data.message,
          expiresIn: data.data?.expiresIn,
        };
      } catch (error) {
        console.error('Send OTP error:', error);
        return { success: false, message: 'حدث خطأ أثناء إرسال الرمز' };
      }
    },
    []
  );

  // التسجيل
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });

        const result = await response.json();

        if (result.success && result.data) {
          store.login(
            result.data.user as User,
            result.data.accessToken,
            result.data.refreshToken
          );
          return { success: true, message: result.message };
        }

        return { success: false, message: result.message || 'فشل التسجيل' };
      } catch (error) {
        console.error('Register error:', error);
        return { success: false, message: 'حدث خطأ أثناء التسجيل' };
      }
    },
    [store]
  );

  // تسجيل الخروج من جميع الأجهزة
  const logoutAll = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allSessions: true }),
        credentials: 'include',
      });

      store.logout();
    } catch (error) {
      console.error('Logout all error:', error);
      store.logout();
    }
  }, [store]);

  // دالة تسجيل الخروج الرئيسية
  const performLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    // مسح الحالة المحلية و localStorage
    store.logout();
  }, [store]);

  const value: AuthContextType = {
    ...store,
    loginWithPassword,
    loginWithOTP,
    sendOTP,
    register,
    logoutAll,
    performLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================
// Auth Hook
// =============================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================
// Hooks مساعدة
// Helper Hooks
// =============================================

/**
 * التحقق من نوع المستخدم
 * Check user type
 */
export function useUserType(requiredType: UserType): {
  isAuthorized: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();

  return {
    isAuthorized: user?.userType === requiredType,
    isLoading,
  };
}

/**
 * التحقق من المصادقة مع إعادة التوجيه
 * Check auth with redirect
 */
export function useRequireAuth(redirectUrl: string = '/auth/login'): {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
} {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // في التطبيق الحقيقي، يمكن استخدام router.push
      window.location.href = redirectUrl;
    }
  }, [isAuthenticated, isLoading, redirectUrl]);

  return { isAuthenticated, isLoading, user };
}

/**
 * التحقق من صلاحيات المدير
 * Check admin permissions
 */
export function useAdminAuth(): {
  isAuthorized: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();

  return {
    isAuthorized: user?.userType === 'ADMIN',
    isLoading,
  };
}

/**
 * التحقق من صلاحيات التاجر
 * Check merchant permissions
 */
export function useMerchantAuth(): {
  isAuthorized: boolean;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();

  return {
    isAuthorized: user?.userType === 'MERCHANT' || user?.userType === 'STORE',
    isLoading,
  };
}

// =============================================
// تصدير الـ Provider
// Export Provider
// =============================================

export default AuthProvider;
