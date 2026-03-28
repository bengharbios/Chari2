/**
 * الشروط والأحكام
 * Terms and Conditions Page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';

export default function TermsPage() {
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
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">الشروط والأحكام</h1>
          </div>
          <p className="text-muted-foreground">آخر تحديث: مارس 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. قبول الشروط</h2>
            <p className="text-muted-foreground leading-relaxed">
              باستخدامك لمنصة سوق، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. استخدام المنصة</h2>
            <p className="text-muted-foreground leading-relaxed">
              يُسمح لك باستخدام المنصة للأغراض المشروعة فقط. يُحظر استخدام المنصة لأي نشاط غير قانوني أو ضار بالآخرين.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. الحسابات</h2>
            <p className="text-muted-foreground leading-relaxed">
              أنت مسؤول عن الحفاظ على سرية معلومات حسابك وعدم مشاركتها مع الآخرين. يجب عليك إخطارنا فوراً في حال اكتشاف أي استخدام غير مصرح به لحسابك.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. المنتجات والخدمات</h2>
            <p className="text-muted-foreground leading-relaxed">
              نسعى جاهدين لعرض المنتجات بدقة، لكننا لا نضمن أن جميع المعلومات المعروضة خالية من الأخطاء. قد تختلف الألوان والصور عن المنتجات الفعلية.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. الأسعار والدفع</h2>
            <p className="text-muted-foreground leading-relaxed">
              جميع الأسعار المعروضة بالريال السعودي وتشمل ضريبة القيمة المضافة. نحتفظ بالحق في تعديل الأسعار دون إشعار مسبق.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. الشحن والتوصيل</h2>
            <p className="text-muted-foreground leading-relaxed">
              تختلف أوقات التوصيل حسب الموقع الجغرافي. نعمل مع شركات شحن موثوقة لضمان وصول طلباتكم بأمان.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. الإرجاع والاستبدال</h2>
            <p className="text-muted-foreground leading-relaxed">
              يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام، بشرط أن تكون في حالتها الأصلية مع جميع الملحقات.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. الخصوصية</h2>
            <p className="text-muted-foreground leading-relaxed">
              نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. يرجى مراجعة{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                سياسة الخصوصية
              </Link>{' '}
              لمعرفة المزيد.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. التعديلات</h2>
            <p className="text-muted-foreground leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تعديلات على هذه الصفحة.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. الاتصال بنا</h2>
            <p className="text-muted-foreground leading-relaxed">
              إذا كان لديك أي استفسار حول هذه الشروط، يمكنك{' '}
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
