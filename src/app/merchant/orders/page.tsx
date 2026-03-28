"use client";

import { useState } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  ChevronDown,
  MessageSquare,
  Printer,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Sample orders data
const initialOrders = [
  {
    id: 'ORD-001',
    customer: {
      name: 'أحمد محمد العلي',
      phone: '0501234567',
      email: 'ahmed@example.com',
      address: 'الرياض، حي النخيل، شارع الملك فهد، مبنى 15',
    },
    items: [
      { name: 'قميص قطني أبيض', quantity: 2, price: 120, total: 240 },
      { name: 'حزام جلدي بني', quantity: 1, price: 120, total: 120 },
    ],
    subtotal: 360,
    shipping: 25,
    discount: 0,
    total: 385,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash_on_delivery',
    date: '2024-01-15T10:30:00',
    notes: 'يرجى التوصيل بعد الساعة 4 عصراً',
  },
  {
    id: 'ORD-002',
    customer: {
      name: 'سارة علي الغامدي',
      phone: '0559876543',
      email: 'sara@example.com',
      address: 'جدة، حي الروضة، شارع الأمير سلطان',
    },
    items: [
      { name: 'ساعة يد كلاسيك', quantity: 1, price: 750, total: 750 },
      { name: 'محفظة جلدية', quantity: 2, price: 150, total: 300 },
    ],
    subtotal: 1050,
    shipping: 0,
    discount: 50,
    total: 1000,
    status: 'processing',
    paymentStatus: 'completed',
    paymentMethod: 'credit_card',
    date: '2024-01-15T09:15:00',
    notes: '',
  },
  {
    id: 'ORD-003',
    customer: {
      name: 'محمد خالد السعيد',
      phone: '0567890123',
      email: 'mohammed@example.com',
      address: 'الدمام، حي الفيصلية، شارع الخليج',
    },
    items: [
      { name: 'حذاء رياضي أسود', quantity: 1, price: 350, total: 350 },
    ],
    subtotal: 350,
    shipping: 30,
    discount: 0,
    total: 380,
    status: 'shipped',
    paymentStatus: 'completed',
    paymentMethod: 'mada',
    date: '2024-01-14T14:20:00',
    notes: '',
  },
  {
    id: 'ORD-004',
    customer: {
      name: 'فاطمة أحمد الزهراني',
      phone: '0509876543',
      email: 'fatima@example.com',
      address: 'الرياض، حي العليا، برج المملكة',
    },
    items: [
      { name: 'نظارة شمسية', quantity: 1, price: 200, total: 200 },
    ],
    subtotal: 200,
    shipping: 20,
    discount: 0,
    total: 220,
    status: 'delivered',
    paymentStatus: 'completed',
    paymentMethod: 'apple_pay',
    date: '2024-01-14T11:00:00',
    notes: '',
  },
  {
    id: 'ORD-005',
    customer: {
      name: 'عبدالله سعود العتيبي',
      phone: '0543210987',
      email: 'abdullah@example.com',
      address: 'مكة، حي العزيزية',
    },
    items: [
      { name: 'محفظة جلدية', quantity: 1, price: 150, total: 150 },
      { name: 'حزام جلدي بني', quantity: 1, price: 120, total: 120 },
    ],
    subtotal: 270,
    shipping: 25,
    discount: 0,
    total: 295,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'credit_card',
    date: '2024-01-13T16:45:00',
    notes: 'تم الإلغاء بناءً على طلب العميل',
  },
];

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'قيد الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  returned: 'مسترجع',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-info text-info-foreground',
  processing: 'bg-purple-500 text-white',
  shipped: 'bg-blue-500 text-white',
  delivered: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
  returned: 'bg-orange-500 text-white',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: Package,
};

const paymentLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  completed: 'مكتمل',
  failed: 'فشل',
  refunded: 'مسترد',
};

const paymentColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
};

const paymentMethodLabels: Record<string, string> = {
  credit_card: 'بطاقة ائتمان',
  mada: 'مدى',
  apple_pay: 'Apple Pay',
  cash_on_delivery: 'الدفع عند الاستلام',
  bank_transfer: 'تحويل بنكي',
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof initialOrders[0] | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setOrders(orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الطلبات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة طلباتك</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">جميع الطلبات</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-warning transition-colors" onClick={() => setStatusFilter('pending')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">قيد الانتظار</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-purple-500 transition-colors" onClick={() => setStatusFilter('processing')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{stats.processing}</p>
              <p className="text-sm text-muted-foreground">قيد التجهيز</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => setStatusFilter('shipped')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{stats.shipped}</p>
              <p className="text-sm text-muted-foreground">قيد الشحن</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-success transition-colors" onClick={() => setStatusFilter('delivered')}>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{stats.delivered}</p>
              <p className="text-sm text-muted-foreground">تم التسليم</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الجوال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد التجهيز</SelectItem>
                <SelectItem value="shipped">قيد الشحن</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
          <CardDescription>
            عرض {filteredOrders.length} من {orders.length} طلب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الدفع</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status];
                  return (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      setSelectedOrder(order);
                      setIsDetailsOpen(true);
                    }}>
                      <TableCell>
                        <span className="font-medium">{order.id}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{formatDate(order.date)}</p>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{order.total} ر.س</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          <StatusIcon className="h-3 w-3 ml-1" />
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={paymentColors[order.paymentStatus]}>
                          {paymentLabels[order.paymentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuLabel>تحديث الحالة</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'confirmed')}>
                              <CheckCircle className="h-4 w-4 ml-2 text-info" />
                              تأكيد
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'processing')}>
                              <Package className="h-4 w-4 ml-2 text-purple-500" />
                              قيد التجهيز
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipped')}>
                              <Truck className="h-4 w-4 ml-2 text-blue-500" />
                              تم الشحن
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'delivered')}>
                              <CheckCircle className="h-4 w-4 ml-2 text-success" />
                              تم التسليم
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(order.id, 'cancelled')}>
                              <XCircle className="h-4 w-4 ml-2" />
                              إلغاء
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              تفاصيل الطلب {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[selectedOrder.status]}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                  <Badge variant="outline" className={paymentColors[selectedOrder.paymentStatus]}>
                    {paymentLabels[selectedOrder.paymentStatus]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Printer className="h-4 w-4 ml-2" />
                    طباعة
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 ml-2" />
                    محادثة
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">معلومات العميل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{selectedOrder.customer.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">المنتجات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{item.total} ر.س</p>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span>{selectedOrder.subtotal} ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الشحن</span>
                      <span>{selectedOrder.shipping === 0 ? 'مجاني' : `${selectedOrder.shipping} ر.س`}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>الخصم</span>
                        <span>-{selectedOrder.discount} ر.س</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>الإجمالي</span>
                      <span>{selectedOrder.total} ر.س</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment & Date */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">طريقة الدفع</span>
                    </div>
                    <p className="font-medium">{paymentMethodLabels[selectedOrder.paymentMethod]}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">تاريخ الطلب</span>
                    </div>
                    <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                    <p>{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Update Status */}
              <div className="flex gap-2 pt-4 border-t">
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="processing">قيد التجهيز</SelectItem>
                    <SelectItem value="shipped">قيد الشحن</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
