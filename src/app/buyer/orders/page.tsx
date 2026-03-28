/**
 * Buyer Orders Page
 * Order list with statuses, tracking timeline, and details
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  RefreshCcw,
  MapPin,
  Calendar,
  CreditCard,
  ChevronLeft,
  Filter,
  Search,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock orders data
const ordersData = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-20',
    status: 'processing',
    statusLabel: 'قيد التجهيز',
    total: 195,
    subtotal: 169.57,
    vat: 25.43,
    shipping: 0,
    paymentMethod: 'بطاقة مدى',
    paymentStatus: 'paid',
    items: [
      {
        id: '1',
        name: 'سماعات لاسلكية بلوتوث برو',
        price: 195,
        quantity: 1,
        image: 'https://picsum.photos/seed/item1/120/120',
        variant: 'أسود',
      },
    ],
    address: {
      city: 'الرياض',
      district: 'النرجس',
      street: 'شارع الأمير سلطان',
    },
    tracking: [
      { status: 'تم استلام الطلب', date: '2024-01-20 10:30', completed: true },
      { status: 'جاري التجهيز', date: '2024-01-20 14:00', completed: true },
      { status: 'جاري الشحن', date: '', completed: false },
      { status: 'تم التوصيل', date: '', completed: false },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-18',
    status: 'shipped',
    statusLabel: 'قيد الشحن',
    total: 280,
    subtotal: 243.48,
    vat: 36.52,
    shipping: 0,
    paymentMethod: 'الدفع عند الاستلام',
    paymentStatus: 'pending',
    items: [
      {
        id: '2',
        name: 'ساعة ذكية رياضية',
        price: 180,
        quantity: 1,
        image: 'https://picsum.photos/seed/item2/120/120',
        variant: 'أسود',
      },
      {
        id: '3',
        name: 'حامل ساعة ذكية',
        price: 100,
        quantity: 1,
        image: 'https://picsum.photos/seed/item3/120/120',
        variant: 'أبيض',
      },
    ],
    address: {
      city: 'جدة',
      district: 'الحمرة',
      street: 'شارع الأمير سلطان',
    },
    tracking: [
      { status: 'تم استلام الطلب', date: '2024-01-18 09:00', completed: true },
      { status: 'جاري التجهيز', date: '2024-01-18 12:00', completed: true },
      { status: 'جاري الشحن', date: '2024-01-19 08:00', completed: true },
      { status: 'في الطريق إليك', date: '2024-01-20 10:00', completed: true },
      { status: 'تم التوصيل', date: '', completed: false },
    ],
    trackingNumber: 'SMSA123456789',
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-15',
    status: 'delivered',
    statusLabel: 'تم التوصيل',
    total: 450,
    subtotal: 391.30,
    vat: 58.70,
    shipping: 0,
    paymentMethod: 'Apple Pay',
    paymentStatus: 'paid',
    items: [
      {
        id: '4',
        name: 'حقيبة ظهر جلدية فاخرة',
        price: 250,
        quantity: 1,
        image: 'https://picsum.photos/seed/item4/120/120',
        variant: 'بني',
      },
      {
        id: '5',
        name: 'محفظة جلدية رجالية',
        price: 150,
        quantity: 1,
        image: 'https://picsum.photos/seed/item5/120/120',
        variant: 'أسود',
      },
      {
        id: '6',
        name: 'حزام جلدي',
        price: 50,
        quantity: 1,
        image: 'https://picsum.photos/seed/item6/120/120',
        variant: 'بني',
      },
    ],
    address: {
      city: 'الرياض',
      district: 'العليا',
      street: 'شارع التحلية',
    },
    tracking: [
      { status: 'تم استلام الطلب', date: '2024-01-15 14:00', completed: true },
      { status: 'جاري التجهيز', date: '2024-01-15 16:00', completed: true },
      { status: 'جاري الشحن', date: '2024-01-16 09:00', completed: true },
      { status: 'في الطريق إليك', date: '2024-01-17 10:00', completed: true },
      { status: 'تم التوصيل', date: '2024-01-17 15:30', completed: true },
    ],
    trackingNumber: 'ARAMEX987654321',
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-10',
    status: 'cancelled',
    statusLabel: 'ملغي',
    total: 320,
    subtotal: 278.26,
    vat: 41.74,
    shipping: 0,
    paymentMethod: 'بطاقة ائتمان',
    paymentStatus: 'refunded',
    items: [
      {
        id: '7',
        name: 'نظارة شمسية رجالية',
        price: 320,
        quantity: 1,
        image: 'https://picsum.photos/seed/item7/120/120',
        variant: 'أسود',
      },
    ],
    address: {
      city: 'الدمام',
      district: 'الشاطئ',
      street: 'شارع الملك فهد',
    },
    tracking: [
      { status: 'تم استلام الطلب', date: '2024-01-10 11:00', completed: true },
      { status: 'تم الإلغاء', date: '2024-01-10 14:00', completed: true },
    ],
    cancellationReason: 'تم الإلغاء بناءً على طلب العميل',
  },
];

const statusConfig = {
  pending: { color: 'bg-gray-500', icon: Clock },
  processing: { color: 'bg-amber-500', icon: Package },
  shipped: { color: 'bg-blue-500', icon: Truck },
  delivered: { color: 'bg-green-500', icon: CheckCircle },
  cancelled: { color: 'bg-red-500', icon: XCircle },
};

const paymentStatusConfig = {
  pending: { label: 'قيد الانتظار', color: 'text-amber-500' },
  paid: { label: 'مدفوع', color: 'text-green-500' },
  refunded: { label: 'مسترد', color: 'text-blue-500' },
  failed: { label: 'فشل', color: 'text-red-500' },
};

function OrderTrackingTimeline({ tracking }: { tracking: typeof ordersData[0]['tracking'] }) {
  return (
    <div className="relative">
      {tracking.map((step, index) => (
        <div key={index} className="flex gap-4 pb-4 last:pb-0">
          {/* Timeline connector */}
          {index < tracking.length - 1 && (
            <div
              className={`absolute right-[15px] top-8 h-full w-0.5 ${
                step.completed ? 'bg-primary' : 'bg-muted'
              }`}
              style={{ height: 'calc(100% - 32px)' }}
            />
          )}
          
          {/* Status icon */}
          <div
            className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center ${
              step.completed ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {step.completed ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 pt-1">
            <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.status}
            </p>
            {step.date && (
              <p className="text-sm text-muted-foreground">{step.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderDetailsDialog({ order }: { order: typeof ordersData[0] }) {
  const statusStyle = statusConfig[order.status as keyof typeof statusConfig];
  const paymentStyle = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          <Eye className="h-4 w-4" />
          التفاصيل
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            تفاصيل الطلب #{order.id}
            <Badge className={`${statusStyle.color} text-white`}>
              {order.statusLabel}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.paymentMethod}</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-3">المنتجات</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-2 rounded-lg border">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">اللون: {item.variant}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-primary">{item.price} ر.س</span>
                        <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span>{order.subtotal} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                <span>{order.vat} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="text-green-500">مجاناً</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{order.total} ر.س</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">حالة الدفع:</span>
                <span className={`text-sm font-medium ${paymentStyle.color}`}>
                  {paymentStyle.label}
                </span>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div>
              <h4 className="font-medium mb-2">عنوان التوصيل</h4>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {order.address.city}، {order.address.district}، {order.address.street}
                </span>
              </div>
            </div>

            <Separator />

            {/* Tracking */}
            <div>
              <h4 className="font-medium mb-4">تتبع الطلب</h4>
              {order.trackingNumber && (
                <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">رقم التتبع</p>
                    <p className="font-mono font-medium">{order.trackingNumber}</p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    نسخ
                  </Button>
                </div>
              )}
              <OrderTrackingTimeline tracking={order.tracking} />
            </div>

            {order.cancellationReason && (
              <>
                <Separator />
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-medium text-destructive">سبب الإلغاء</p>
                  <p className="text-sm text-muted-foreground">{order.cancellationReason}</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {order.status === 'delivered' && (
            <Button className="flex-1 gap-2">
              <RefreshCcw className="h-4 w-4" />
              إعادة الطلب
            </Button>
          )}
          {order.status === 'processing' && (
            <Button variant="destructive" className="flex-1">
              إلغاء الطلب
            </Button>
          )}
          <Button variant="outline" className="flex-1 gap-2">
            <MessageCircle className="h-4 w-4" />
            تواصل معنا
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function BuyerOrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = ordersData.filter((order) => {
    if (activeTab !== 'all' && order.status !== activeTab) return false;
    if (searchQuery && !order.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: ordersData.length,
    processing: ordersData.filter((o) => o.status === 'processing').length,
    shipped: ordersData.filter((o) => o.status === 'shipped').length,
    delivered: ordersData.filter((o) => o.status === 'delivered').length,
    cancelled: ordersData.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">طلباتي</h1>
          <p className="text-muted-foreground">تتبع وإدارة جميع طلباتك</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Input
              placeholder="بحث برقم الطلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-9 w-full sm:w-64"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-2">
            الكل
            <Badge variant="secondary" className="h-5 px-1.5">{statusCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="processing" className="gap-2">
            قيد التجهيز
            <Badge variant="secondary" className="h-5 px-1.5">{statusCounts.processing}</Badge>
          </TabsTrigger>
          <TabsTrigger value="shipped" className="gap-2">
            قيد الشحن
            <Badge variant="secondary" className="h-5 px-1.5">{statusCounts.shipped}</Badge>
          </TabsTrigger>
          <TabsTrigger value="delivered" className="gap-2">
            تم التوصيل
            <Badge variant="secondary" className="h-5 px-1.5">{statusCounts.delivered}</Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="gap-2">
            ملغي
            <Badge variant="secondary" className="h-5 px-1.5">{statusCounts.cancelled}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">لا توجد طلبات</h3>
                <p className="text-muted-foreground text-center mb-4">
                  لم تقم بأي طلبات بعد. ابدأ التسوق الآن!
                </p>
                <Link href="/">
                  <Button className="gap-2">
                    تسوق الآن
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusStyle = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = statusStyle.icon;
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/50 border-b">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full ${statusStyle.color} flex items-center justify-center`}>
                            <StatusIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">#{order.id}</span>
                              <Badge className={`${statusStyle.color} text-white text-[10px]`}>
                                {order.statusLabel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>{order.date}</span>
                              <span>•</span>
                              <span>{order.items.length} منتج</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <OrderDetailsDialog order={order} />
                          {order.status === 'shipped' && order.trackingNumber && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Truck className="h-4 w-4" />
                              تتبع الشحن
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="p-4">
                        <div className="flex flex-wrap gap-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="relative">
                              <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              {item.quantity > 1 && (
                                <span className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{order.address.city}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CreditCard className="h-4 w-4" />
                              <span>{order.paymentMethod}</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-muted-foreground">الإجمالي</p>
                            <p className="text-lg font-bold text-primary">{order.total} ر.س</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
