/**
 * Admin Dashboard - Complete UI
 * لوحة تحكم الأدمن المتكاملة على نمط AblePro
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Store,
  FileText,
  Shield,
  Globe,
  Mail,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { ThemeToggle } from '@/components/shared/theme-toggle';

// بيانات تجريبية
const statsCards = [
  { title: 'إجمالي المبيعات', value: '1,284,500', unit: 'ر.س', change: '+12.5%', isPositive: true, icon: DollarSign, color: 'text-green-500' },
  { title: 'الطلبات', value: '2,847', unit: 'طلب', change: '+8.2%', isPositive: true, icon: ShoppingCart, color: 'text-blue-500' },
  { title: 'المنتجات', value: '12,456', unit: 'منتج', change: '+3.1%', isPositive: true, icon: Package, color: 'text-purple-500' },
  { title: 'المستخدمين', value: '45,231', unit: 'مستخدم', change: '+15.3%', isPositive: true, icon: Users, color: 'text-orange-500' },
];

const salesData = [
  { name: 'يناير', sales: 4000, orders: 240 },
  { name: 'فبراير', sales: 3000, orders: 198 },
  { name: 'مارس', sales: 5000, orders: 320 },
  { name: 'أبريل', sales: 4500, orders: 280 },
  { name: 'مايو', sales: 6000, orders: 390 },
  { name: 'يونيو', sales: 5500, orders: 350 },
  { name: 'يوليو', sales: 7000, orders: 450 },
];

const categoryData = [
  { name: 'إلكترونيات', value: 35, color: '#00A651' },
  { name: 'أزياء', value: 25, color: '#F7941D' },
  { name: 'منزل', value: 20, color: '#00ACC1' },
  { name: 'جمال', value: 15, color: '#FB8C00' },
  { name: 'أخرى', value: 5, color: '#6B6B6B' },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'أحمد محمد', amount: 1250, status: 'تم التوصيل', date: 'منذ 5 دقائق' },
  { id: 'ORD-002', customer: 'سارة علي', amount: 890, status: 'قيد الشحن', date: 'منذ 15 دقيقة' },
  { id: 'ORD-003', customer: 'خالد عبدالله', amount: 2100, status: 'قيد المعالجة', date: 'منذ 30 دقيقة' },
  { id: 'ORD-004', customer: 'نورة سعد', amount: 450, status: 'تم التوصيل', date: 'منذ ساعة' },
  { id: 'ORD-005', customer: 'محمد فهد', amount: 1870, status: 'ملغي', date: 'منذ ساعتين' },
];

const topStores = [
  { name: 'متجر التقنية', sales: 125000, products: 450, rating: 4.8 },
  { name: 'متجر الأناقة', sales: 98000, products: 320, rating: 4.9 },
  { name: 'متجر المنزل العصري', sales: 76000, products: 280, rating: 4.7 },
  { name: 'متجر الجمال', sales: 65000, products: 190, rating: 4.6 },
];

const menuItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin/dashboard', active: true },
  { icon: Users, label: 'المستخدمين', href: '/admin/users' },
  { icon: Store, label: 'المتاجر', href: '/admin/stores' },
  { icon: Package, label: 'المنتجات', href: '/admin/products' },
  { icon: ShoppingCart, label: 'الطلبات', href: '/admin/orders' },
  { icon: DollarSign, label: 'المالية', href: '/admin/finance' },
  { icon: BarChart3, label: 'التقارير', href: '/admin/reports' },
  { icon: Globe, label: 'الصفحة الرئيسية', href: '/admin/homepage' },
  { icon: Shield, label: 'الصلاحيات', href: '/admin/roles' },
  { icon: Settings, label: 'الإعدادات', href: '/admin/settings' },
];

export default function AdminDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'تم التوصيل': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'قيد الشحن': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'قيد المعالجة': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ملغي': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-background border-l transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">س</span>
              </div>
              <span className="text-xl font-bold text-primary">سوق</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>

        {/* User */}
        <div className="p-4 border-t">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">المدير العام</p>
                <p className="text-xs text-muted-foreground truncate">admin@souq.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-background border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">لوحة التحكم</h1>
            <Badge variant="secondary" className="text-xs">الإصدار 1.0</Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث..."
                className="w-64 h-9 pr-9 pl-4 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <span className="text-sm text-muted-foreground">{stat.unit}</span>
                      </div>
                      <div className={`flex items-center gap-1 mt-2 text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{stat.change}</span>
                        <span className="text-muted-foreground">من الشهر الماضي</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>المبيعات</CardTitle>
                  <CardDescription>إجمالي المبيعات الشهرية</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 ml-1" /> تصفية
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 ml-1" /> تصدير
                  </Button>
                </div>
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
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#00A651" 
                        fill="url(#salesGradient)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>المبيعات حسب الفئة</CardTitle>
                <CardDescription>توزيع المبيعات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>أحدث الطلبات</CardTitle>
                  <CardDescription>آخر 5 طلبات</CardDescription>
                </div>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.id} • {order.date}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{order.amount} ر.س</p>
                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Stores */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>أفضل المتاجر</CardTitle>
                  <CardDescription>المتاجر الأكثر مبيعاً</CardDescription>
                </div>
                <Link href="/admin/stores">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topStores.map((store, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{store.name}</p>
                          <p className="text-xs text-muted-foreground">{store.products} منتج</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{(store.sales / 1000).toFixed(0)}K ر.س</p>
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <span>★</span>
                          <span>{store.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">إضافة مستخدم</p>
                  <p className="text-xs text-muted-foreground">مستخدم جديد</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Store className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">متجر جديد</p>
                  <p className="text-xs text-muted-foreground">إضافة متجر</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">تقرير</p>
                  <p className="text-xs text-muted-foreground">إنشاء تقرير</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Globe className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">الصفحة الرئيسية</p>
                  <p className="text-xs text-muted-foreground">تخصيص</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
