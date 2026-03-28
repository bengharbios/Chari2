/**
 * Buyer Account Dashboard Page
 * Main dashboard with account info, recent orders, wishlist, and loyalty points
 */

'use client';

import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Gift,
  Wallet,
  TrendingUp,
  Package,
  Star,
  ChevronLeft,
  Eye,
  CreditCard,
  Bell,
  Settings,
  Award,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

// Mock data
const userData = {
  name: 'أحمد محمد العتيبي',
  phone: '0512345678',
  email: 'ahmed@example.com',
  avatar: null,
  memberSince: 'يناير 2024',
  totalOrders: 28,
  totalSpent: 4520,
  loyaltyPoints: 1250,
  walletBalance: 350,
  wishlistCount: 5,
  addressesCount: 3,
};

const recentOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    statusLabel: 'تم التوصيل',
    total: 450,
    items: 3,
    image: 'https://picsum.photos/seed/order1/80/80',
  },
  {
    id: 'ORD-002',
    date: '2024-01-18',
    status: 'shipped',
    statusLabel: 'قيد الشحن',
    total: 280,
    items: 2,
    image: 'https://picsum.photos/seed/order2/80/80',
  },
  {
    id: 'ORD-003',
    date: '2024-01-20',
    status: 'processing',
    statusLabel: 'قيد التجهيز',
    total: 195,
    items: 1,
    image: 'https://picsum.photos/seed/order3/80/80',
  },
];

const wishlistItems = [
  {
    id: '1',
    name: 'سماعات لاسلكية بلوتوث',
    price: 299,
    originalPrice: 399,
    image: 'https://picsum.photos/seed/wish1/120/120',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'ساعة ذكية رياضية',
    price: 450,
    originalPrice: null,
    image: 'https://picsum.photos/seed/wish2/120/120',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'حقيبة ظهر جلدية',
    price: 189,
    originalPrice: 250,
    image: 'https://picsum.photos/seed/wish3/120/120',
    rating: 4.2,
  },
];

const loyaltyTiers = [
  { name: 'برونزي', points: 0, color: '#CD7F32' },
  { name: 'فضي', points: 500, color: '#C0C0C0' },
  { name: 'ذهبي', points: 1500, color: '#FFD700' },
  { name: 'بلاتيني', points: 3000, color: '#E5E4E2' },
];

const quickActions = [
  { title: 'طلباتي', href: '/buyer/orders', icon: ShoppingBag, color: 'bg-blue-500' },
  { title: 'عناويني', href: '/buyer/addresses', icon: MapPin, color: 'bg-green-500' },
  { title: 'المفضلة', href: '/buyer/wishlist', icon: Heart, color: 'bg-pink-500' },
  { title: 'محفظتي', href: '/buyer/wallet', icon: Wallet, color: 'bg-amber-500' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'delivered':
      return 'bg-green-500';
    case 'shipped':
      return 'bg-blue-500';
    case 'processing':
      return 'bg-amber-500';
    case 'pending':
      return 'bg-gray-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export default function BuyerAccountPage() {
  // Calculate current tier and progress
  const currentTierIndex = loyaltyTiers.findIndex((tier, index) => {
    const nextTier = loyaltyTiers[index + 1];
    return nextTier ? userData.loyaltyPoints >= tier.points && userData.loyaltyPoints < nextTier.points : true;
  });
  
  const currentTier = loyaltyTiers[Math.max(0, currentTierIndex)];
  const nextTier = loyaltyTiers[currentTierIndex + 1];
  const progressToNextTier = nextTier 
    ? ((userData.loyaltyPoints - currentTier.points) / (nextTier.points - currentTier.points)) * 100 
    : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-l from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary-foreground/30">
                <AvatarImage src={userData.avatar || ''} />
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">
                  {userData.name?.charAt(0) || 'م'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">مرحباً، {userData.name}</h2>
                <p className="text-primary-foreground/80">عضو منذ {userData.memberSince}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="gap-2">
                <Settings className="h-4 w-4" />
                إعدادات الحساب
              </Button>
              <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 gap-2">
                <Bell className="h-4 w-4" />
                الإشعارات
                <Badge className="bg-primary text-primary-foreground ml-1">3</Badge>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{userData.totalOrders}</p>
                <p className="text-sm text-muted-foreground">طلب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{userData.totalSpent}</p>
                <p className="text-sm text-muted-foreground">ر.س إجمالي</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Gift className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{userData.loyaltyPoints}</p>
                <p className="text-sm text-muted-foreground">نقطة ولاء</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{userData.wishlistCount}</p>
                <p className="text-sm text-muted-foreground">منتج مفضل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-foreground">{action.title}</span>
                <ChevronLeft className="h-4 w-4 mr-auto text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Loyalty Points Section */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              نقاط الولاء
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Points */}
            <div className="text-center p-4 rounded-lg bg-gradient-to-l from-primary/10 to-accent/10">
              <p className="text-4xl font-bold text-primary">{userData.loyaltyPoints}</p>
              <p className="text-sm text-muted-foreground">نقطة متاحة</p>
            </div>

            {/* Tier Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: currentTier.color }}>
                  {currentTier.name}
                </span>
                {nextTier && (
                  <span className="text-sm text-muted-foreground" style={{ color: nextTier.color }}>
                    {nextTier.name}
                  </span>
                )}
              </div>
              <Progress value={progressToNextTier} className="h-2" />
              {nextTier && (
                <p className="text-xs text-muted-foreground text-center">
                  متبقي {nextTier.points - userData.loyaltyPoints} نقطة للوصول للمستوى {nextTier.name}
                </p>
              )}
            </div>

            {/* Tier Badges */}
            <div className="flex justify-between pt-2">
              {loyaltyTiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`flex flex-col items-center ${index <= currentTierIndex ? 'opacity-100' : 'opacity-40'}`}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: tier.color, color: '#fff' }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-[10px] mt-1">{tier.name}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Redeem Section */}
            <div className="space-y-2">
              <p className="text-sm font-medium">استبدل نقاطك</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border rounded-lg text-center hover:border-primary cursor-pointer transition-colors">
                  <Percent className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">خصم 10%</p>
                  <p className="text-[10px] text-muted-foreground">500 نقطة</p>
                </div>
                <div className="p-2 border rounded-lg text-center hover:border-primary cursor-pointer transition-colors">
                  <Percent className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-xs">خصم 20%</p>
                  <p className="text-[10px] text-muted-foreground">1000 نقطة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              آخر الطلبات
            </CardTitle>
            <Link href="/buyer/orders">
              <Button variant="ghost" size="sm" className="text-primary">
                عرض الكل
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={order.image}
                      alt="Order"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">#{order.id}</span>
                      <Badge className={`${getStatusColor(order.status)} text-white text-[10px]`}>
                        {order.statusLabel}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items} منتج • {order.total} ر.س
                    </p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <Link href={`/buyer/orders/${order.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wishlist Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-pink-500" />
            قائمة الأمنيات
          </CardTitle>
          <Link href="/buyer/wishlist">
            <Button variant="ghost" size="sm" className="text-primary">
              عرض الكل
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer"
              >
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">{item.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">{item.price} ر.س</span>
                    {item.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {item.originalPrice} ر.س
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">رصيد محفظتك</p>
                <p className="text-3xl font-bold text-foreground">{userData.walletBalance} ر.س</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/buyer/wallet">
                <Button variant="outline" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  سجل المعاملات
                </Button>
              </Link>
              <Button className="gap-2 bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                شحن الرصيد
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
