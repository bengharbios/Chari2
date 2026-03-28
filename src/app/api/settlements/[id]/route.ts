// =============================================
// API تفاصيل التسوية
// Settlement Details API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SUBSCRIPTION_MESSAGES, SettlementDetailDisplay, SettlementOrderItem, SettlementSummary } from '@/types/subscription';

// =============================================
// GET /api/settlements/[id]
// تفاصيل التسوية
// =============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // جلب التسوية
    const settlement = await db.settlement.findUnique({
      where: { id },
    });

    if (!settlement) {
      return NextResponse.json(
        {
          success: false,
          message: SUBSCRIPTION_MESSAGES.SETTLEMENT_NOT_FOUND,
          error: { code: 'SETTLEMENT_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    let hasAccess = false;
    if (user.userType === 'ADMIN') {
      hasAccess = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      hasAccess = merchant?.id === settlement.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      hasAccess = store?.id === settlement.storeId;
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'غير مصرح بالوصول لهذه التسوية',
          error: { code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    // جلب الطلبات في فترة التسوية
    const orders = await db.order.findMany({
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
      include: {
        items: {
          include: {
            product: {
              select: { nameAr: true },
            },
          },
        },
        buyer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // حساب تفاصيل الطلبات
    const orderItems: SettlementOrderItem[] = orders.map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      commission: order.commissionAmount,
      vat: order.vatAmount,
      netAmount: order.totalAmount - order.commissionAmount,
      status: order.status,
      createdAt: order.createdAt,
      customerName: order.buyer?.name || null,
    }));

    // حساب الملخص
    const summary: SettlementSummary = {
      totalOrders: orders.length,
      totalSales: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalCommission: orders.reduce((sum, o) => sum + o.commissionAmount, 0),
      totalVAT: orders.reduce((sum, o) => sum + o.vatAmount, 0),
      totalRefunds: settlement.totalRefunds,
      netAmount: settlement.netAmount,
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length 
        : 0,
    };

    const settlementDetail: SettlementDetailDisplay = {
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
      orderCount: orders.length,
      orders: orderItems,
      summary,
    };

    return NextResponse.json({
      success: true,
      data: {
        settlement: settlementDetail,
      },
    });
  } catch (error) {
    console.error('Error fetching settlement details:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء جلب تفاصيل التسوية',
        error: { code: 'FETCH_ERROR' },
      },
      { status: 500 }
    );
  }
}
