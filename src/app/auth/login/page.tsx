/**
 * Login Page - Complete Authentication Flow with Demo Accounts
 * نظام المصادقة المتكامل مع حسابات تجريبية
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Phone, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2,
  User,
  Store,
  UserCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { OTPInput } from '@/components/auth/otp-input';
import { PasswordInput } from '@/components/auth/password-input';
import { PhoneInput } from '@/components/auth/phone-input';

type Step = 'phone' | 'otp' | 'password' | 'account-type';
type AuthMode = 'login' | 'register';

const accountTypes = [
  { 
    id: 'BUYER', 
    name: 'مشتري', 
    description: 'تسوق واشترِ منتجات من المتاجر المختلفة',
    icon: User,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600'
  },
  { 
    id: 'MERCHANT', 
    name: 'تاجر مستقل', 
    description: 'ابدأ البيع بسرعة مع إمكانيات محدودة',
    icon: UserCircle,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
  },
  { 
    id: 'STORE', 
    name: 'متجر', 
    description: 'متجر كامل مع فوترة متقدمة وتقارير',
    icon: Store,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
  },
];

// الحسابات التجريبية
const DEMO_ACCOUNTS = [
  { 
    type: 'BUYER', 
    name: 'مشتري', 
    phone: '0500000001', 
    password: 'Demo@123456',
    icon: '🛒',
    dashboard: '/buyer/account',
    color: 'bg-green-500 hover:bg-green-600'
  },
  { 
    type: 'MERCHANT', 
    name: 'تاجر مستقل', 
    phone: '0500000002', 
    password: 'Demo@123456',
    icon: '📦',
    dashboard: '/merchant/dashboard',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  { 
    type: 'STORE', 
    name: 'متجر', 
    phone: '0500000003', 
    password: 'Demo@123456',
    icon: '🏪',
    dashboard: '/store/dashboard',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  { 
    type: 'ADMIN', 
    name: 'مدير النظام', 
    phone: '0500000000', 
    password: 'Admin@123456',
    icon: '⚙️',
    dashboard: '/admin/dashboard',
    color: 'bg-red-500 hover:bg-red-600'
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  
  // Form data
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('BUYER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Timer for OTP resend
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // تسجيل دخول سريع بحساب تجريبي
  const handleDemoLogin = async (account: typeof DEMO_ACCOUNTS[0]) => {
    setDemoLoading(account.type);
    try {
      // تسجيل الدخول مباشرة (الحسابات التجريبية موجودة مسبقاً)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: account.phone, 
          password: account.password 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`تم تسجيل الدخول كـ ${account.name}`);
        router.push(account.dashboard);
      } else {
        toast.error(data.error || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      console.error('Error demo login:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setDemoLoading(null);
    }
  };

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: mode === 'login' ? 'LOGIN' : 'PHONE_VERIFICATION' }),
      });
      
      if (response.ok) {
        setStep('otp');
        setCountdown(60);
        toast.success('تم إرسال رمز التحقق');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('فشل إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isNewUser) {
          setStep('account-type');
        } else {
          toast.success('تم تسجيل الدخول بنجاح');
          router.push(getDashboardPath(data.userType));
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('فشل التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('تم تسجيل الدخول بنجاح');
        router.push(getDashboardPath(data.userType));
      } else {
        toast.error(data.error || 'رقم الجوال أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name,
          email,
          userType: selectedAccountType,
          password,
        }),
      });
      
      if (response.ok) {
        toast.success('تم إنشاء الحساب بنجاح');
        router.push(getDashboardPath(selectedAccountType));
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('فشل إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (userType: string) => {
    switch (userType) {
      case 'ADMIN': return '/admin/dashboard';
      case 'MERCHANT': return '/merchant/dashboard';
      case 'STORE': return '/store/dashboard';
      default: return '/buyer/account';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">س</span>
            </div>
            <span className="text-3xl font-bold text-primary">سوق</span>
          </Link>
        </div>

        {/* Demo Accounts Buttons */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
              دخول سريع - حسابات تجريبية
            </CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-500">
              اضغط على زر الحساب للدخول مباشرة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.type}
                  className={`${account.color} text-white h-auto py-3 flex flex-col gap-1`}
                  onClick={() => handleDemoLogin(account)}
                  disabled={demoLoading !== null}
                >
                  {demoLoading === account.type ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span className="text-2xl">{account.icon}</span>
                      <span className="font-medium">{account.name}</span>
                    </>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {step === 'phone' && (mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
              {step === 'otp' && 'تحقق من الرقم'}
              {step === 'password' && 'كلمة المرور'}
              {step === 'account-type' && 'اختر نوع الحساب'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' && 'أدخل رقم جوالك للمتابعة'}
              {step === 'otp' && `أدخل الرمز المرسل إلى ${phone}`}
              {step === 'password' && 'أدخل كلمة المرور للمتابعة'}
              {step === 'account-type' && 'حدد نوع حسابك للبدء'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4">
            {/* Step: Phone Input */}
            {step === 'phone' && (
              <div className="space-y-4">
                <Tabs value={mode} onValueChange={(v) => setMode(v as AuthMode)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">تسجيل دخول</TabsTrigger>
                    <TabsTrigger value="register">حساب جديد</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <Button 
                  className="w-full h-11"
                  onClick={handleSendOTP}
                  disabled={isLoading || phone.length < 10}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الإرسال...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 ml-2" /> إرسال رمز التحقق</>
                  )}
                </Button>

                {mode === 'login' && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setStep('password')}
                  >
                    <Lock className="w-4 h-4 ml-2" /> الدخول بكلمة المرور
                  </Button>
                )}
              </div>
            )}

            {/* Step: OTP Verification */}
            {step === 'otp' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  className="w-full h-11"
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length < 6}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التحقق...</>
                  ) : (
                    'تحقق'
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Button 
                    variant="link" 
                    className="text-sm"
                    onClick={handleSendOTP}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `إعادة الإرسال (${countdown}s)` : 'إعادة إرسال الرمز'}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="text-sm"
                    onClick={() => setStep('phone')}
                  >
                    <ArrowLeft className="w-4 h-4 ml-2" /> تغيير الرقم
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Password Login */}
            {step === 'password' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    placeholder="أدخل كلمة المرور"
                  />
                </div>

                <Button 
                  className="w-full h-11"
                  onClick={handlePasswordLogin}
                  disabled={isLoading || !phone || !password}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الدخول...</>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={handleSendOTP}
                  >
                    الدخول بالرمز
                  </Button>
                  <Link href="/auth/forgot-password" className="text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>
            )}

            {/* Step: Account Type Selection */}
            {step === 'account-type' && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {accountTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedAccountType(type.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-right ${
                        selectedAccountType === type.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type.color}`}>
                        <type.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      {selectedAccountType === type.id && (
                        <Badge variant="default" className="bg-primary">محدد</Badge>
                      )}
                    </button>
                  ))}
                </div>

                {selectedAccountType !== 'BUYER' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة المرور</Label>
                      <PasswordInput
                        value={password}
                        onChange={setPassword}
                        placeholder="أدخل كلمة مرور قوية"
                      />
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-11"
                  onClick={handleRegister}
                  disabled={isLoading || (selectedAccountType !== 'BUYER' && (!name || !password))}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التسجيل...</>
                  ) : (
                    'إنشاء الحساب'
                  )}
                </Button>
              </div>
            )}

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              بالمتابعة، أنت توافق على{' '}
              <Link href="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
              {' '}و{' '}
              <Link href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</Link>
            </p>
          </CardContent>
        </Card>

        {/* Help */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          هل تحتاج مساعدة؟{' '}
          <Link href="/support" className="text-primary hover:underline">تواصل معنا</Link>
        </div>
      </div>
    </div>
  );
}
