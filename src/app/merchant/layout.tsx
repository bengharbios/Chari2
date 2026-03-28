/**
 * Merchant Dashboard Layout
 * Complete RTL layout with sidebar and header
 * لوحة تحكم التاجر الكاملة
 */

'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  FileText,
  TrendingUp,
  Store,
  Menu,
  Moon,
  Sun,
  Loader2,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

interface MerchantLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  {
    title: 'لوحة التحكم',
    href: '/merchant/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'المنتجات',
    href: '/merchant/products',
    icon: Package,
  },
  {
    title: 'الطلبات',
    href: '/merchant/orders',
    icon: ShoppingCart,
    badge: '5',
  },
  {
    title: 'التقارير',
    href: '/merchant/reports',
    icon: TrendingUp,
  },
  {
    title: 'المالية',
    href: '/merchant/finance',
    icon: Wallet,
  },
  {
    title: 'الملف الشخصي',
    href: '/merchant/profile',
    icon: User,
  },
  {
    title: 'المستندات',
    href: '/merchant/documents',
    icon: FileText,
  },
  {
    title: 'الإعدادات',
    href: '/merchant/settings',
    icon: Settings,
  },
  {
    title: 'المساعدة',
    href: '/merchant/support',
    icon: HelpCircle,
  },
];

function MerchantSidebarContent({ onClose }: { onClose?: () => void }) {
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
      router.refresh();
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
      <div className="border-b border-border p-4 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-blue-500">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-blue-500 text-white font-bold text-lg">
              {user?.name?.charAt(0) || 'ت'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{user?.name || 'تاجر'}</h3>
            <p className="text-sm text-muted-foreground truncate">
              <Badge className="bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs">تاجر مستقل</Badge>
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-blue-500/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">15,450</div>
            <div className="text-xs text-muted-foreground">ر.س المبيعات</div>
          </div>
          <div className="bg-accent/10 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-accent">24</div>
            <div className="text-xs text-muted-foreground">منتج</div>
          </div>
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
                    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white'
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
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-500 text-white'
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

function MerchantUserMenu() {
  const { user, performLogout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e?: Event) => {
    if (e) e.preventDefault();
    
    setIsLoggingOut(true);
    try {
      await performLogout();
      toast.success('تم تسجيل الخروج بنجاح');
      router.push('/auth/login');
      router.refresh();
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
          <Avatar className="h-8 w-8 border-2 border-blue-500">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-blue-500 text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'ت'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-foreground">{user?.name || 'تاجر'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user?.name || 'تاجر'}</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs">تاجر مستقل</Badge>
              <span className="text-xs text-muted-foreground truncate">{user?.email || user?.phone}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/merchant/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>الملف الشخصي</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/merchant/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>الإعدادات</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/merchant/notifications" className="flex items-center gap-2 cursor-pointer">
            <Bell className="h-4 w-4" />
            <span>الإشعارات</span>
            <Badge className="mr-auto bg-blue-500 text-white">3</Badge>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="ml-2 h-4 w-4" />
          <span>المساعدة</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            setTheme(theme === 'dark' ? 'light' : 'dark');
          }}
        >
          {theme === 'dark' ? (
            <Sun className="ml-2 h-4 w-4" />
          ) : (
            <Moon className="ml-2 h-4 w-4" />
          )}
          <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive cursor-pointer"
          onSelect={(e) => {
            e.preventDefault();
            handleLogout();
          }}
          disabled={isLoggingOut}
        >
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

export default function MerchantLayout({ children }: MerchantLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const currentPageTitle = sidebarItems.find((item) => item.href === pathname)?.title || 'لوحة التحكم';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-blue-500 text-white px-4 backdrop-blur lg:hidden">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <MerchantSidebarContent onClose={() => setIsSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <span className="font-bold text-lg">لوحة التاجر</span>
        </div>

        <MerchantUserMenu />
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col border-l border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-border bg-blue-500">
              <Link href="/merchant/dashboard" className="flex items-center gap-2 text-white">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold">لوحة التاجر</span>
                  <span className="text-xs text-white/70">تشارك</span>
                </div>
              </Link>
            </div>
            <MerchantSidebarContent />
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
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                  document.documentElement.classList.toggle('dark');
                }}
              >
                <Sun className="h-5 w-5 dark:hidden" />
                <Moon className="h-5 w-5 hidden dark:block" />
              </Button>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث..."
                  className="h-10 w-64 rounded-lg border border-input bg-background px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ChevronLeft className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">طلب جديد</span>
                      <span className="text-xs text-muted-foreground">طلب #12345 في انتظار المعالجة</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium">تحديث حالة الطلب</span>
                      <span className="text-xs text-muted-foreground">تم شحن الطلب #12340</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <MerchantUserMenu />
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
