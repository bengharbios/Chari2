// =============================================
// API ترقية الاشتراك
// Subscription Upgrade API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { SubscriptionStatus, PlanType } from '@prisma/client';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_MESSAGES } from '@/types/subscription';

// ترتيب الخطط للترقية
const PLAN_ORDER: PlanType[] = [PlanType.FREE, PlanType.BASIC, PlanType.PROFESSIONAL, PlanType.PREMIUM];

// =============================================
// PUT /api/subscriptions/upgrade
// ترقية الاشتراك
// =============================================

export async function PUT(request: NextRequest) {
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
    const { newPlanId, paymentMethod, isYearly = false } = body;

    if (!newPlanId) {
      return NextResponse.json(
        {
          success: false,
          message: 'مطلوب تحديد الخطة الجديدة',
          error: { code: 'PLAN_REQUIRED' },
        },
        { status: 400 }
      );
    }

    // التحقق من الخطة الجديدة
    const newPlanCode = newPlanId as PlanType;
    const newPlanStatic = SUBSCRIPTION_PLANS[newPlanCode];
    
    if (!newPlanStatic) {
      // محاولة البحث في قاعدة البيانات
      const dbPlan = await db.subscriptionPlan.findUnique({
        where: { id: newPlanId },
      });
      
      if (!dbPlan) {
        return NextResponse.json(
          {
            success: false,
            message: SUBSCRIPTION_MESSAGES.PLAN_NOT_FOUND,
            error: { code: 'PLAN_NOT_FOUND' },
          },
          { status: 404 }
        );
      }
    }

    // الحصول على الاشتراك الحالي
    const currentSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
      include: { plan: true },
    });

    // تحديد الخطة الحالية
    let currentPlanCode: PlanType = PlanType.FREE;
    if (currentSubscription) {
      currentPlanCode = currentSubscription.plan.code as PlanType;
    } else {
      // الحصول من ملف التاجر/المتجر
      if (user.userType === 'MERCHANT') {
        const merchant = await db.merchantProfile.findUnique({
          where: { userId: user.id },
          select: { subscriptionPlan: true },
        });
        if (merchant) currentPlanCode = merchant.subscriptionPlan;
      } else if (user.userType === 'STORE') {
        const store = await db.store.findUnique({
          where: { userId: user.id },
          select: { subscriptionPlan: true },
        });
        if (store) currentPlanCode = store.subscriptionPlan;
      }
    }

    // التحقق من أن الخطة الجديدة أعلى
    const currentPlanIndex = PLAN_ORDER.indexOf(currentPlanCode);
    const newPlanIndex = PLAN_ORDER.indexOf(newPlanCode);

    if (newPlanIndex <= currentPlanIndex) {
      return NextResponse.json(
        {
          success: false,
          message: 'يمكنك الترقية فقط إلى خطة أعلى',
          error: { code: 'INVALID_UPGRADE' },
        },
        { status: 400 }
      );
    }

    // البحث عن الخطة الجديدة في قاعدة البيانات أو إنشاؤها
    let newPlan = await db.subscriptionPlan.findFirst({
      where: { code: newPlanCode },
    });

    if (!newPlan) {
      newPlan = await db.subscriptionPlan.create({
        data: {
          code: newPlanCode,
          nameAr: newPlanStatic.nameAr,
          nameEn: newPlanStatic.nameEn,
          priceMonthly: newPlanStatic.priceMonthly,
          priceYearly: newPlanStatic.priceYearly,
          productsLimit: newPlanStatic.productsLimit,
          commissionRate: newPlanStatic.commissionRate,
          features: JSON.stringify(newPlanStatic.features),
          isFeatured: newPlanCode === 'PROFESSIONAL',
        },
      });
    }

    // إلغاء الاشتراك الحالي إن وجد
    if (currentSubscription) {
      await db.subscription.update({
        where: { id: currentSubscription.id },
        data: { status: SubscriptionStatus.CANCELLED },
      });
    }

    // إنشاء اشتراك جديد
    const startDate = new Date();
    const endDate = new Date();
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const newSubscription = await db.subscription.create({
      data: {
        planId: newPlan.id,
        userId: user.id,
        storeId: currentSubscription?.storeId || null,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
        autoRenew: true,
      },
    });

    // تحديث التاجر/المتجر
    if (user.userType === 'MERCHANT') {
      await db.merchantProfile.updateMany({
        where: { userId: user.id },
        data: {
          subscriptionPlan: newPlanCode,
          commissionRate: newPlan.commissionRate,
          productsLimit: newPlan.productsLimit,
        },
      });
    } else if (user.userType === 'STORE') {
      await db.store.updateMany({
        where: { userId: user.id },
        data: {
          subscriptionPlan: newPlanCode,
          commissionRate: newPlan.commissionRate,
          productsLimit: newPlan.productsLimit,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: SUBSCRIPTION_MESSAGES.UPGRADE_SUCCESS,
      data: {
        subscription: {
          id: newSubscription.id,
          planId: newSubscription.planId,
          startDate: newSubscription.startDate,
          endDate: newSubscription.endDate,
          status: newSubscription.status,
        },
        previousPlan: currentPlanCode,
        newPlan: newPlanCode,
        newCommissionRate: newPlan.commissionRate,
      },
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء ترقية الاشتراك',
        error: { code: 'UPGRADE_ERROR' },
      },
      { status: 500 }
    );
  }
}
