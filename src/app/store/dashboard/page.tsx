"use client"

import { useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Eye,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for charts
const salesData = [
  { name: "يناير", sales: 4500, orders: 120 },
  { name: "فبراير", sales: 5200, orders: 145 },
  { name: "مارس", sales: 4800, orders: 132 },
  { name: "أبريل", sales: 6100, orders: 168 },
  { name: "مايو", sales: 5800, orders: 156 },
  { name: "يونيو", sales: 7200, orders: 198 },
  { name: "يوليو", sales: 6800, orders: 187 },
]

const revenueByCategory = [
  { name: "ملابس رجالية", value: 35, color: "#00A651" },
  { name: "ملابس نسائية", value: 28, color: "#F7941D" },
  { name: "إكسسوارات", value: 20, color: "#43A047" },
  { name: "أحذية", value: 17, color: "#00ACC1" },
]

const weeklyData = [
  { day: "السبت", sales: 1200, visits: 450 },
  { day: "الأحد", sales: 1800, visits: 620 },
  { day: "الاثنين", sales: 1400, visits: 480 },
  { day: "الثلاثاء", sales: 2100, visits: 750 },
  { day: "الأربعاء", sales: 1900, visits: 680 },
  { day: "الخميس", sales: 2500, visits: 890 },
  { day: "الجمعة", sales: 3200, visits: 1100 },
]

const recentOrders = [
  { id: "ORD-1234", customer: "أحمد محمد", amount: 450, status: "delivered", items: 3, date: "منذ 5 دقائق" },
  { id: "ORD-1233", customer: "سارة أحمد", amount: 780, status: "shipped", items: 5, date: "منذ 30 دقيقة" },
  { id: "ORD-1232", customer: "خالد العتيبي", amount: 320, status: "processing", items: 2, date: "منذ ساعة" },
  { id: "ORD-1231", customer: "نورة السالم", amount: 890, status: "pending", items: 4, date: "منذ ساعتين" },
  { id: "ORD-1230", customer: "محمد الغامدي", amount: 560, status: "delivered", items: 3, date: "منذ 3 ساعات" },
]

const topProducts = [
  { id: 1, name: "قميص قطني أبيض", sales: 156, revenue: 15600, stock: 45, trend: 12 },
  { id: 2, name: "بنطال جينز كلاسيك", sales: 134, revenue: 26800, stock: 32, trend: 8 },
  { id: 3, name: "جاكيت جلد أسود", sales: 98, revenue: 29400, stock: 18, trend: -3 },
  { id: 4, name: "حزام جلد فاخر", sales: 87, revenue: 8700, stock: 65, trend: 15 },
  { id: 5, name: "نظارة شمسية راقية", sales: 76, revenue: 15200, stock: 8, trend: 5 },
]

const lowStockProducts = [
  { id: 1, name: "قميص قطني أبيض - XL", stock: 3, threshold: 5, sku: "SKU-001-XL" },
  { id: 2, name: "جاكيت جلد أسود - L", stock: 2, threshold: 5, sku: "SKU-003-L" },
  { id: 3, name: "نظارة شمسية راقية", stock: 8, threshold: 10, sku: "SKU-005" },
  { id: 4, name: "ساعة يد كلاسيك", stock: 4, threshold: 5, sku: "SKU-006" },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    pending: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }
  return colors[status] || colors.pending
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    delivered: "تم التسليم",
    shipped: "تم الشحن",
    processing: "قيد التجهيز",
    pending: "قيد الانتظار",
    cancelled: "ملغي",
  }
  return texts[status] || status
}

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString('ar-SA')}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function StoreDashboardPage() {
  const stats = useMemo(() => [
    {
      title: "إجمالي المبيعات",
      value: "35,780",
      unit: "ر.س",
      change: 12.5,
      changeType: "positive",
      icon: DollarSign,
      iconColor: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "الطلبات",
      value: "1,248",
      unit: "طلب",
      change: 8.2,
      changeType: "positive",
      icon: ShoppingCart,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "المنتجات",
      value: "156",
      unit: "منتج",
      change: 3.1,
      changeType: "positive",
      icon: Package,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "العملاء",
      value: "892",
      unit: "عميل",
      change: -2.4,
      changeType: "negative",
      icon: Users,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ], [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في لوحة تحكم متجرك</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 ml-2" />
            آخر 30 يوم
          </Button>
          <Button size="sm">
            تحميل التقرير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-sm text-muted-foreground">{stat.unit}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.changeType === "positive" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{stat.change}%</span>
                    <span className="text-muted-foreground">vs الشهر الماضي</span>
                  </div>
                </div>
                <div className={cn("p-3 rounded-full", stat.bgColor)}>
                  <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Sales Chart - Larger */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>المبيعات الشهرية</CardTitle>
              <CardDescription>متابعة المبيعات والطلبات خلال الأشهر الماضية</CardDescription>
            </div>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A651" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00A651" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#00A651"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                    name="المبيعات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>المبيعات حسب الفئة</CardTitle>
            <CardDescription>توزيع الإيرادات على فئات المنتجات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance & Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>أداء الأسبوع</CardTitle>
            <CardDescription>المبيعات والزيارات خلال الأسبوع الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="sales" fill="#00A651" radius={[4, 4, 0, 0]} name="المبيعات" />
                  <Bar dataKey="visits" fill="#F7941D" radius={[4, 4, 0, 0]} name="الزيارات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>آخر الطلبات</CardTitle>
              <CardDescription>أحدث الطلبات في متجرك</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/store/orders">عرض الكل</a>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount.toLocaleString('ar-SA')} ر.س</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Inventory Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>أفضل المنتجات</CardTitle>
              <CardDescription>المنتجات الأكثر مبيعاً</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/store/products">عرض الكل</a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} مبيعة • {product.revenue.toLocaleString('ar-SA')} ر.س
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    product.trend > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {product.trend > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{Math.abs(product.trend)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                تنبيهات المخزون
              </CardTitle>
              <CardDescription>منتجات تحتاج لإعادة تغذية</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              {lowStockProducts.length} تنبيه
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-yellow-600">
                        {product.stock} متبقي
                      </span>
                      <span className="text-xs text-muted-foreground">
                        من {product.threshold}
                      </span>
                    </div>
                    <Progress
                      value={(product.stock / product.threshold) * 100}
                      className="h-2 mt-1"
                      indicatorClassName={cn(
                        product.stock <= product.threshold / 2
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      )}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    طلب
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="/store/products?filter=low-stock">
                عرض كل التنبيهات
                <ArrowLeft className="h-4 w-4 mr-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">معدل التحويل</p>
                <p className="text-3xl font-bold mt-1">3.2%</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-green-100 mt-2">+0.5% من الأسبوع الماضي</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">متوسط قيمة الطلب</p>
                <p className="text-3xl font-bold mt-1">286 ر.س</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-orange-100 mt-2">+12% من الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">تقييم المتجر</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold">4.8</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm text-blue-100 mt-2">من 256 تقييم</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
