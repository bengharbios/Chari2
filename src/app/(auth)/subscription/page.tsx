'use client';

// =============================================
// صفحة الاشتراكات
// Subscription Page
// =============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap, Crown, Star, Sparkles, Loader2 } from 'lucide-react';
import { PlanType } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface PlanFeature {
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

interface SubscriptionPlan {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string | null;
  priceMonthly: number;
  priceYearly: number;
  productsLimit: number;
  commissionRate: number;
  features: PlanFeature;
  isFeatured: boolean;
  isActive: boolean;
  yearlyDiscount: number;
  monthlySavings: number;
}

interface CurrentPlan {
  code: PlanType;
  nameAr: string;
  nameEn: string;
  productsLimit: number;
  commissionRate: number;
}

interface CurrentSubscription {
  id: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  daysRemaining: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [isOnFreePlan, setIsOnFreePlan] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, currentRes] = await Promise.all([
        fetch('/api/subscriptions/plans'),
        fetch('/api/subscriptions/current'),
      ]);

      const plansData = await plansRes.json();
      const currentData = await currentRes.json();

      if (plansData.success) {
        setPlans(plansData.data.plans);
      }

      if (currentData.success) {
        setCurrentPlan(currentData.data.currentPlan);
        setCurrentSubscription(currentData.data.subscription);
        setIsOnFreePlan(currentData.data.isOnFreePlan);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.code === currentPlan?.code && !isOnFreePlan) {
      return;
    }

    setSubscribing(plan.code);
    
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          isYearly,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // تحديث البيانات
        fetchData();
        // إظهار رسالة نجاح
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('حدث خطأ أثناء الاشتراك');
    } finally {
      setSubscribing(null);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setSubscribing(plan.code);
    
    try {
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPlanId: plan.code,
          isYearly,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchData();
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      alert('حدث خطأ أثناء الترقية');
    } finally {
      setSubscribing(null);
    }
  };

  const getPlanIcon = (code: string) => {
    switch (code) {
      case 'FREE':
        return <Star className="w-6 h-6" />;
      case 'BASIC':
        return <Zap className="w-6 h-6" />;
      case 'PROFESSIONAL':
        return <Sparkles className="w-6 h-6" />;
      case 'PREMIUM':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'مجاني' : `${price.toLocaleString('ar-SA')} ر.س`;
  };

  const isCurrentPlan = (planCode: string) => {
    return currentPlan?.code === planCode;
  };

  const canUpgrade = (planCode: string) => {
    const planOrder = ['FREE', 'BASIC', 'PROFESSIONAL', 'PREMIUM'];
    const currentIndex = planOrder.indexOf(currentPlan?.code || 'FREE');
    const targetIndex = planOrder.indexOf(planCode);
    return targetIndex > currentIndex;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            اختر خطة الاشتراك المناسبة
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ابدأ مجاناً وطور عملك مع خططنا المرنة. عمولات أقل، أرباح أكثر!
          </p>
          
          {/* Current Plan Info */}
          {currentPlan && (
            <div className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <span className="font-medium">خطتك الحالية:</span>
              <Badge variant="secondary">{currentPlan.nameAr}</Badge>
              {currentSubscription && (
                <span className="text-sm">
                  ({currentSubscription.daysRemaining} يوم متبقي)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white rounded-lg p-1 shadow-sm inline-flex gap-1">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !isYearly ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                isYearly ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              سنوي
              <Badge variant="outline" className="bg-green-100 text-green-700 border-0 text-xs">
                وفر 17%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.code}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.isFeatured ? 'border-primary border-2 shadow-lg scale-105' : 'border-gray-200'
              } ${isCurrentPlan(plan.code) ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              {/* Featured Badge */}
              {plan.isFeatured && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center text-xs py-1 font-medium">
                  الأكثر شعبية
                </div>
              )}

              <CardHeader className={plan.isFeatured ? 'pt-8' : ''}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    plan.isFeatured ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getPlanIcon(plan.code)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.nameAr}</CardTitle>
                    {plan.nameEn && (
                      <CardDescription>{plan.nameEn}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      {formatPrice(isYearly ? plan.priceYearly / 12 : plan.priceMonthly)}
                    </span>
                    <span className="text-gray-500 text-sm">/ شهر</span>
                  </div>
                  {isYearly && plan.priceMonthly > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      الدفع السنوي: {formatPrice(plan.priceYearly)}
                    </div>
                  )}
                </div>

                {/* Commission Rate */}
                <div className="bg-amber-50 text-amber-700 rounded-lg p-3 mb-4 text-center">
                  <span className="font-bold text-lg">{(plan.commissionRate * 100).toFixed(0)}%</span>
                  <span className="text-sm mr-1">عمولة</span>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      {plan.productsLimit === -1 
                        ? 'منتجات غير محدودة' 
                        : `حتى ${plan.productsLimit} منتج`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>
                      تحليلات {plan.features.analytics === 'basic' ? 'أساسية' : 
                        plan.features.analytics === 'advanced' ? 'متقدمة' : 'شاملة'}
                    </span>
                  </li>
                  {plan.features.customDomain && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>نطاق مخصص</span>
                    </li>
                  )}
                  {plan.features.apiAccess && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>وصول API</span>
                    </li>
                  )}
                  {plan.features.bulkUpload && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>رفع جماعي للمنتجات</span>
                    </li>
                  )}
                  {plan.features.customTheme && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>تخصيص المظهر</span>
                    </li>
                  )}
                  {plan.features.multiUser && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>مستخدمين متعددين</span>
                    </li>
                  )}
                  {plan.features.reports && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>تقارير مفصلة</span>
                    </li>
                  )}
                  {plan.features.prioritySupport ? (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-primary font-medium">دعم أولوية 24/7</span>
                    </li>
                  ) : (
                    <li className="flex items-center gap-2 text-sm text-gray-400">
                      <X className="w-4 h-4 flex-shrink-0" />
                      <span>دعم أولوية</span>
                    </li>
                  )}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentPlan(plan.code) && !isOnFreePlan ? (
                  <Button className="w-full" variant="outline" disabled>
                    <Check className="w-4 h-4 ml-2" />
                    خطتك الحالية
                  </Button>
                ) : canUpgrade(plan.code) ? (
                  <Button
                    className="w-full"
                    variant={plan.isFeatured ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan)}
                    disabled={subscribing === plan.code}
                  >
                    {subscribing === plan.code ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : null}
                    ترقية الآن
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.isFeatured ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing === plan.code}
                  >
                    {subscribing === plan.code ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : null}
                    {plan.priceMonthly === 0 ? 'ابدأ مجاناً' : 'اشترك الآن'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">مقارنة الميزات</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right p-4 font-medium">الميزة</th>
                    {plans.map(plan => (
                      <th key={plan.code} className={`text-center p-4 font-medium ${
                        isCurrentPlan(plan.code) ? 'bg-primary/5' : ''
                      }`}>
                        {plan.nameAr}
                        {isCurrentPlan(plan.code) && (
                          <Badge variant="secondary" className="mr-2">الحالية</Badge>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-4 font-medium">عدد المنتجات</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4">
                        {plan.productsLimit === -1 ? 'غير محدود' : plan.productsLimit}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium">نسبة العمولة</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4 font-bold text-primary">
                        {(plan.commissionRate * 100).toFixed(0)}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">نطاق مخصص</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4">
                        {plan.features.customDomain ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium">تحليلات متقدمة</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4">
                        {plan.features.analytics !== 'basic' ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">وصول API</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4">
                        {plan.features.apiAccess ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium">رفع جماعي</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4">
                        {plan.features.bulkUpload ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">دعم أولوية</td>
                    {plans.map(plan => (
                      <td key={plan.code} className="text-center p-4">
                        {plan.features.prioritySupport ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">أسئلة شائعة</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل يمكنني تغيير الخطة لاحقاً؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نعم، يمكنك الترقية في أي وقت. سيتم حساب الفرق بشكل تناسبي. يمكنك أيضاً تخفيض الخطة عند نهاية فترة الاشتراك الحالية.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ما الفرق بين العمولة وسعر الاشتراك؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  الاشتراك يمنحك ميزات إضافية ويقلل نسبة العمولة على مبيعاتك. كلما ارتفعت الخطة، قلت العمولة (من 15% إلى 8%).
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">هل هناك فترة تجريبية؟</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  الخطة المجانية تتيح لك تجربة المنصة مع 10 منتجات. يمكنك الترقية في أي وقت للحصول على ميزات أكثر.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
