'use client';

import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { href: '/about', label: 'من نحن' },
  { href: '/careers', label: 'الوظائف' },
  { href: '/press', label: 'الصحافة' },
  { href: '/blog', label: 'المدونة' },
];

const customerService = [
  { href: '/help', label: 'مركز المساعدة' },
  { href: '/returns', label: 'سياسة الإرجاع' },
  { href: '/shipping', label: 'الشحن والتوصيل' },
  { href: '/faq', label: 'الأسئلة الشائعة' },
];

const legalLinks = [
  { href: '/terms', label: 'شروط الاستخدام' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/cookies', label: 'سياسة ملفات تعريف الارتباط' },
];

const socialLinks = [
  { href: 'https://facebook.com', icon: Facebook, label: 'فيسبوك' },
  { href: 'https://twitter.com', icon: Twitter, label: 'تويتر' },
  { href: 'https://instagram.com', icon: Instagram, label: 'انستغرام' },
  { href: 'https://youtube.com', icon: Youtube, label: 'يوتيوب' },
];

const paymentMethods = [
  { name: 'مدى', icon: '💳' },
  { name: 'فيزا', icon: '💳' },
  { name: 'ماستركارد', icon: '💳' },
  { name: 'أبل باي', icon: '🍎' },
  { name: 'STC Pay', icon: '📱' },
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      {/* Newsletter Section */}
      <div className="bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-start">
              <h3 className="text-lg font-bold text-foreground">اشترك في النشرة البريدية</h3>
              <p className="text-sm text-muted-foreground">
                احصل على آخر العروض والخصومات مباشرة في بريدك
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <Input
                type="email"
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full md:w-72 bg-background"
              />
              <Button className="shrink-0">اشترك</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">سوق</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة تجارة إلكترونية رائدة في المملكة العربية السعودية. نقدم أفضل المنتجات
              بأسعار منافسة مع توصيل سريع وآمن لجميع مناطق المملكة.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr">920012345</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@souq.sa</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-foreground mb-4">خدمة العملاء</h4>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us & Payment */}
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-foreground mb-4">تابعنا على</h4>
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground mb-4">وسائل الدفع</h4>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center gap-1 px-3 py-2 bg-background rounded-md border text-sm"
                    title={method.name}
                  >
                    <span>{method.icon}</span>
                    <span className="text-xs text-muted-foreground">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-start">
              © {new Date().getFullYear()} سوق. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              {legalLinks.map((link, index) => (
                <span key={link.href} className="flex items-center">
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                  {index < legalLinks.length - 1 && (
                    <Separator orientation="vertical" className="h-4 mx-2" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
