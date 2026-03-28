// =============================================
// API تقرير التسويات
// Settlements Report API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SettlementStatus } from '@prisma/client';
import { SettlementReport, SettlementDisplay } from '@/types/subscription';

// =============================================
// GET /api/settlements/report
// تقرير التسويات
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
    const periodStart = searchParams.get('periodStart');
    const periodEnd = searchParams.get('periodEnd');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
    } else if (user.userType !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'غير مصرح بالوصول',
          error: { code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // إضافة فلتر التاريخ
    if (periodStart && periodEnd) {
      whereClause.periodStart = { gte: new Date(periodStart) };
      whereClause.periodEnd = { lte: new Date(periodEnd) };
    }

    // جلب جميع التسويات
    const settlements = await db.settlement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // حساب الملخص العام
    const summary = {
      totalSettlements: settlements.length,
      totalSales: settlements.reduce((sum, s) => sum + s.totalSales, 0),
      totalCommission: settlements.reduce((sum, s) => sum + s.totalCommission, 0),
      totalNetAmount: settlements.reduce((sum, s) => sum + s.netAmount, 0),
      pendingAmount: settlements
        .filter(s => s.status === SettlementStatus.PENDING)
        .reduce((sum, s) => sum + s.netAmount, 0),
      paidAmount: settlements
        .filter(s => s.status === SettlementStatus.COMPLETED)
        .reduce((sum, s) => sum + s.netAmount, 0),
    };

    // تجميع حسب الشهر
    const byMonthMap = new Map<string, { sales: number; commission: number; netAmount: number }>();
    
    settlements.forEach(settlement => {
      const monthKey = settlement.periodStart.toISOString().slice(0, 7); // YYYY-MM
      
      const existing = byMonthMap.get(monthKey) || { sales: 0, commission: 0, netAmount: 0 };
      existing.sales += settlement.totalSales;
      existing.commission += settlement.totalCommission;
      existing.netAmount += settlement.netAmount;
      byMonthMap.set(monthKey, existing);
    });

    const byMonth = Array.from(byMonthMap.entries())
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // تجميع حسب الحالة
    const byStatusMap = new Map<SettlementStatus, { count: number; amount: number }>();
    
    settlements.forEach(settlement => {
      const existing = byStatusMap.get(settlement.status) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += settlement.netAmount;
      byStatusMap.set(settlement.status, existing);
    });

    const byStatus = Array.from(byStatusMap.entries()).map(([status, data]) => ({
      status,
      ...data,
    }));

    // تقسيم التسويات للصفحات
    const paginatedSettlements = settlements.slice(skip, skip + limit);

    const settlementDisplays: SettlementDisplay[] = paginatedSettlements.map(s => ({
      id: s.id,
      merchantId: s.merchantId,
      storeId: s.storeId,
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      totalSales: s.totalSales,
      totalCommission: s.totalCommission,
      totalRefunds: s.totalRefunds,
      netAmount: s.netAmount,
      status: s.status,
      paidAt: s.paidAt,
      paymentReference: s.paymentReference,
      reportUrl: s.reportUrl,
      createdAt: s.createdAt,
      orderCount: 0, // سيتم حسابه عند الحاجة
    }));

    const report: SettlementReport = {
      summary,
      byMonth,
      byStatus,
      settlements: settlementDisplays,
    };

    return NextResponse.json({
      success: true,
      data: {
        report,
        pagination: {
          page,
          limit,
          total: settlements.length,
          totalPages: Math.ceil(settlements.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error generating settlement report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إنشاء التقرير',
        error: { code: 'REPORT_ERROR' },
      },
      { status: 500 }
    );
  }
}
