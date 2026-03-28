"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ArrowUpRight,
  FileText,
  Store,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Sample data for charts
const salesData = [
  { month: 'يناير', sales: 4500, orders: 45 },
  { month: 'فبراير', sales: 5200, orders: 52 },
  { month: 'مارس', sales: 4800, orders: 48 },
  { month: 'أبريل', sales: 6100, orders: 61 },
  { month: 'مايو', sales: 7200, orders: 72 },
  { month: 'يونيو', sales: 8500, orders: 85 },
  { month: 'يوليو', sales: 9200, orders: 92 },
];

const ordersByStatus = [
  { status: 'قيد الانتظار', count: 12, color: '#FB8C00' },
  { status: 'قيد التجهيز', count: 8, color: '#00ACC1' },
  { status: 'قيد الشحن', count: 5, color: '#7C4DFF' },
  { status: 'تم التسليم', count: 45, color: '#43A047' },
  { status: 'ملغي', count: 3, color: '#E53935' },
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'أحمد محمد',
    total: 450,
    status: 'pending',
    date: '2024-01-15',
    items: 3,
  },
  {
    id: 'ORD-002',
    customer: 'سارة علي',
    total: 1200,
    status: 'processing',
    date: '2024-01-15',
    items: 5,
  },
  {
    id: 'ORD-003',
    customer: 'محمد خالد',
    total: 780,
    status: 'shipped',
    date: '2024-01-14',
    items: 2,
  },
  {
    id: 'ORD-004',
    customer: 'فاطمة أحمد',
    total: 350,
    status: 'delivered',
    date: '2024-01-14',
    items: 1,
  },
  {
    id: 'ORD-005',
    customer: 'عبدالله سعود',
    total: 920,
    status: 'cancelled',
    date: '2024-01-13',
    items: 4,
  },
];

const lowStockProducts = [
  { name: 'قميص قطني أبيض', stock: 2, threshold: 5, sku: 'SH-001' },
  { name: 'حذاء رياضي أسود', stock: 3, threshold: 10, sku: 'SH-002' },
  { name: 'ساعة يد كلاسيك', stock: 1, threshold: 3, sku: 'WA-001' },
  { name: 'نظارة شمسية', stock: 0, threshold: 5, sku: 'GL-001' },
];

const chartConfig = {
  sales: {
    label: 'المبيعات',
    color: '#00A651',
  },
  orders: {
    label: 'الطلبات',
    color: '#F7941D',
  },
} satisfies ChartConfig;

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  processing: 'bg-info text-info-foreground',
  shipped: 'bg-purple-500 text-white',
  delivered: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد التجهيز',
  shipped: 'قيد الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

export default function MerchantDashboardPage() {
  const stats = useMemo(() => [
    {
      title: 'إجمالي المبيعات',
      value: '45,230',
      suffix: 'ر.س',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'الطلبات',
      value: '156',
      suffix: 'طلب',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-info/10 text-info',
    },
    {
      title: 'المنتجات',
      value: '48',
      suffix: 'منتج',
      change: '+2',
      trend: 'up',
      icon: Package,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'التقييم',
      value: '4.8',
      suffix: 'من 5',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'bg-warning/10 text-warning',
    },
  ], []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-primary to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">مرحباً بك، محمد! 👋</h1>
            <p className="text-white/80">
              لديك 12 طلب جديد في انتظار المعالجة اليوم
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              <FileText className="h-4 w-4 ml-2" />
              التقارير
            </Button>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Package className="h-4 w-4 ml-2" />
              إضافة منتج
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${stat.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{stat.change}</span>
                    <span className="text-muted-foreground">من الشهر الماضي</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
            <CardDescription>تتبع أداء مبيعاتك خلال الأشهر الماضية</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A651" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00A651" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#00A651"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>حالة الطلبات</CardTitle>
            <CardDescription>توزيع الطلبات حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.count / 73) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">إجمالي الطلبات</span>
                <span className="font-bold">73 طلب</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>آخر الطلبات</CardTitle>
              <CardDescription>أحدث الطلبات الواردة</CardDescription>
            </div>
            <Link href="/merchant/orders">
              <Button variant="ghost" size="sm">
                عرض الكل
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-rtl">
              {recentOrders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusColors[order.status]}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.customer}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.id} • {order.items} منتجات
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{order.total} ر.س</p>
                      <Badge variant="secondary" className="text-xs">
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                تنبيهات المخزون
              </CardTitle>
              <CardDescription>منتجات تحتاج إلى إعادة تزويد</CardDescription>
            </div>
            <Link href="/merchant/products">
              <Button variant="ghost" size="sm">
                إدارة المخزون
                <ArrowLeft className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress
                        value={(product.stock / product.threshold) * 100}
                        className="h-2 flex-1"
                      />
                      <span className={`text-xs font-medium ${product.stock === 0 ? 'text-destructive' : 'text-warning'}`}>
                        {product.stock}/{product.threshold}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={product.stock === 0 ? 'destructive' : 'secondary'}
                    className="mr-3"
                  >
                    {product.stock === 0 ? 'نفذ' : 'منخفض'}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Package className="h-4 w-4 ml-2" />
              طلب تزويد المخزون
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade to Store Banner */}
      <Card className="bg-gradient-to-l from-accent/10 to-accent/5 border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent/20">
                <Store className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold">ترقية إلى متجر كامل</h3>
                <p className="text-muted-foreground text-sm">
                  احصل على متجر خاص بك بعلامتك التجارية مع ميزات متقدمة
                </p>
                <ul className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    عمولة أقل 10%
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    منتجات غير محدودة
                  </li>
                  <li className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    تحليلات متقدمة
                  </li>
                </ul>
              </div>
            </div>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              طلب الترقية
              <ArrowUpRight className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
