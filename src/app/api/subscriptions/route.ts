// =============================================
// API الاشتراكات الرئيسية
// Main Subscriptions API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken, getUserFromRequest } from '@/lib/auth';
import { SubscriptionStatus, PlanType } from '@prisma/client';
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_MESSAGES, SubscriptionDisplay } from '@/types/subscription';

// =============================================
// GET /api/subscriptions/current
// الحصول على الاشتراك الحالي
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

    // البحث عن الاشتراك النشط
    const activeSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
      include: {
        plan: true,
      },
      orderBy: { endDate: 'desc' },
    });

    // إذا لم يوجد اشتراك، نرجع الخطة المجانية
    if (!activeSubscription) {
      // تحقق من خطة التاجر/المتجر الحالية
      let currentPlanCode: PlanType = PlanType.FREE;
      
      if (user.userType === 'MERCHANT') {
        const merchant = await db.merchantProfile.findUnique({
          where: { userId: user.id },
          select: { subscriptionPlan: true, commissionRate: true },
        });
        if (merchant) {
          currentPlanCode = merchant.subscriptionPlan;
        }
      } else if (user.userType === 'STORE') {
        const store = await db.store.findUnique({
          where: { userId: user.id },
          select: { subscriptionPlan: true, commissionRate: true },
        });
        if (store) {
          currentPlanCode = store.subscriptionPlan;
        }
      }

      const freePlan = SUBSCRIPTION_PLANS[currentPlanCode];

      return NextResponse.json({
        success: true,
        data: {
          subscription: null,
          currentPlan: {
            code: currentPlanCode,
            nameAr: freePlan.nameAr,
            nameEn: freePlan.nameEn,
            productsLimit: freePlan.productsLimit,
            commissionRate: freePlan.commissionRate,
            features: freePlan.features,
          },
          isOnFreePlan: currentPlanCode === PlanType.FREE,
        },
      });
    }

    // حساب الأيام المتبقية
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((activeSubscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const subscriptionDisplay: SubscriptionDisplay = {
      id: activeSubscription.id,
      planId: activeSubscription.planId,
      plan: {
        id: activeSubscription.plan.id,
        code: activeSubscription.plan.code,
        nameAr: activeSubscription.plan.nameAr,
        nameEn: activeSubscription.plan.nameEn,
        priceMonthly: activeSubscription.plan.priceMonthly,
        priceYearly: activeSubscription.plan.priceYearly,
        productsLimit: activeSubscription.plan.productsLimit,
        commissionRate: activeSubscription.plan.commissionRate,
        features: JSON.parse(activeSubscription.plan.features),
        isFeatured: activeSubscription.plan.isFeatured,
        isActive: activeSubscription.plan.isActive,
        sortOrder: activeSubscription.plan.sortOrder,
      },
      userId: activeSubscription.userId,
      storeId: activeSubscription.storeId,
      startDate: activeSubscription.startDate,
      endDate: activeSubscription.endDate,
      status: activeSubscription.status,
      autoRenew: activeSubscription.autoRenew,
      daysRemaining,
      isExpired: daysRemaining === 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        subscription: subscriptionDisplay,
        currentPlan: subscriptionDisplay.plan,
        isOnFreePlan: false,
      },
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء جلب الاشتراك',
        error: { code: 'FETCH_ERROR' },
      },
      { status: 500 }
    );
  }
}

// =============================================
// POST /api/subscriptions
// إنشاء اشتراك جديد
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
    const { planId, storeId, paymentMethod, autoRenew = true, isYearly = false } = body;

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          message: 'مطلوب تحديد الخطة',
          error: { code: 'PLAN_REQUIRED' },
        },
        { status: 400 }
      );
    }

    // البحث عن الخطة
    let plan = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    // إذا لم توجد في قاعدة البيانات، استخدم الخطط الثابتة
    if (!plan) {
      const planCode = planId as PlanType;
      const staticPlan = SUBSCRIPTION_PLANS[planCode];
      
      if (!staticPlan) {
        return NextResponse.json(
          {
            success: false,
            message: SUBSCRIPTION_MESSAGES.PLAN_NOT_FOUND,
            error: { code: 'PLAN_NOT_FOUND' },
          },
          { status: 404 }
        );
      }

      // إنشاء الخطة في قاعدة البيانات
      plan = await db.subscriptionPlan.create({
        data: {
          code: planCode,
          nameAr: staticPlan.nameAr,
          nameEn: staticPlan.nameEn,
          priceMonthly: staticPlan.priceMonthly,
          priceYearly: staticPlan.priceYearly,
          productsLimit: staticPlan.productsLimit,
          commissionRate: staticPlan.commissionRate,
          features: JSON.stringify(staticPlan.features),
          isFeatured: planCode === 'PROFESSIONAL',
        },
      });
    }

    // التحقق من عدم وجود اشتراك نشط
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          message: SUBSCRIPTION_MESSAGES.ALREADY_SUBSCRIBED,
          error: { code: 'ALREADY_SUBSCRIBED' },
        },
        { status: 400 }
      );
    }

    // حساب تواريخ الاشتراك
    const startDate = new Date();
    const endDate = new Date();
    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // إنشاء الاشتراك
    const subscription = await db.subscription.create({
      data: {
        planId: plan.id,
        userId: user.id,
        storeId: storeId || null,
        startDate,
        endDate,
        status: plan.priceMonthly === 0 ? SubscriptionStatus.ACTIVE : SubscriptionStatus.ACTIVE,
        autoRenew,
      },
    });

    // تحديث معدل العمولة للتاجر/المتجر
    if (user.userType === 'MERCHANT') {
      await db.merchantProfile.updateMany({
        where: { userId: user.id },
        data: {
          subscriptionPlan: plan.code as PlanType,
          commissionRate: plan.commissionRate,
          productsLimit: plan.productsLimit,
        },
      });
    } else if (user.userType === 'STORE') {
      await db.store.updateMany({
        where: { userId: user.id },
        data: {
          subscriptionPlan: plan.code as PlanType,
          commissionRate: plan.commissionRate,
          productsLimit: plan.productsLimit,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم الاشتراك بنجاح',
      data: {
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status,
          autoRenew: subscription.autoRenew,
        },
        plan: {
          code: plan.code,
          nameAr: plan.nameAr,
          commissionRate: plan.commissionRate,
        },
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إنشاء الاشتراك',
        error: { code: 'CREATE_ERROR' },
      },
      { status: 500 }
    );
  }
}
