/**
 * Buyer Wallet Page
 * Wallet balance, transactions, and add balance functionality
 */

'use client';

import { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ArrowUpDown,
  Calendar,
  Filter,
  Download,
  ChevronLeft,
  CheckCircle,
  Clock,
  XCircle,
  Gift,
  ShoppingBag,
  RefreshCcw,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock wallet data
const walletData = {
  balance: 350.00,
  pendingBalance: 50.00,
  totalAdded: 1500.00,
  totalSpent: 1200.00,
};

// Mock transactions data
const transactionsData = [
  {
    id: 'TRX-001',
    type: 'credit',
    category: 'topup',
    amount: 500,
    balance: 850,
    description: 'شحن الرصيد - بطاقة مدى',
    status: 'completed',
    date: '2024-01-20 14:30',
    paymentMethod: 'بطاقة مدى •••• 1234',
  },
  {
    id: 'TRX-002',
    type: 'debit',
    category: 'purchase',
    amount: -150,
    balance: 700,
    description: 'دفع طلب #ORD-2024-003',
    status: 'completed',
    date: '2024-01-19 10:15',
    orderId: 'ORD-2024-003',
  },
  {
    id: 'TRX-003',
    type: 'credit',
    category: 'refund',
    amount: 320,
    balance: 850,
    description: 'استرداد طلب #ORD-2024-004',
    status: 'completed',
    date: '2024-01-18 16:00',
    orderId: 'ORD-2024-004',
  },
  {
    id: 'TRX-004',
    type: 'credit',
    category: 'cashback',
    amount: 25,
    balance: 530,
    description: 'استرداد نقدي - عرض خاص',
    status: 'completed',
    date: '2024-01-17 12:00',
  },
  {
    id: 'TRX-005',
    type: 'debit',
    category: 'purchase',
    amount: -280,
    balance: 505,
    description: 'دفع طلب #ORD-2024-002',
    status: 'completed',
    date: '2024-01-15 09:30',
    orderId: 'ORD-2024-002',
  },
  {
    id: 'TRX-006',
    type: 'credit',
    category: 'topup',
    amount: 200,
    balance: 785,
    description: 'شحن الرصيد - Apple Pay',
    status: 'completed',
    date: '2024-01-14 11:00',
    paymentMethod: 'Apple Pay',
  },
  {
    id: 'TRX-007',
    type: 'debit',
    category: 'purchase',
    amount: -450,
    balance: 585,
    description: 'دفع طلب #ORD-2024-001',
    status: 'completed',
    date: '2024-01-12 15:45',
    orderId: 'ORD-2024-001',
  },
  {
    id: 'TRX-008',
    type: 'credit',
    category: 'gift',
    amount: 100,
    balance: 1035,
    description: 'هدية من صديق - أحمد',
    status: 'completed',
    date: '2024-01-10 08:00',
  },
];

// Quick top-up amounts
const quickAmounts = [50, 100, 200, 500, 1000];

// Payment methods
const paymentMethods = [
  { id: 'mada', name: 'بطاقة مدى', icon: '💳' },
  { id: 'visa', name: 'Visa', icon: '💳' },
  { id: 'mastercard', name: 'Mastercard', icon: '💳' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' },
  { id: 'stc_pay', name: 'STC Pay', icon: '📱' },
];

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  category: string;
  amount: number;
  balance: number;
  description: string;
  status: string;
  date: string;
  paymentMethod?: string;
  orderId?: string;
}

function TransactionIcon({ category, type }: { category: string; type: string }) {
  if (type === 'credit') {
    switch (category) {
      case 'topup':
        return <Plus className="h-5 w-5 text-green-500" />;
      case 'refund':
        return <RefreshCcw className="h-5 w-5 text-blue-500" />;
      case 'cashback':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'gift':
        return <Gift className="h-5 w-5 text-pink-500" />;
      default:
        return <ArrowDownRight className="h-5 w-5 text-green-500" />;
    }
  } else {
    switch (category) {
      case 'purchase':
        return <ShoppingBag className="h-5 w-5 text-amber-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
    }
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="secondary" className="bg-green-500/10 text-green-500 gap-1">
          <CheckCircle className="h-3 w-3" />
          مكتمل
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 gap-1">
          <Clock className="h-3 w-3" />
          قيد الانتظار
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="secondary" className="bg-red-500/10 text-red-500 gap-1">
          <XCircle className="h-3 w-3" />
          فشل
        </Badge>
      );
    default:
      return null;
  }
}

export default function BuyerWalletPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [topUpAmount, setTopUpAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('mada');
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);

  const filteredTransactions = transactionsData.filter((tx) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'credit') return tx.type === 'credit';
    if (activeTab === 'debit') return tx.type === 'debit';
    return true;
  });

  const handleTopUp = () => {
    const amount = topUpAmount || parseFloat(customAmount);
    if (amount && amount > 0) {
      // Simulate top-up process
      console.log('Topping up:', amount, 'via:', selectedPaymentMethod);
      setIsTopUpDialogOpen(false);
      setTopUpAmount(null);
      setCustomAmount('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">محفظتي</h1>
          <p className="text-muted-foreground">إدارة رصيدك ومعاملاتك المالية</p>
        </div>
        <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              شحن الرصيد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                شحن الرصيد
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Quick Amounts */}
              <div>
                <Label className="mb-3 block">اختر مبلغاً</Label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={topUpAmount === amount ? 'default' : 'outline'}
                      className="h-12"
                      onClick={() => {
                        setTopUpAmount(amount);
                        setCustomAmount('');
                      }}
                    >
                      {amount} ر.س
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="customAmount">أو أدخل مبلغاً آخر</Label>
                <div className="relative mt-2">
                  <Input
                    id="customAmount"
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setTopUpAmount(null);
                    }}
                    className="pr-16 text-lg"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ر.س
                  </span>
                </div>
              </div>

              <Separator />

              {/* Payment Methods */}
              <div>
                <Label className="mb-3 block">طريقة الدفع</Label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <span className="flex-1 font-medium">{method.name}</span>
                      {selectedPaymentMethod === method.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">المبلغ</span>
                  <span className="text-xl font-bold text-primary">
                    {(topUpAmount || parseFloat(customAmount) || 0).toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTopUpDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleTopUp} disabled={!topUpAmount && !customAmount}>
                تأكيد الشحن
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Balance */}
        <Card className="bg-gradient-to-l from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 mb-1">الرصيد المتاح</p>
                <p className="text-3xl font-bold">{walletData.balance.toFixed(2)} ر.س</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary-foreground/20">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>رصيد معلق: {walletData.pendingBalance.toFixed(2)} ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Added */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">إجمالي الشحن</p>
                <p className="text-2xl font-bold text-green-500">
                  +{walletData.totalAdded.toFixed(2)} ر.س
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">منذ إنشاء الحساب</p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground mb-1">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-amber-500">
                  -{walletData.totalSpent.toFixed(2)} ر.س
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">منذ إنشاء الحساب</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setIsTopUpDialogOpen(true)}>
          <Plus className="h-5 w-5 text-primary" />
          <span>شحن الرصيد</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <Gift className="h-5 w-5 text-pink-500" />
          <span>إهداء رصيد</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          <span>بطاقاتي</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <Download className="h-5 w-5 text-purple-500" />
          <span>كشف الحساب</span>
        </Button>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-primary" />
              سجل المعاملات
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                الفترة
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                تصفية
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="credit">الواردات</TabsTrigger>
              <TabsTrigger value="debit">المصروفات</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ScrollArea className="max-h-[500px]">
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Icon */}
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          tx.type === 'credit' ? 'bg-green-500/10' : 'bg-amber-500/10'
                        }`}
                      >
                        <TransactionIcon category={tx.category} type={tx.type} />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {tx.description}
                          </p>
                          <StatusBadge status={tx.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{tx.date}</span>
                          {tx.paymentMethod && (
                            <>
                              <span>•</span>
                              <span>{tx.paymentMethod}</span>
                            </>
                          )}
                          {tx.orderId && (
                            <>
                              <span>•</span>
                              <a href={`/buyer/orders/${tx.orderId}`} className="text-primary hover:underline">
                                عرض الطلب
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-left">
                        <p
                          className={`text-lg font-bold ${
                            tx.amount > 0 ? 'text-green-500' : 'text-amber-500'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} ر.س
                        </p>
                        <p className="text-xs text-muted-foreground">
                          الرصيد: {tx.balance.toFixed(2)} ر.س
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">أمان محفظتك</p>
            <p className="text-sm text-muted-foreground">
              محفظتك محمية بتشفير عالي المستوى. لن نطلب منك كلمة المرور أو بيانات البطاقة عبر الهاتف أو البريد الإلكتروني.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
