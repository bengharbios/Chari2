// =============================================
// API التسويات المالية
// Settlements API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SettlementStatus } from '@prisma/client';
import { SUBSCRIPTION_MESSAGES, SettlementDisplay, SettlementCreateInput } from '@/types/subscription';
import { commissionService } from '@/lib/services/commission-service';

// =============================================
// GET /api/settlements
// قائمة التسويات
// =============================================

export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'غير مصرح بالوصول',
          error: { code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    // الحصول على معاملات الاستعلام
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as SettlementStatus | null;
    const skip = (page - 1) * limit;

    // بناء شرط البحث
    let whereClause: Record<string, unknown> = {};

    if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (merchant) {
        whereClause.merchantId = merchant.id;
      }
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (store) {
        whereClause.storeId = store.id;
      }
    } else if (user.userType === 'ADMIN') {
      // المدير يمكنه رؤية جميع التسويات
      if (status) {
        whereClause.status = status;
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'غير مصرح بالوصول',
          error: { code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    if (status && user.userType !== 'ADMIN') {
      whereClause.status = status;
    }

    // جلب التسويات
    const [settlements, total] = await Promise.all([
      db.settlement.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.settlement.count({ where: whereClause }),
    ]);

    // تحويل البيانات للعرض
    const settlementDisplays: SettlementDisplay[] = await Promise.all(
      settlements.map(async (settlement) => {
        // حساب عدد الطلبات في الفترة
        const orderCount = await db.order.count({
          where: {
            OR: [
              { merchantId: settlement.merchantId },
              { storeId: settlement.storeId },
            ],
            createdAt: {
              gte: settlement.periodStart,
              lte: settlement.periodEnd,
            },
            status: 'DELIVERED',
          },
        });

        return {
          id: settlement.id,
          merchantId: settlement.merchantId,
          storeId: settlement.storeId,
          periodStart: settlement.periodStart,
          periodEnd: settlement.periodEnd,
          totalSales: settlement.totalSales,
          totalCommission: settlement.totalCommission,
          totalRefunds: settlement.totalRefunds,
          netAmount: settlement.netAmount,
          status: settlement.status,
          paidAt: settlement.paidAt,
          paymentReference: settlement.paymentReference,
          reportUrl: settlement.reportUrl,
          createdAt: settlement.createdAt,
          orderCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        settlements: settlementDisplays,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء جلب التسويات',
        error: { code: 'FETCH_ERROR' },
      },
      { status: 500 }
    );
  }
}

// =============================================
// POST /api/settlements
// إنشاء تسوية جديدة
// =============================================

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'غير مصرح بالوصول',
          error: { code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    // التحقق من الصلاحيات
    if (user.userType !== 'MERCHANT' && user.userType !== 'STORE' && user.userType !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'غير مصرح بإنشاء تسوية',
          error: { code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { periodStart, periodEnd }: SettlementCreateInput = body;

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        {
          success: false,
          message: 'مطلوب تحديد فترة التسوية',
          error: { code: 'PERIOD_REQUIRED' },
        },
        { status: 400 }
      );
    }

    // تحديد التاجر أو المتجر
    let merchantId: string | null = null;
    let storeId: string | null = null;

    if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (merchant) {
        merchantId = merchant.id;
      }
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      if (store) {
        storeId = store.id;
      }
    } else if (user.userType === 'ADMIN' && body.merchantId) {
      merchantId = body.merchantId;
    } else if (user.userType === 'ADMIN' && body.storeId) {
      storeId = body.storeId;
    }

    if (!merchantId && !storeId) {
      return NextResponse.json(
        {
          success: false,
          message: 'مطلوب تحديد التاجر أو المتجر',
          error: { code: 'MERCHANT_OR_STORE_REQUIRED' },
        },
        { status: 400 }
      );
    }

    // إنشاء التسوية باستخدام خدمة العمولة
    const result = await commissionService.createSettlement(
      merchantId,
      storeId,
      new Date(periodStart),
      new Date(periodEnd)
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: SUBSCRIPTION_MESSAGES.SETTLEMENT_ALREADY_EXISTS,
          error: { code: 'SETTLEMENT_EXISTS' },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء التسوية بنجاح',
      data: {
        settlement: result,
      },
    });
  } catch (error) {
    console.error('Error creating settlement:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إنشاء التسوية',
        error: { code: 'CREATE_ERROR' },
      },
      { status: 500 }
    );
  }
}
