'use client';

// =============================================
// صفحة التسويات المالية
// Merchant Settlements Page
// =============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Loader2, 
  Wallet, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  Calendar,
  FileText,
  ArrowDownToLine
} from 'lucide-react';
import { SettlementStatus } from '@prisma/client';

interface Settlement {
  id: string;
  merchantId: string | null;
  storeId: string | null;
  periodStart: string;
  periodEnd: string;
  totalSales: number;
  totalCommission: number;
  totalRefunds: number;
  netAmount: number;
  status: SettlementStatus;
  paidAt: string | null;
  paymentReference: string | null;
  reportUrl: string | null;
  createdAt: string;
  orderCount: number;
}

interface SettlementDetail extends Settlement {
  orders: SettlementOrder[];
  summary: {
    totalOrders: number;
    totalSales: number;
    totalCommission: number;
    totalVAT: number;
    totalRefunds: number;
    netAmount: number;
    averageOrderValue: number;
  };
}

interface SettlementOrder {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  commission: number;
  vat: number;
  netAmount: number;
  status: string;
  createdAt: string;
  customerName: string | null;
}

interface ReportSummary {
  totalSettlements: number;
  totalSales: number;
  totalCommission: number;
  totalNetAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

const getStatusBadge = (status: SettlementStatus) => {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">قيد الانتظار</Badge>;
    case 'PROCESSING':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">قيد المعالجة</Badge>;
    case 'COMPLETED':
      return <Badge variant="secondary" className="bg-green-100 text-green-700">مكتمل</Badge>;
    case 'FAILED':
      return <Badge variant="secondary" className="bg-red-100 text-red-700">فشل</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusIcon = (status: SettlementStatus) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="w-5 h-5 text-yellow-500" />;
    case 'PROCESSING':
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'COMPLETED':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'FAILED':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:
      return null;
  }
};

export default function MerchantSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSettlements();
    fetchReport();
  }, [page]);

  const fetchSettlements = async () => {
    try {
      const response = await fetch(`/api/settlements?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setSettlements(data.data.settlements);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/settlements/report');
      const data = await response.json();

      if (data.success) {
        setReportSummary(data.data.report.summary);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchSettlementDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/settlements/${id}`);
      const data = await response.json();

      if (data.success) {
        setSelectedSettlement(data.data.settlement);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching settlement detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ar-SA')} ر.س`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">التسويات المالية</h1>
          <p className="text-gray-600 mt-2">تتبع وإدارة تسوياتك المالية</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportSummary?.totalSales || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">صافي الأرباح</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportSummary?.totalNetAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">معلق الصرف</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(reportSummary?.pendingAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">تم صرفه</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(reportSummary?.paidAmount || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
            <TabsTrigger value="completed">مكتملة</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <SettlementsTable
              settlements={settlements}
              onViewDetail={fetchSettlementDetail}
              detailLoading={detailLoading}
              formatCurrency={formatCurrency}
              formatPeriod={formatPeriod}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="pending">
            <SettlementsTable
              settlements={settlements.filter(s => s.status === 'PENDING')}
              onViewDetail={fetchSettlementDetail}
              detailLoading={detailLoading}
              formatCurrency={formatCurrency}
              formatPeriod={formatPeriod}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="completed">
            <SettlementsTable
              settlements={settlements.filter(s => s.status === 'COMPLETED')}
              onViewDetail={fetchSettlementDetail}
              detailLoading={detailLoading}
              formatCurrency={formatCurrency}
              formatPeriod={formatPeriod}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              السابق
            </Button>
            <span className="flex items-center px-4">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              التالي
            </Button>
          </div>
        )}

        {/* Settlement Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                تفاصيل التسوية
              </DialogTitle>
              <DialogDescription>
                {selectedSettlement && formatPeriod(selectedSettlement.periodStart, selectedSettlement.periodEnd)}
              </DialogDescription>
            </DialogHeader>

            {selectedSettlement && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedSettlement.status)}
                  {getStatusBadge(selectedSettlement.status)}
                  {selectedSettlement.paidAt && (
                    <span className="text-sm text-gray-500">
                      تم الصرف في {formatDate(selectedSettlement.paidAt)}
                    </span>
                  )}
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500">إجمالي المبيعات</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedSettlement.summary.totalSales)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500">العمولة</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(selectedSettlement.summary.totalCommission)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500">الضريبة</p>
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(selectedSettlement.summary.totalVAT)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500">الصافي</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(selectedSettlement.summary.netAmount)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Orders Table */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    الطلبات في هذه الفترة ({selectedSettlement.orders.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم الطلب</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>العمولة</TableHead>
                          <TableHead>الصافي</TableHead>
                          <TableHead>التاريخ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedSettlement.orders.map((order) => (
                          <TableRow key={order.orderId}>
                            <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                            <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                            <TableCell className="text-red-600">{formatCurrency(order.commission)}</TableCell>
                            <TableCell className="text-green-600 font-medium">{formatCurrency(order.netAmount)}</TableCell>
                            <TableCell className="text-sm text-gray-500">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    إغلاق
                  </Button>
                  {selectedSettlement.reportUrl && (
                    <Button>
                      <Download className="w-4 h-4 ml-2" />
                      تحميل التقرير
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// =============================================
// مكون جدول التسويات
// Settlements Table Component
// =============================================

interface SettlementsTableProps {
  settlements: Settlement[];
  onViewDetail: (id: string) => void;
  detailLoading: boolean;
  formatCurrency: (amount: number) => string;
  formatPeriod: (start: string, end: string) => string;
  formatDate: (date: string) => string;
}

function SettlementsTable({
  settlements,
  onViewDetail,
  detailLoading,
  formatCurrency,
  formatPeriod,
  formatDate,
}: SettlementsTableProps) {
  if (settlements.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">لا توجد تسويات</h3>
          <p className="text-gray-500 mt-1">ستظهر التسويات هنا عند توفر مبيعات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الفترة</TableHead>
              <TableHead>المبيعات</TableHead>
              <TableHead>العمولة</TableHead>
              <TableHead>الصافي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.map((settlement) => (
              <TableRow key={settlement.id}>
                <TableCell className="font-medium">
                  {formatPeriod(settlement.periodStart, settlement.periodEnd)}
                </TableCell>
                <TableCell>{formatCurrency(settlement.totalSales)}</TableCell>
                <TableCell className="text-red-600">
                  {formatCurrency(settlement.totalCommission)}
                </TableCell>
                <TableCell className="text-green-600 font-bold">
                  {formatCurrency(settlement.netAmount)}
                </TableCell>
                <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(settlement.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(settlement.id)}
                    disabled={detailLoading}
                  >
                    {detailLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
