/**
 * مكون قائمة المستخدم الموحد
 * Unified User Menu Component
 * يستخدم في جميع لوحات التحكم
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Loader2,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type UserRole = 'admin' | 'merchant' | 'store' | 'buyer';

interface UserMenuProps {
  role?: UserRole;
  className?: string;
  showName?: boolean;
}

const roleConfig: Record<UserRole, { 
  color: string; 
  bgColor: string;
  label: string;
  basePath: string;
}> = {
  admin: {
    color: 'bg-red-500',
    bgColor: 'bg-red-500/10 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    label: 'مدير',
    basePath: '/admin',
  },
  merchant: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    label: 'تاجر',
    basePath: '/merchant',
  },
  store: {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    label: 'متجر',
    basePath: '/store',
  },
  buyer: {
    color: 'bg-green-500',
    bgColor: 'bg-green-500/10 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    label: 'مشتري',
    basePath: '/buyer',
  },
};

export function UserMenu({ role = 'buyer', className, showName = true }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, performLogout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const config = roleConfig[role];

  const handleLogout = async (e: Event) => {
    e.preventDefault();
    
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
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center gap-2 px-2 hover:bg-accent",
            className
          )}
        >
          <Avatar className={cn("h-8 w-8 border-2", config.color)}>
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className={cn("text-white text-sm font-bold", config.color)}>
              {user?.name?.charAt(0) || 'م'}
            </AvatarFallback>
          </Avatar>
          {showName && (
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground truncate max-w-32">
                {user?.name || 'مستخدم'}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-32">
                {user?.email || user?.phone}
              </p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-medium">{user?.name || 'مستخدم'}</span>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs", config.bgColor)}>
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email || user?.phone}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`${config.basePath}/profile`} className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>الملف الشخصي</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`${config.basePath}/settings`} className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>الإعدادات</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`${config.basePath}/notifications`} className="flex items-center gap-2 cursor-pointer">
            <Bell className="h-4 w-4" />
            <span>الإشعارات</span>
            <Badge className="mr-auto bg-primary text-primary-foreground text-xs">5</Badge>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="ml-2 h-4 w-4" />
          <span>المساعدة</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
          onSelect={handleLogout}
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

export default UserMenu;
