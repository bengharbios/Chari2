// =============================================
// أنواع الاشتراكات والتسويات
// Subscription & Settlement Types
// =============================================

import { PlanType, SubscriptionStatus, SettlementStatus } from '@prisma/client';

// =============================================
// أنواع خطط الاشتراك
// Subscription Plan Types
// =============================================

export interface SubscriptionPlanFeatures {
  productsLimit: number;
  commissionRate: number;
  customDomain: boolean;
  analytics: 'basic' | 'advanced' | 'premium';
  prioritySupport: boolean;
  apiAccess: boolean;
  bulkUpload: boolean;
  customTheme: boolean;
  multiUser: boolean;
  reports: boolean;
}

export interface SubscriptionPlanDisplay {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  priceMonthly: number;
  priceYearly: number;
  productsLimit: number;
  commissionRate: number;
  features: SubscriptionPlanFeatures;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface SubscriptionPlanWithSavings extends SubscriptionPlanDisplay {
  yearlyDiscount: number; // نسبة الخصم السنوي
  monthlySavings: number; // المبلغ الموفر شهرياً
}

// =============================================
// أنواع الاشتراك
// Subscription Types
// =============================================

export interface SubscriptionDisplay {
  id: string;
  planId: string;
  plan: SubscriptionPlanDisplay;
  userId: string;
  storeId: string | null;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  autoRenew: boolean;
  daysRemaining: number;
  isExpired: boolean;
}

export interface SubscriptionCreateInput {
  planId: string;
  userId: string;
  storeId?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
}

export interface SubscriptionUpgradeInput {
  newPlanId: string;
  paymentMethod?: string;
}

export interface SubscriptionCancelInput {
  reason?: string;
  immediate?: boolean;
}

// =============================================
// أنواع التسويات
// Settlement Types
// =============================================

export interface SettlementDisplay {
  id: string;
  merchantId: string | null;
  storeId: string | null;
  periodStart: Date;
  periodEnd: Date;
  totalSales: number;
  totalCommission: number;
  totalRefunds: number;
  netAmount: number;
  status: SettlementStatus;
  paidAt: Date | null;
  paymentReference: string | null;
  reportUrl: string | null;
  createdAt: Date;
  orderCount: number;
}

export interface SettlementDetailDisplay extends SettlementDisplay {
  orders: SettlementOrderItem[];
  summary: SettlementSummary;
}

export interface SettlementOrderItem {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  commission: number;
  vat: number;
  netAmount: number;
  status: string;
  createdAt: Date;
  customerName: string | null;
}

export interface SettlementSummary {
  totalOrders: number;
  totalSales: number;
  totalCommission: number;
  totalVAT: number;
  totalRefunds: number;
  netAmount: number;
  averageOrderValue: number;
}

export interface SettlementCreateInput {
  merchantId?: string;
  storeId?: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface SettlementReportFilters {
  merchantId?: string;
  storeId?: string;
  status?: SettlementStatus;
  periodStart?: Date;
  periodEnd?: Date;
  page?: number;
  limit?: number;
}

// =============================================
// أنواع تقارير التسوية
// Settlement Report Types
// =============================================

export interface SettlementReport {
  summary: {
    totalSettlements: number;
    totalSales: number;
    totalCommission: number;
    totalNetAmount: number;
    pendingAmount: number;
    paidAmount: number;
  };
  byMonth: {
    month: string;
    sales: number;
    commission: number;
    netAmount: number;
  }[];
  byStatus: {
    status: SettlementStatus;
    count: number;
    amount: number;
  }[];
  settlements: SettlementDisplay[];
}

// =============================================
// خطط الاشتراك الثابتة
// Static Subscription Plans
// =============================================

export const SUBSCRIPTION_PLANS: Record<PlanType, {
  nameAr: string;
  nameEn: string;
  priceMonthly: number;
  priceYearly: number;
  productsLimit: number;
  commissionRate: number;
  features: SubscriptionPlanFeatures;
}> = {
  FREE: {
    nameAr: 'مجاني',
    nameEn: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    productsLimit: 10,
    commissionRate: 0.15,
    features: {
      productsLimit: 10,
      commissionRate: 0.15,
      customDomain: false,
      analytics: 'basic',
      prioritySupport: false,
      apiAccess: false,
      bulkUpload: false,
      customTheme: false,
      multiUser: false,
      reports: false,
    },
  },
  BASIC: {
    nameAr: 'أساسي',
    nameEn: 'Basic',
    priceMonthly: 99,
    priceYearly: 990,
    productsLimit: 50,
    commissionRate: 0.12,
    features: {
      productsLimit: 50,
      commissionRate: 0.12,
      customDomain: false,
      analytics: 'basic',
      prioritySupport: false,
      apiAccess: true,
      bulkUpload: true,
      customTheme: false,
      multiUser: false,
      reports: true,
    },
  },
  PROFESSIONAL: {
    nameAr: 'احترافي',
    nameEn: 'Professional',
    priceMonthly: 299,
    priceYearly: 2990,
    productsLimit: 200,
    commissionRate: 0.10,
    features: {
      productsLimit: 200,
      commissionRate: 0.10,
      customDomain: true,
      analytics: 'advanced',
      prioritySupport: true,
      apiAccess: true,
      bulkUpload: true,
      customTheme: true,
      multiUser: true,
      reports: true,
    },
  },
  PREMIUM: {
    nameAr: 'مميز',
    nameEn: 'Premium',
    priceMonthly: 599,
    priceYearly: 5990,
    productsLimit: -1, // غير محدود
    commissionRate: 0.08,
    features: {
      productsLimit: -1,
      commissionRate: 0.08,
      customDomain: true,
      analytics: 'premium',
      prioritySupport: true,
      apiAccess: true,
      bulkUpload: true,
      customTheme: true,
      multiUser: true,
      reports: true,
    },
  },
};

// =============================================
// رسائل الاشتراكات
// Subscription Messages
// =============================================

export const SUBSCRIPTION_MESSAGES = {
  PLAN_NOT_FOUND: 'خطة الاشتراك غير موجودة',
  SUBSCRIPTION_NOT_FOUND: 'الاشتراك غير موجود',
  ALREADY_SUBSCRIBED: 'أنت مشترك بالفعل في هذه الخطة',
  CANNOT_DOWNGRADE: 'لا يمكن تخفيض الخطة في منتصف الفترة',
  UPGRADE_SUCCESS: 'تم ترقية الاشتراك بنجاح',
  CANCEL_SUCCESS: 'تم إلغاء الاشتراك بنجاح',
  SUBSCRIPTION_EXPIRED: 'انتهت صلاحية الاشتراك',
  PAYMENT_REQUIRED: 'مطلوب الدفع للاشتراك',
  SETTLEMENT_NOT_FOUND: 'التسوية غير موجودة',
  NO_ORDERS_FOR_SETTLEMENT: 'لا توجد طلبات لإنشاء تسوية',
  SETTLEMENT_ALREADY_EXISTS: 'توجد تسوية سابقة لنفس الفترة',
} as const;
