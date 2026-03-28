// =============================================
// API إلغاء الاشتراك
// Subscription Cancel API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SubscriptionStatus, PlanType } from '@prisma/client';
import { SUBSCRIPTION_MESSAGES } from '@/types/subscription';

// =============================================
// POST /api/subscriptions/cancel
// إلغاء الاشتراك
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

    // التحقق من نوع المستخدم
    if (user.userType !== 'MERCHANT' && user.userType !== 'STORE') {
      return NextResponse.json(
        {
          success: false,
          message: 'هذه الميزة متاحة للتجار والمتاجر فقط',
          error: { code: 'FORBIDDEN' },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason, immediate = false } = body;

    // الحصول على الاشتراك النشط
    const activeSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
      include: { plan: true },
    });

    if (!activeSubscription) {
      return NextResponse.json(
        {
          success: false,
          message: SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND,
          error: { code: 'SUBSCRIPTION_NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // إذا كان الإلغاء فوري
    if (immediate) {
      await db.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          autoRenew: false,
        },
      });

      // إرجاع المستخدم للخطة المجانية
      if (user.userType === 'MERCHANT') {
        await db.merchantProfile.updateMany({
          where: { userId: user.id },
          data: {
            subscriptionPlan: PlanType.FREE,
            commissionRate: 0.15,
            productsLimit: 10,
          },
        });
      } else if (user.userType === 'STORE') {
        await db.store.updateMany({
          where: { userId: user.id },
          data: {
            subscriptionPlan: PlanType.FREE,
            commissionRate: 0.15,
            productsLimit: 10,
          },
        });
      }
    } else {
      // إلغاء التجديد التلقائي فقط
      await db.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          autoRenew: false,
        },
      });
    }

    // تسجيل سبب الإلغاء في سجل التدقيق
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: immediate ? 'SUBSCRIPTION_CANCELLED' : 'AUTO_RENEW_DISABLED',
        entityType: 'Subscription',
        entityId: activeSubscription.id,
        newValue: JSON.stringify({
          reason,
          immediate,
          planCode: activeSubscription.plan.code,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: immediate 
        ? SUBSCRIPTION_MESSAGES.CANCEL_SUCCESS
        : 'تم إيقاف التجديد التلقائي، سيستمر الاشتراك حتى نهاية الفترة',
      data: {
        subscriptionId: activeSubscription.id,
        cancelledAt: new Date(),
        endDate: activeSubscription.endDate,
        immediate,
        revertedToFree: immediate,
      },
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إلغاء الاشتراك',
        error: { code: 'CANCEL_ERROR' },
      },
      { status: 500 }
    );
  }
}
