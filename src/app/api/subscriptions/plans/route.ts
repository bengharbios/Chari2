// =============================================
// API خطط الاشتراك
// Subscription Plans API
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS, SubscriptionPlanDisplay, SubscriptionPlanWithSavings } from '@/types/subscription';

// =============================================
// GET /api/subscriptions/plans
// الحصول على خطط الاشتراك
// =============================================

export async function GET(request: NextRequest) {
  try {
    // جلب الخطط من قاعدة البيانات
    const dbPlans = await db.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    let plans: SubscriptionPlanWithSavings[];

    if (dbPlans.length > 0) {
      // استخدام الخطط من قاعدة البيانات
      plans = dbPlans.map((plan) => {
        const monthlyPrice = plan.priceMonthly;
        const yearlyPrice = plan.priceYearly;
        const yearlyDiscount = monthlyPrice > 0 
          ? Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100)
          : 0;
        const monthlySavings = monthlyPrice > 0 
          ? ((monthlyPrice * 12) - yearlyPrice) / 12
          : 0;

        return {
          id: plan.id,
          code: plan.code,
          nameAr: plan.nameAr,
          nameEn: plan.nameEn,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          productsLimit: plan.productsLimit,
          commissionRate: plan.commissionRate,
          features: JSON.parse(plan.features) as SubscriptionPlanDisplay['features'],
          isFeatured: plan.isFeatured,
          isActive: plan.isActive,
          sortOrder: plan.sortOrder,
          yearlyDiscount,
          monthlySavings,
        };
      });
    } else {
      // استخدام الخطط الثابتة
      plans = Object.entries(SUBSCRIPTION_PLANS).map(([code, plan], index) => {
        const yearlyDiscount = plan.priceMonthly > 0 
          ? Math.round(((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100)
          : 0;
        const monthlySavings = plan.priceMonthly > 0 
          ? ((plan.priceMonthly * 12) - plan.priceYearly) / 12
          : 0;

        return {
          id: code,
          code: code,
          nameAr: plan.nameAr,
          nameEn: plan.nameEn,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          productsLimit: plan.productsLimit,
          commissionRate: plan.commissionRate,
          features: plan.features,
          isFeatured: code === 'PROFESSIONAL',
          isActive: true,
          sortOrder: index,
          yearlyDiscount,
          monthlySavings,
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        plans,
        currentPlanCode: null, // سيتم تحديثه من الاشتراك الحالي
      },
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء جلب خطط الاشتراك',
        error: { code: 'FETCH_ERROR' },
      },
      { status: 500 }
    );
  }
}
