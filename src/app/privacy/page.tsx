/**
 * سياسة الخصوصية
 * Privacy Policy Page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">سياسة الخصوصية</h1>
          </div>
          <p className="text-muted-foreground">آخر تحديث: مارس 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">مقدمة</h2>
            <p className="text-muted-foreground leading-relaxed">
              في منصة سوق، نلتزم بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">المعلومات التي نجمعها</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>نقوم بجمع المعلومات التالية:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>معلومات الحساب (الاسم، البريد الإلكتروني، رقم الجوال)</li>
                <li>عناوين الشحن والتوصيل</li>
                <li>سجل المشتريات والطلبات</li>
                <li>بيانات الدفع (مشفرة وآمنة)</li>
                <li>معلومات الجهاز والمتصفح</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">كيف نستخدم معلوماتك</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>نستخدم معلوماتك لـ:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>معالجة طلباتك وتوصيلها</li>
                <li>تحسين تجربتك على المنصة</li>
                <li>إرسال تحديثات وعروض (بموافقتك)</li>
                <li>تقديم دعم العملاء</li>
                <li>منع الاحتيال وضمان الأمان</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">حماية البيانات</h2>
            <p className="text-muted-foreground leading-relaxed">
              نستخدم أحدث تقنيات التشفير والأمان لحماية بياناتك. جميع معاملات الدفع مشفرة باستخدام بروتوكول SSL، ونحتفظ ببياناتك في خوادم آمنة.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">مشاركة البيانات</h2>
            <p className="text-muted-foreground leading-relaxed">
              لا نبيع أو نؤجر بياناتك الشخصية. قد نشارك بعض المعلومات مع:
            </p>
            <ul className="list-disc list-inside space-y-1 mr-4 text-muted-foreground">
              <li>شركات الشحن لتوصيل طلباتك</li>
              <li>بوابات الدفع لمعالجة المدفوعات</li>
              <li>الجهات الحكومية عند الضرورة القانونية</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">حقوقك</h2>
            <div className="text-muted-foreground leading-relaxed space-y-2">
              <p>لديك الحق في:</p>
              <ul className="list-disc list-inside space-y-1 mr-4">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح أو تحديث معلوماتك</li>
                <li>طلب حذف حسابك وبياناتك</li>
                <li>الاعتراض على معالجة بياناتك</li>
                <li>إلغاء الاشتراك في النشرة الإخبارية</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-muted-foreground leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. يمكنك تعطيلها من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض وظائف المنصة.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">التحديثات</h2>
            <p className="text-muted-foreground leading-relaxed">
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال المنصة.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">اتصل بنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              إذا كان لديك أي استفسار حول سياسة الخصوصية، يمكنك{' '}
              <Link href="/support" className="text-primary hover:underline">
                التواصل معنا
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
