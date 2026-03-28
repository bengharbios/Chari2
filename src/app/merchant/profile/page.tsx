"use client";

import { useState } from 'react';
import {
  User,
  Store,
  CreditCard,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  Phone,
  Mail,
  MapPin,
  Edit,
  Camera,
  Plus,
  Trash2,
  Eye,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sample merchant data
const merchantData = {
  user: {
    name: 'محمد أحمد العلي',
    phone: '0501234567',
    email: 'merchant@example.com',
    avatar: null,
  },
  business: {
    name: 'متجر الأمانة',
    commercialRegNumber: '1010123456',
    taxNumber: '310123456789003',
    description: 'متجر متخصص في بيع الملابس والإكسسوارات الرجالية بأعلى جودة وأفضل الأسعار',
    city: 'الرياض',
    verificationStatus: 'verified', // pending, verified, rejected
  },
  bank: {
    bankName: 'البنك الأهلي السعودي',
    accountNumber: '****4567',
    iban: 'SA******4567',
  },
  subscription: {
    plan: 'free',
    productsLimit: 10,
    currentProducts: 8,
    commissionRate: 15,
  },
  stats: {
    totalSales: 45230,
    totalOrders: 156,
    rating: 4.8,
    totalReviews: 89,
    memberSince: '2024-01-01',
  },
};

const documents = [
  {
    id: '1',
    type: 'السجل التجاري',
    status: 'verified',
    uploadedAt: '2024-01-01',
    expiryDate: '2025-01-01',
  },
  {
    id: '2',
    type: 'الشهادة الضريبية',
    status: 'verified',
    uploadedAt: '2024-01-01',
    expiryDate: '2025-01-01',
  },
  {
    id: '3',
    type: 'بطاقة الهوية',
    status: 'verified',
    uploadedAt: '2024-01-01',
    expiryDate: '2030-01-01',
  },
];

const subscriptionPlans = [
  {
    id: 'free',
    name: 'مجاني',
    price: 0,
    period: 'للأبد',
    products: 10,
    commission: 15,
    features: ['10 منتجات', 'عمولة 15%', 'دعم فني أساسي'],
    current: true,
  },
  {
    id: 'basic',
    name: 'أساسي',
    price: 99,
    period: 'شهرياً',
    products: 50,
    commission: 12,
    features: ['50 منتج', 'عمولة 12%', 'دعم فني متقدم', 'تقارير المبيعات'],
    current: false,
  },
  {
    id: 'professional',
    name: 'احترافي',
    price: 249,
    period: 'شهرياً',
    products: 200,
    commission: 10,
    features: ['200 منتج', 'عمولة 10%', 'دعم فني أولوي', 'تحليلات متقدمة', 'أدوات تسويقية'],
    current: false,
    popular: true,
  },
  {
    id: 'premium',
    name: 'مميز',
    price: 499,
    period: 'شهرياً',
    products: -1, // unlimited
    commission: 8,
    features: ['منتجات غير محدودة', 'عمولة 8%', 'دعم فني VIP', 'تحليلات متقدمة', 'أدوات تسويقية', 'متجر مخصص'],
    current: false,
  },
];

const documentStatusColors: Record<string, string> = {
  verified: 'bg-success text-success-foreground',
  pending: 'bg-warning text-warning-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
  expired: 'bg-muted text-muted-foreground',
};

const documentStatusLabels: Record<string, string> = {
  verified: 'موثق',
  pending: 'قيد المراجعة',
  rejected: 'مرفوض',
  expired: 'منتهي',
};

export default function MerchantProfilePage() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    businessName: merchantData.business.name,
    description: merchantData.business.description,
    city: merchantData.business.city,
  });

  const verificationProgress = merchantData.business.verificationStatus === 'verified' ? 100 : 
    merchantData.business.verificationStatus === 'pending' ? 50 : 25;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
          <p className="text-muted-foreground">إدارة معلوماتك واشتراكك</p>
        </div>
        <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="h-4 w-4 ml-2" />
          تعديل الملف
        </Button>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={merchantData.user.avatar || ''} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {merchantData.user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-xl font-bold mt-4">{merchantData.user.name}</h2>
              <p className="text-muted-foreground">{merchantData.business.name}</p>
              
              <div className="flex items-center gap-2 mt-3">
                {merchantData.business.verificationStatus === 'verified' ? (
                  <Badge className="bg-success text-success-foreground">
                    <CheckCircle className="h-3 w-3 ml-1" />
                    موثق
                  </Badge>
                ) : merchantData.business.verificationStatus === 'pending' ? (
                  <Badge className="bg-warning text-warning-foreground">
                    <Clock className="h-3 w-3 ml-1" />
                    قيد التحقق
                  </Badge>
                ) : (
                  <Badge className="bg-destructive text-destructive-foreground">
                    <AlertTriangle className="h-3 w-3 ml-1" />
                    غير موثق
                  </Badge>
                )}
              </div>

              <Separator className="my-4 w-full" />

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{merchantData.user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{merchantData.user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{merchantData.business.city}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">إحصائيات الحساب</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold text-primary">{merchantData.stats.totalSales.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">ر.س مبيعات</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold">{merchantData.stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">طلب</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold text-warning">{merchantData.stats.rating}</p>
              <p className="text-xs text-muted-foreground">تقييم</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-xl">
              <p className="text-2xl font-bold">{merchantData.stats.totalReviews}</p>
              <p className="text-xs text-muted-foreground">تقييم</p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">الاشتراك الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold capitalize">
                  {subscriptionPlans.find(p => p.id === merchantData.subscription.plan)?.name}
                </span>
                <Badge variant="secondary">نشط</Badge>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>المنتجات</span>
                  <span>{merchantData.subscription.currentProducts} / {merchantData.subscription.productsLimit}</span>
                </div>
                <Progress 
                  value={(merchantData.subscription.currentProducts / merchantData.subscription.productsLimit) * 100} 
                  className="h-2"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span>عمولة المنصة</span>
                <span className="font-bold text-primary">{merchantData.subscription.commissionRate}%</span>
              </div>

              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-white"
                onClick={() => setIsUpgradeDialogOpen(true)}
              >
                <ArrowUpRight className="h-4 w-4 ml-2" />
                ترقية الاشتراك
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              المستندات
            </CardTitle>
            <CardDescription>المستندات المقدمة للتوثيق</CardDescription>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 ml-2" />
            رفع مستند
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-xs text-muted-foreground">
                      تاريخ الرفع: {doc.uploadedAt} | ينتهي: {doc.expiryDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={documentStatusColors[doc.status]}>
                    {doc.status === 'verified' && <CheckCircle className="h-3 w-3 ml-1" />}
                    {documentStatusLabels[doc.status]}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            معلومات النشاط التجاري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">اسم النشاط</Label>
                <p className="font-medium">{merchantData.business.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">رقم السجل التجاري</Label>
                <p className="font-medium">{merchantData.business.commercialRegNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">الرقم الضريبي</Label>
                <p className="font-medium">{merchantData.business.taxNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">المدينة</Label>
                <p className="font-medium">{merchantData.business.city}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">وصف النشاط</Label>
                <p className="font-medium">{merchantData.business.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            معلومات البنكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-muted-foreground">اسم البنك</Label>
              <p className="font-medium">{merchantData.bank.bankName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">رقم الحساب</Label>
              <p className="font-medium">{merchantData.bank.accountNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">رقم الآيبان</Label>
              <p className="font-medium">{merchantData.bank.iban}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ترقية الاشتراك</DialogTitle>
            <DialogDescription>
              اختر الخطة المناسبة لاحتياجاتك
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {subscriptionPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id ? 'border-primary ring-2 ring-primary' : ''
                } ${plan.current ? 'opacity-75' : ''} ${plan.popular ? 'border-accent' : ''}`}
                onClick={() => !plan.current && setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="bg-accent text-white text-xs text-center py-1 rounded-t-lg">
                    الأكثر شعبية
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.current && <Badge>الحالي</Badge>}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">ر.س</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              إلغاء
            </Button>
            <Button disabled={!selectedPlan} className="bg-primary">
              طلب الترقية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل الملف</DialogTitle>
            <DialogDescription>
              تعديل معلومات النشاط التجاري
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>اسم النشاط</Label>
              <Input
                value={editForm.businessName}
                onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
              />
            </div>
            <div>
              <Label>المدينة</Label>
              <Input
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
            </div>
            <div>
              <Label>وصف النشاط</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-primary">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفع مستند جديد</DialogTitle>
            <DialogDescription>
              اختر نوع المستند وارفع الملف المطلوب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>نوع المستند</Label>
              <select className="w-full mt-1 p-2 border rounded-lg">
                <option>السجل التجاري</option>
                <option>الشهادة الضريبية</option>
                <option>بطاقة الهوية</option>
                <option>عنوان الوطني</option>
                <option>أخرى</option>
              </select>
            </div>
            <div>
              <Label>الملف</Label>
              <div className="mt-1 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">اسحب الملف هنا أو انقر للاختيار</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG بحد أقصى 5MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-primary">
              رفع المستند
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
