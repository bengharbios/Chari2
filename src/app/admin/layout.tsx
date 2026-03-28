/**
 * Admin Dashboard Layout
 * Complete RTL layout with sidebar, header, and user menu
 * لوحة تحكم المدير الكاملة
 */

'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Store,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Shield,
  FileText,
  TrendingUp,
  Moon,
  Sun,
  Loader2,
  User,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

interface AdminLayoutProps {
  children: ReactNode;
}

// Sidebar navigation items
const sidebarItems = [
  {
    title: 'لوحة التحكم',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'إدارة المستخدمين',
    href: '/admin/users',
    icon: Users,
    badge: '24',
  },
  {
    title: 'إدارة المتاجر',
    href: '/admin/stores',
    icon: Store,
    badge: '8',
  },
  {
    title: 'إدارة المنتجات',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'إدارة الطلبات',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: '15',
  },
  {
    title: 'المدفوعات',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'التقارير',
    href: '/admin/reports',
    icon: TrendingUp,
  },
  {
    title: 'الاشتراكات',
    href: '/admin/subscriptions',
    icon: FileText,
  },
  {
    title: 'طلبات التحقق',
    href: '/admin/verifications',
    icon: Shield,
    badge: '5',
  },
  {
    title: 'البلاغات',
    href: '/admin/reports-issues',
    icon: AlertTriangle,
    badge: '3',
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
];

function AdminSidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, performLogout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await performLogout();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* User Profile Section */}
      <div className="border-b border-border p-4 bg-gradient-to-l from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-red-500">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-red-500 text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'م'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{user?.name || 'مدير النظام'}</h3>
            <p className="text-sm text-muted-foreground truncate">
              <Badge variant="destructive" className="text-xs">مدير</Badge>
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-red-500 text-white hover:bg-red-600 hover:text-white'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge
                    variant={isActive ? 'secondary' : 'default'}
                    className={cn(
                      'h-5 min-w-5 px-1.5 text-xs',
                      isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
        </Button>
      </div>
    </div>
  );
}

function AdminUserMenu() {
  const { user, performLogout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await performLogout();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
          <Avatar className="h-8 w-8 border-2 border-red-500">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-red-500 text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'م'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground">{user?.name || 'مدير النظام'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user?.name || 'مدير النظام'}</span>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">مدير</Badge>
              <span className="text-xs text-muted-foreground">{user?.email || user?.phone}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>الملف الشخصي</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>الإعدادات</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>الإشعارات</span>
            <Badge className="mr-auto bg-red-500">5</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="ml-2 h-4 w-4" />
          <span>المساعدة</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="ml-2 h-4 w-4" />
          )}
          <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const currentPageTitle = sidebarItems.find((item) => item.href === pathname)?.title || 'لوحة التحكم';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-red-500 text-white px-4 backdrop-blur lg:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-600">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <AdminSidebarContent onClose={() => setIsSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="font-bold text-lg">لوحة الإدارة</span>
        </div>

        <AdminUserMenu />
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col border-l border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-border bg-red-500">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-white">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">لوحة الإدارة</span>
                  <span className="text-xs text-white/70">نظام سوق</span>
                </div>
              </Link>
            </div>
            <AdminSidebarContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:mr-72">
          {/* Desktop Header */}
          <header className="sticky top-0 z-30 hidden lg:flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">{currentPageTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث..."
                  className="h-10 w-64 rounded-lg border border-input bg-background px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
                <ChevronLeft className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                      5
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">طلب تحقق جديد</span>
                      <span className="text-xs text-muted-foreground">متجر الأناقة يطلب التحقق</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">بلاغ جديد</span>
                      <span className="text-xs text-muted-foreground">بلاغ على منتج</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <AdminUserMenu />
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
