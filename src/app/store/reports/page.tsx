"use client"

import { useState, useMemo } from "react"
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  ChevronDown,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
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
  ComposedChart,
} from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Sample data
const salesData = [
  { name: "يناير", sales: 45000, orders: 120, profit: 12500, customers: 85 },
  { name: "فبراير", sales: 52000, orders: 145, profit: 15200, customers: 98 },
  { name: "مارس", sales: 48000, orders: 132, profit: 13800, customers: 92 },
  { name: "أبريل", sales: 61000, orders: 168, profit: 18600, customers: 115 },
  { name: "مايو", sales: 58000, orders: 156, profit: 16400, customers: 108 },
  { name: "يونيو", sales: 72000, orders: 198, profit: 21500, customers: 142 },
  { name: "يوليو", sales: 68000, orders: 187, profit: 19800, customers: 135 },
  { name: "أغسطس", sales: 75000, orders: 210, profit: 22800, customers: 156 },
  { name: "سبتمبر", sales: 69000, orders: 192, profit: 20100, customers: 140 },
  { name: "أكتوبر", sales: 78000, orders: 218, profit: 24500, customers: 168 },
  { name: "نوفمبر", sales: 85000, orders: 245, profit: 27800, customers: 185 },
  { name: "ديسمبر", sales: 92000, orders: 268, profit: 31200, customers: 198 },
]

const productPerformance = [
  { name: "قميص قطني أبيض", sales: 156, revenue: 13260, profit: 4680, growth: 12.5 },
  { name: "بنطال جينز كلاسيك", sales: 134, revenue: 26800, profit: 8040, growth: 8.2 },
  { name: "جاكيت جلد أسود", sales: 98, revenue: 24500, profit: 9800, growth: -3.4 },
  { name: "حزام جلد فاخر", sales: 87, revenue: 8700, profit: 2610, growth: 15.8 },
  { name: "نظارة شمسية راقية", sales: 76, revenue: 11400, profit: 3800, growth: 5.2 },
  { name: "ساعة يد كلاسيك", sales: 65, revenue: 32500, profit: 13000, growth: 22.1 },
]

const categoryData = [
  { name: "ملابس رجالية", value: 45, revenue: 158000, color: "#00A651" },
  { name: "ملابس نسائية", value: 28, revenue: 98000, color: "#F7941D" },
  { name: "إكسسوارات", value: 18, revenue: 63000, color: "#43A047" },
  { name: "أحذية", value: 9, revenue: 31500, color: "#00ACC1" },
]

const customerData = [
  { name: "يناير", new: 45, returning: 32, total: 77 },
  { name: "فبراير", new: 52, returning: 41, total: 93 },
  { name: "مارس", new: 48, returning: 38, total: 86 },
  { name: "أبريل", new: 61, returning: 49, total: 110 },
  { name: "مايو", new: 58, returning: 45, total: 103 },
  { name: "يونيو", new: 72, returning: 58, total: 130 },
  { name: "يوليو", new: 68, returning: 54, total: 122 },
  { name: "أغسطس", new: 75, returning: 62, total: 137 },
  { name: "سبتمبر", new: 69, returning: 56, total: 125 },
  { name: "أكتوبر", new: 78, returning: 65, total: 143 },
  { name: "نوفمبر", new: 85, returning: 72, total: 157 },
  { name: "ديسمبر", new: 92, returning: 78, total: 170 },
]

const hourlyData = [
  { hour: "00", orders: 5 },
  { hour: "02", orders: 2 },
  { hour: "04", orders: 1 },
  { hour: "06", orders: 8 },
  { hour: "08", orders: 25 },
  { hour: "10", orders: 45 },
  { hour: "12", orders: 58 },
  { hour: "14", orders: 52 },
  { hour: "16", orders: 48 },
  { hour: "18", orders: 62 },
  { hour: "20", orders: 75 },
  { hour: "22", orders: 42 },
]

// Custom Tooltip
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

export default function StoreReportsPage() {
  const [timeRange, setTimeRange] = useState("year")
  const [reportType, setReportType] = useState("sales")

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0)
    const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0)
    const totalProfit = salesData.reduce((sum, d) => sum + d.profit, 0)
    const totalCustomers = salesData.reduce((sum, d) => sum + d.customers, 0)
    const avgOrderValue = totalSales / totalOrders
    
    return {
      totalSales,
      totalOrders,
      totalProfit,
      totalCustomers,
      avgOrderValue,
      profitMargin: (totalProfit / totalSales) * 100,
    }
  }, [])

  const handleExportPDF = () => {
    // In a real app, this would generate a PDF report
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير المبيعات</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; direction: rtl; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #00A651; padding-bottom: 20px; }
            .header h1 { color: #00A651; margin: 0; font-size: 28px; }
            .header p { color: #666; margin: 10px 0 0 0; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-box { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-box h3 { margin: 0 0 10px 0; color: #666; font-size: 14px; }
            .stat-box p { margin: 0; font-size: 24px; font-weight: bold; color: #00A651; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
            th { background: #00A651; color: white; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>تقرير المبيعات السنوي</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <div class="stats-grid">
            <div class="stat-box">
              <h3>إجمالي المبيعات</h3>
              <p>${summaryStats.totalSales.toLocaleString('ar-SA')} ر.س</p>
            </div>
            <div class="stat-box">
              <h3>عدد الطلبات</h3>
              <p>${summaryStats.totalOrders.toLocaleString('ar-SA')}</p>
            </div>
            <div class="stat-box">
              <h3>صافي الربح</h3>
              <p>${summaryStats.totalProfit.toLocaleString('ar-SA')} ر.س</p>
            </div>
            <div class="stat-box">
              <h3>متوسط قيمة الطلب</h3>
              <p>${summaryStats.avgOrderValue.toFixed(0)} ر.س</p>
            </div>
          </div>
          <h2>أداء المنتجات</h2>
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>المبيعات</th>
                <th>الإيرادات</th>
                <th>الربح</th>
                <th>النمو</th>
              </tr>
            </thead>
            <tbody>
              ${productPerformance.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.sales}</td>
                  <td>${p.revenue.toLocaleString('ar-SA')} ر.س</td>
                  <td>${p.profit.toLocaleString('ar-SA')} ر.س</td>
                  <td style="color: ${p.growth > 0 ? 'green' : 'red'}">${p.growth > 0 ? '+' : ''}${p.growth}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <h2>المبيعات حسب الفئة</h2>
          <table>
            <thead>
              <tr>
                <th>الفئة</th>
                <th>النسبة</th>
                <th>الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              ${categoryData.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.value}%</td>
                  <td>${c.revenue.toLocaleString('ar-SA')} ر.س</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>متجر الأناقة - تقرير تم إنشاؤه تلقائياً</p>
          </div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">التقارير</h1>
          <p className="text-muted-foreground">تحليل شامل لأداء متجرك</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
                <ChevronDown className="h-4 w-4 mr-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 ml-2" />
                تصدير PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 ml-2" />
                تصدير Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 ml-2" />
                طباعة التقرير
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100">إجمالي المبيعات</p>
                <p className="text-3xl font-bold mt-1">{summaryStats.totalSales.toLocaleString('ar-SA')}</p>
                <p className="text-sm text-green-100 mt-1">ريال سعودي</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+18.5%</span>
              <span className="text-green-100">من العام الماضي</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100">عدد الطلبات</p>
                <p className="text-3xl font-bold mt-1">{summaryStats.totalOrders.toLocaleString('ar-SA')}</p>
                <p className="text-sm text-blue-100 mt-1">طلب</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <ShoppingCart className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.3%</span>
              <span className="text-blue-100">من العام الماضي</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-100">صافي الربح</p>
                <p className="text-3xl font-bold mt-1">{summaryStats.totalProfit.toLocaleString('ar-SA')}</p>
                <p className="text-sm text-orange-100 mt-1">ريال سعودي</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+22.8%</span>
              <span className="text-orange-100">هامش ربح {summaryStats.profitMargin.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100">العملاء</p>
                <p className="text-3xl font-bold mt-1">{summaryStats.totalCustomers.toLocaleString('ar-SA')}</p>
                <p className="text-sm text-purple-100 mt-1">عميل</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+15.6%</span>
              <span className="text-purple-100">من العام الماضي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>المبيعات والأرباح</CardTitle>
                <CardDescription>تتبع المبيعات وصافي الربح على مدار العام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="sales" fill="#00A651" radius={[4, 4, 0, 0]} name="المبيعات" />
                      <Line type="monotone" dataKey="profit" stroke="#F7941D" strokeWidth={3} name="الربح" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>المبيعات حسب الفئة</CardTitle>
                <CardDescription>توزيع الإيرادات على فئات المنتجات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {categoryData.map((category, index) => (
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
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>أفضل المنتجات أداءً</CardTitle>
                <CardDescription>المنتجات الأكثر مبيعاً وإيرادات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.map((product, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{product.sales} مبيعة</span>
                          <span>{product.revenue.toLocaleString('ar-SA')} ر.س</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge className={cn(
                          product.growth > 0 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        )}>
                          {product.growth > 0 ? <TrendingUp className="h-3 w-3 ml-1" /> : <TrendingDown className="h-3 w-3 ml-1" />}
                          {Math.abs(product.growth)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>مقارنة الإيرادات</CardTitle>
                <CardDescription>مقارنة إيرادات المنتجات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" className="text-xs" width={100} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#00A651" radius={[0, 4, 4, 0]} name="الإيرادات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>نمو العملاء</CardTitle>
                <CardDescription>العملاء الجدد والمستمرين شهرياً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={customerData}>
                      <defs>
                        <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00A651" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00A651" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="returningGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F7941D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F7941D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="new" stroke="#00A651" fill="url(#newGradient)" name="جدد" />
                      <Area type="monotone" dataKey="returning" stroke="#F7941D" fill="url(#returningGradient)" name="مستمرين" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>مؤشرات العملاء</CardTitle>
                <CardDescription>إحصائيات مهمة عن عملائك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 grid-cols-2">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">معدل الاحتفاظ</p>
                    <p className="text-2xl font-bold mt-1">68%</p>
                    <Progress value={68} className="mt-2 h-2" />
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">قيمة العميل مدى الحياة</p>
                    <p className="text-2xl font-bold mt-1">1,250 ر.س</p>
                    <Badge className="mt-2 bg-green-100 text-green-700">+12%</Badge>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">معدل التكرار</p>
                    <p className="text-2xl font-bold mt-1">2.4x</p>
                    <Progress value={48} className="mt-2 h-2" />
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">رضا العملاء</p>
                    <p className="text-2xl font-bold mt-1">4.8/5</p>
                    <Progress value={96} className="mt-2 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>أوقات الذروة</CardTitle>
                <CardDescription>توزيع الطلبات على مدار اليوم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" className="text-xs" tickLine={false} axisLine={false} />
                      <YAxis className="text-xs" tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="orders" fill="#00A651" radius={[4, 4, 0, 0]} name="الطلبات" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأداء</CardTitle>
                <CardDescription>مقارنة مع الفترة السابقة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "المبيعات", current: 803000, previous: 678000, format: (v: number) => `${v.toLocaleString('ar-SA')} ر.س` },
                  { label: "الطلبات", current: 2239, previous: 1895, format: (v: number) => v.toLocaleString('ar-SA') },
                  { label: "العملاء", current: 1551, previous: 1289, format: (v: number) => v.toLocaleString('ar-SA') },
                  { label: "الربح", current: 243800, previous: 185600, format: (v: number) => `${v.toLocaleString('ar-SA')} ر.س` },
                ].map((item, index) => {
                  const change = ((item.current - item.previous) / item.previous) * 100
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <Badge className={change > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.format(item.current)}</span>
                        <span className="text-sm text-muted-foreground">السابق: {item.format(item.previous)}</span>
                      </div>
                      <Progress value={(item.current / item.previous) * 50} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
