"use client"

import { useState, useMemo, useRef } from "react"
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronDown,
  FileText,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  ArrowLeftRight,
  MessageSquare,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"

// Sample orders data
const orders = [
  {
    id: "ORD-1234",
    customer: { name: "أحمد محمد", phone: "0501234567", email: "ahmed@example.com" },
    items: [
      { name: "قميص قطني أبيض - XL", quantity: 2, price: 85, total: 170 },
      { name: "بنطال جينز كلاسيك - 32", quantity: 1, price: 200, total: 200 },
    ],
    subtotal: 370,
    shipping: 25,
    discount: 0,
    total: 395,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "مدى",
    shippingAddress: "الرياض، حي النزهة، شارع الملك فهد، مبنى 15",
    notes: "يرجى التوصيل قبل 5 مساءً",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-17T14:20:00",
  },
  {
    id: "ORD-1233",
    customer: { name: "سارة أحمد", phone: "0559876543", email: "sara@example.com" },
    items: [
      { name: "فستان سهرة أنيق - M", quantity: 1, price: 380, total: 380 },
      { name: "حقيبة يد جلدية", quantity: 1, price: 350, total: 350 },
    ],
    subtotal: 730,
    shipping: 0,
    discount: 50,
    total: 680,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Apple Pay",
    shippingAddress: "جدة، حي الحمراء، شارع الأندلس",
    notes: "",
    createdAt: "2024-01-15T09:15:00",
    updatedAt: "2024-01-16T11:00:00",
  },
  {
    id: "ORD-1232",
    customer: { name: "خالد العتيبي", phone: "0567890123", email: "khaled@example.com" },
    items: [
      { name: "جاكيت جلد أسود - L", quantity: 1, price: 250, total: 250 },
    ],
    subtotal: 250,
    shipping: 30,
    discount: 0,
    total: 280,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "بطاقة ائتمان",
    shippingAddress: "الدمام، حي الفيصلية",
    notes: "تغليف هدايا",
    createdAt: "2024-01-15T08:00:00",
    updatedAt: "2024-01-15T08:00:00",
  },
  {
    id: "ORD-1231",
    customer: { name: "نورة السالم", phone: "0543210987", email: "noura@example.com" },
    items: [
      { name: "نظارة شمسية راقية", quantity: 2, price: 150, total: 300 },
      { name: "ساعة يد كلاسيك", quantity: 1, price: 500, total: 500 },
    ],
    subtotal: 800,
    shipping: 0,
    discount: 100,
    total: 700,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "الدفع عند الاستلام",
    shippingAddress: "مكة المكرمة، حي العزيزية",
    notes: "",
    createdAt: "2024-01-14T22:30:00",
    updatedAt: "2024-01-14T22:30:00",
  },
  {
    id: "ORD-1230",
    customer: { name: "محمد الغامدي", phone: "0509876543", email: "mohammed@example.com" },
    items: [
      { name: "حزام جلد فاخر", quantity: 2, price: 100, total: 200 },
    ],
    subtotal: 200,
    shipping: 20,
    discount: 0,
    total: 220,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "STC Pay",
    shippingAddress: "الطائف، حي الشفا",
    notes: "",
    createdAt: "2024-01-14T18:45:00",
    updatedAt: "2024-01-16T10:00:00",
  },
  {
    id: "ORD-1229",
    customer: { name: "فاطمة الزهراني", phone: "0532109876", email: "fatima@example.com" },
    items: [
      { name: "فستان سهرة أنيق - S", quantity: 1, price: 380, total: 380 },
    ],
    subtotal: 380,
    shipping: 25,
    discount: 0,
    total: 405,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "بطاقة ائتمان",
    shippingAddress: "الرياض، حي السليمانية",
    notes: "تم الإلغاء من قبل العميل",
    createdAt: "2024-01-14T14:20:00",
    updatedAt: "2024-01-14T16:00:00",
  },
]

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  pending: { label: "قيد الانتظار", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: Clock },
  processing: { label: "قيد التجهيز", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Package },
  shipped: { label: "تم الشحن", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  delivered: { label: "تم التسليم", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  cancelled: { label: "ملغي", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  returned: { label: "مرتجع", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: ArrowLeftRight },
}

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "قيد الانتظار", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  paid: { label: "مدفوع", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  failed: { label: "فشل", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  refunded: { label: "مسترد", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
}

export default function StoreOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.includes(searchQuery) ||
        order.customer.phone.includes(searchQuery)
      const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
      const matchesPayment = selectedPaymentStatus === "all" || order.paymentStatus === selectedPaymentStatus
      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [searchQuery, selectedStatus, selectedPaymentStatus])

  // Stats
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  }), [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const handlePrintInvoice = () => {
    if (selectedOrder) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <title>فاتورة - ${selectedOrder.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00A651; padding-bottom: 20px; }
              .header h1 { color: #00A651; margin: 0; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
              .info-box h3 { margin: 0 0 10px 0; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
              th { background: #00A651; color: white; }
              .total-row td { font-weight: bold; background: #f0f0f0; }
              .footer { margin-top: 40px; text-align: center; color: #666; }
              @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>فاتورة</h1>
              <p>رقم الطلب: ${selectedOrder.id}</p>
              <p>التاريخ: ${formatDate(selectedOrder.createdAt)}</p>
            </div>
            <div class="info-grid">
              <div class="info-box">
                <h3>معلومات العميل</h3>
                <p><strong>الاسم:</strong> ${selectedOrder.customer.name}</p>
                <p><strong>الهاتف:</strong> ${selectedOrder.customer.phone}</p>
                <p><strong>البريد:</strong> ${selectedOrder.customer.email}</p>
              </div>
              <div class="info-box">
                <h3>عنوان الشحن</h3>
                <p>${selectedOrder.shippingAddress}</p>
                <h3 style="margin-top: 15px;">طريقة الدفع</h3>
                <p>${selectedOrder.paymentMethod}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${selectedOrder.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price} ر.س</td>
                    <td>${item.total} ر.س</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan="3">المجموع الفرعي</td>
                  <td>${selectedOrder.subtotal} ر.س</td>
                </tr>
                <tr>
                  <td colspan="3">الشحن</td>
                  <td>${selectedOrder.shipping} ر.س</td>
                </tr>
                ${selectedOrder.discount > 0 ? `
                  <tr>
                    <td colspan="3">الخصم</td>
                    <td>-${selectedOrder.discount} ر.س</td>
                  </tr>
                ` : ''}
                <tr class="total-row">
                  <td colspan="3">الإجمالي</td>
                  <td>${selectedOrder.total} ر.س</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              <p>شكراً لتسوقكم معنا</p>
              <p>متجر الأناقة - للتواصل: support@store.com | 920000000</p>
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">الطلبات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة طلبات متجرك</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير الطلبات
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedStatus("all")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">جميع الطلبات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-gray-500/50 transition-colors" onClick={() => setSelectedStatus("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-500/50 transition-colors" onClick={() => setSelectedStatus("processing")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">قيد التجهيز</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-purple-500/50 transition-colors" onClick={() => setSelectedStatus("shipped")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">تم الشحن</p>
                <p className="text-2xl font-bold">{stats.shipped}</p>
              </div>
              <Truck className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setSelectedStatus("delivered")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">تم التسليم</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setSelectedStatus("cancelled")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">ملغي</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الطلب، اسم العميل، رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">قيد التجهيز</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                  <SelectItem value="refunded">مسترد</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 ml-2" />
                    التاريخ
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>اليوم</DropdownMenuItem>
                  <DropdownMenuItem>أمس</DropdownMenuItem>
                  <DropdownMenuItem>آخر 7 أيام</DropdownMenuItem>
                  <DropdownMenuItem>آخر 30 يوم</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>نطاق مخصص</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">المنتجات</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">حالة الطلب</TableHead>
                <TableHead className="text-right">الدفع</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status]
                const payment = paymentStatusConfig[order.paymentStatus]
                return (
                  <TableRow key={order.id} className="group cursor-pointer" onClick={() => {
                    setSelectedOrder(order)
                    setIsOrderDetailOpen(true)
                  }}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="truncate">{order.items.map(i => i.name).join('، ')}</p>
                        <p className="text-xs text-muted-foreground">{order.items.length} منتج</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.total} ر.س</TableCell>
                    <TableCell>
                      <Badge className={status.className}>
                        <status.icon className="h-3 w-3 ml-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={payment.className}>
                        {payment.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(order)
                            setIsOrderDetailOpen(true)
                          }}>
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(order)
                            handlePrintInvoice()
                          }}>
                            <Printer className="h-4 w-4 ml-2" />
                            طباعة الفاتورة
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 ml-2" />
                            تحديث الحالة
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <XCircle className="h-4 w-4 ml-2" />
                            إلغاء الطلب
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              تفاصيل الطلب {selectedOrder?.id}
              {selectedOrder && (
                <Badge className={statusConfig[selectedOrder.status].className}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 pb-6">
                {/* Order Progress */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                        const config = statusConfig[status]
                        const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status)
                        const isCompleted = index <= currentIndex
                        const isCurrent = status === selectedOrder.status
                        return (
                          <div key={status} className="flex flex-col items-center gap-2">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center",
                              isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              <config.icon className="h-5 w-5" />
                            </div>
                            <span className={cn(
                              "text-xs",
                              isCurrent ? "font-medium text-primary" : "text-muted-foreground"
                            )}>
                              {config.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <Progress 
                      value={
                        selectedOrder.status === 'pending' ? 0 :
                        selectedOrder.status === 'processing' ? 33 :
                        selectedOrder.status === 'shipped' ? 66 :
                        selectedOrder.status === 'delivered' ? 100 : 0
                      } 
                      className="mt-4 h-2" 
                    />
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">معلومات العميل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                      <Separator />
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{selectedOrder.shippingAddress}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">معلومات الدفع</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">طريقة الدفع</span>
                        <span className="font-medium">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">حالة الدفع</span>
                        <Badge className={paymentStatusConfig[selectedOrder.paymentStatus].className}>
                          {paymentStatusConfig[selectedOrder.paymentStatus].label}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">المجموع الفرعي</span>
                        <span>{selectedOrder.subtotal} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">الشحن</span>
                        <span>{selectedOrder.shipping} ر.س</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                          <span>الخصم</span>
                          <span>-{selectedOrder.discount} ر.س</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between text-lg font-bold">
                        <span>الإجمالي</span>
                        <span>{selectedOrder.total} ر.س</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">المنتجات المطلوبة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">المنتج</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">السعر</TableHead>
                          <TableHead className="text-right">الإجمالي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedOrder.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price} ر.س</TableCell>
                            <TableCell className="font-medium">{item.total} ر.س</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedOrder.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">ملاحظات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">سجل الطلب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">تم إنشاء الطلب</p>
                          <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                      </div>
                      {selectedOrder.status !== 'pending' && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">تم تأكيد الطلب</p>
                            <p className="text-sm text-muted-foreground">{formatDate(selectedOrder.updatedAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsOrderDetailOpen(false)}>
              إغلاق
            </Button>
            <Button variant="outline" onClick={handlePrintInvoice}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة الفاتورة
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4 ml-2" />
              إرسال رسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
