// =============================================
// خدمة العمولة والتسوية المالية
// Commission & Settlement Service
// =============================================

import { db } from '@/lib/db';
import { PlanType, SettlementStatus } from '@prisma/client';
import {
  COMMISSION_RATES,
  VAT_RATE,
  CommissionCalculation,
  SettlementCalculation,
  SettlementOrder,
} from '@/types/auth';

// =============================================
// واجهات البيانات
// Data Interfaces
// =============================================

interface OrderForCommission {
  id: string;
  orderNumber: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  vatAmount: number;
  totalAmount: number;
  createdAt: Date;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface MerchantCommissionData {
  merchantId: string;
  subscriptionPlan: PlanType;
  commissionRate: number;
}

interface StoreCommissionData {
  storeId: string;
  subscriptionPlan: PlanType;
  commissionRate: number;
}

// =============================================
// خدمة العمولة
// Commission Service Class
// =============================================

class CommissionService {
  /**
   * حساب الضريبة المضافة (VAT)
   * Calculate VAT (15% for Saudi Arabia)
   */
  calculateVAT(basePrice: number, discount: number = 0): number {
    const priceAfterDiscount = basePrice - discount;
    const vat = priceAfterDiscount * VAT_RATE;
    return Math.round(vat * 100) / 100; // تقريب لمنزلتين
  }

  /**
   * الحصول على معدل العمولة حسب الخطة
   * Get commission rate by plan
   */
  getCommissionRate(plan: PlanType): number {
    return COMMISSION_RATES[plan];
  }

  /**
   * حساب العمولة
   * Calculate commission
   */
  calculateCommission(
    basePrice: number,
    discount: number,
    plan: PlanType,
    customRate?: number
  ): number {
    const rate = customRate ?? COMMISSION_RATES[plan];
    const priceAfterDiscount = basePrice - discount;
    const commission = priceAfterDiscount * rate;
    return Math.round(commission * 100) / 100;
  }

  /**
   * حساب كامل للمبلغ مع الضريبة والعمولة
   * Full calculation with VAT and commission
   */
  calculateFullAmount(
    basePrice: number,
    discount: number = 0,
    plan: PlanType = PlanType.FREE,
    customCommissionRate?: number
  ): CommissionCalculation {
    const priceAfterDiscount = basePrice - discount;
    const vat = this.calculateVAT(basePrice, discount);
    const totalAmount = priceAfterDiscount + vat;
    const commissionRate = customCommissionRate ?? COMMISSION_RATES[plan];
    const commission = Math.round((priceAfterDiscount * commissionRate) * 100) / 100;
    const netAmount = Math.round((totalAmount - commission) * 100) / 100;

    return {
      basePrice,
      discount,
      priceAfterDiscount,
      vat,
      vatRate: VAT_RATE,
      totalAmount,
      commissionRate,
      commission,
      netAmount,
    };
  }

  /**
   * حساب العمولة للطلب
   * Calculate commission for order
   */
  calculateOrderCommission(
    order: OrderForCommission,
    plan: PlanType,
    customRate?: number
  ): {
    subtotal: number;
    discount: number;
    shippingFee: number;
    vat: number;
    totalAmount: number;
    commission: number;
    netForMerchant: number;
  } {
    const { subtotal, discountAmount, shippingFee, vatAmount, totalAmount } = order;
    
    // العمولة تُحسب على المنتجات فقط (بدون الشحن)
    const productsTotal = subtotal - discountAmount;
    const commissionRate = customRate ?? COMMISSION_RATES[plan];
    const commission = Math.round((productsTotal * commissionRate) * 100) / 100;
    
    // المبلغ الصافي للتاجر = إجمالي الطلب - العمولة - الضريبة
    // ملاحظة: الضريبة تُحصل من العميل وتُدفع للدولة
    const netForMerchant = Math.round((productsTotal - commission) * 100) / 100;

    return {
      subtotal,
      discount: discountAmount,
      shippingFee,
      vat: vatAmount,
      totalAmount,
      commission,
      netForMerchant,
    };
  }

  /**
   * إنشاء تسوية مالية
   * Create financial settlement
   */
  async createSettlement(
    merchantId: string | null,
    storeId: string | null,
    periodStart: Date,
    periodEnd: Date
  ): Promise<SettlementCalculation | null> {
    // التحقق من عدم وجود تسوية سابقة لنفس الفترة
    const existingSettlement = await db.settlement.findFirst({
      where: {
        OR: [
          { merchantId },
          { storeId },
        ],
        periodStart,
        periodEnd,
        status: { not: SettlementStatus.FAILED },
      },
    });

    if (existingSettlement) {
      console.log('Settlement already exists for this period');
      return null;
    }

    // الحصول على الطلبات المكتملة في الفترة
    const orders = await db.order.findMany({
      where: {
        OR: [
          { merchantId },
          { storeId },
        ],
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
        status: 'DELIVERED',
      },
      include: {
        items: true,
      },
    });

    if (orders.length === 0) {
      return null;
    }

    // الحصول على معدل العمولة
    let commissionRate = COMMISSION_RATES.FREE;
    if (merchantId) {
      const merchant = await db.merchantProfile.findUnique({
        where: { id: merchantId },
        select: { commissionRate: true },
      });
      commissionRate = merchant?.commissionRate ?? COMMISSION_RATES.FREE;
    } else if (storeId) {
      const store = await db.store.findUnique({
        where: { id: storeId },
        select: { commissionRate: true },
      });
      commissionRate = store?.commissionRate ?? COMMISSION_RATES.FREE;
    }

    // حساب المبالغ
    let totalSales = 0;
    let totalCommission = 0;
    let totalVAT = 0;
    const settlementOrders: SettlementOrder[] = [];

    for (const order of orders) {
      const orderCommission = this.calculateOrderCommission(
        order as unknown as OrderForCommission,
        PlanType.FREE,
        commissionRate
      );

      totalSales += order.totalAmount;
      totalCommission += orderCommission.commission;
      totalVAT += order.vatAmount;

      settlementOrders.push({
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        commission: orderCommission.commission,
        vat: order.vatAmount,
        createdAt: order.createdAt,
      });
    }

    // الحصول على المبالغ المستردة
    const refunds = await db.payment.findMany({
      where: {
        order: {
          OR: [
            { merchantId },
            { storeId },
          ],
        },
        status: 'REFUNDED',
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    const totalRefunds = refunds.reduce((sum, refund) => sum + refund.amount, 0);

    // حساب المبلغ الصافي
    const netAmount = Math.round((totalSales - totalCommission - totalRefunds) * 100) / 100;

    // إنشاء التسوية
    await db.settlement.create({
      data: {
        merchantId,
        storeId,
        periodStart,
        periodEnd,
        totalSales,
        totalCommission,
        totalRefunds,
        netAmount,
        status: SettlementStatus.PENDING,
      },
    });

    return {
      periodStart,
      periodEnd,
      totalSales,
      totalCommission,
      totalVAT,
      totalRefunds,
      netAmount,
      orders: settlementOrders,
    };
  }

  /**
   * الحصول على تسويات التاجر
   * Get merchant settlements
   */
  async getMerchantSettlements(
    merchantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    settlements: {
      id: string;
      periodStart: Date;
      periodEnd: Date;
      totalSales: number;
      totalCommission: number;
      netAmount: number;
      status: string;
      paidAt: Date | null;
    }[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [settlements, total] = await Promise.all([
      db.settlement.findMany({
        where: { merchantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.settlement.count({
        where: { merchantId },
      }),
    ]);

    return {
      settlements: settlements.map(s => ({
        id: s.id,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        totalSales: s.totalSales,
        totalCommission: s.totalCommission,
        netAmount: s.netAmount,
        status: s.status,
        paidAt: s.paidAt,
      })),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * الحصول على تسويات المتجر
   * Get store settlements
   */
  async getStoreSettlements(
    storeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    settlements: {
      id: string;
      periodStart: Date;
      periodEnd: Date;
      totalSales: number;
      totalCommission: number;
      netAmount: number;
      status: string;
      paidAt: Date | null;
    }[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [settlements, total] = await Promise.all([
      db.settlement.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.settlement.count({
        where: { storeId },
      }),
    ]);

    return {
      settlements: settlements.map(s => ({
        id: s.id,
        periodStart: s.periodStart,
        periodEnd: s.periodEnd,
        totalSales: s.totalSales,
        totalCommission: s.totalCommission,
        netAmount: s.netAmount,
        status: s.status,
        paidAt: s.paidAt,
      })),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * تحديث معدل عمولة التاجر
   * Update merchant commission rate
   */
  async updateMerchantCommissionRate(
    merchantId: string,
    newPlan: PlanType
  ): Promise<void> {
    const newRate = COMMISSION_RATES[newPlan];
    
    await db.merchantProfile.update({
      where: { id: merchantId },
      data: {
        subscriptionPlan: newPlan,
        commissionRate: newRate,
      },
    });
  }

  /**
   * تحديث معدل عمولة المتجر
   * Update store commission rate
   */
  async updateStoreCommissionRate(
    storeId: string,
    newPlan: PlanType
  ): Promise<void> {
    const newRate = COMMISSION_RATES[newPlan];
    
    await db.store.update({
      where: { id: storeId },
      data: {
        subscriptionPlan: newPlan,
        commissionRate: newRate,
      },
    });
  }

  /**
   * حساب ملخص الأرباح
   * Calculate earnings summary
   */
  async getEarningsSummary(
    merchantId?: string,
    storeId?: string
  ): Promise<{
    today: number;
    thisWeek: number;
    thisMonth: number;
    totalEarnings: number;
    pendingSettlement: number;
    lastSettlement: {
      amount: number;
      date: Date;
    } | null;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const whereClause = merchantId 
      ? { merchantId } 
      : storeId 
        ? { storeId }
        : {};

    // الطلبات المكتملة
    const [todayOrders, weekOrders, monthOrders, allOrders] = await Promise.all([
      db.order.findMany({
        where: { ...whereClause, status: 'DELIVERED', createdAt: { gte: todayStart } },
      }),
      db.order.findMany({
        where: { ...whereClause, status: 'DELIVERED', createdAt: { gte: weekStart } },
      }),
      db.order.findMany({
        where: { ...whereClause, status: 'DELIVERED', createdAt: { gte: monthStart } },
      }),
      db.order.findMany({
        where: { ...whereClause, status: 'DELIVERED' },
      }),
    ]);

    // التسويات المعلقة
    const pendingSettlements = await db.settlement.findMany({
      where: {
        ...whereClause,
        status: SettlementStatus.PENDING,
      },
    });

    // آخر تسوية
    const lastSettlement = await db.settlement.findFirst({
      where: {
        ...whereClause,
        status: SettlementStatus.COMPLETED,
      },
      orderBy: { paidAt: 'desc' },
    });

    return {
      today: todayOrders.reduce((sum, o) => sum + o.totalAmount - o.commissionAmount, 0),
      thisWeek: weekOrders.reduce((sum, o) => sum + o.totalAmount - o.commissionAmount, 0),
      thisMonth: monthOrders.reduce((sum, o) => sum + o.totalAmount - o.commissionAmount, 0),
      totalEarnings: allOrders.reduce((sum, o) => sum + o.totalAmount - o.commissionAmount, 0),
      pendingSettlement: pendingSettlements.reduce((sum, s) => sum + s.netAmount, 0),
      lastSettlement: lastSettlement
        ? {
            amount: lastSettlement.netAmount,
            date: lastSettlement.paidAt ?? lastSettlement.createdAt,
          }
        : null,
    };
  }

  /**
   * معالجة التسوية (تحديث الحالة)
   * Process settlement (update status)
   */
  async processSettlement(
    settlementId: string,
    status: SettlementStatus,
    paymentReference?: string
  ): Promise<void> {
    await db.settlement.update({
      where: { id: settlementId },
      data: {
        status,
        paidAt: status === SettlementStatus.COMPLETED ? new Date() : null,
        paymentReference,
      },
    });
  }
}

// تصدير نسخة واحدة من الخدمة
export const commissionService = new CommissionService();

// تصدير الدوال المباشرة
export const {
  calculateVAT,
  getCommissionRate,
  calculateCommission,
  calculateFullAmount,
  calculateOrderCommission,
  createSettlement,
  getMerchantSettlements,
  getStoreSettlements,
  updateMerchantCommissionRate,
  updateStoreCommissionRate,
  getEarningsSummary,
  processSettlement,
} = commissionService;

// تصدير الثوابت
export { COMMISSION_RATES, VAT_RATE };
