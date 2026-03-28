/**
 * مكون تسجيل الخروج الموحد
 * Unified Logout Button Component
 * يستخدم في جميع لوحات التحكم
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  variant?: 'button' | 'menu-item';
  className?: string;
  showIcon?: boolean;
}

/**
 * زر تسجيل الخروج الموحد
 * يمكن استخدامه كزر مستقل أو عنصر في قائمة منسدلة
 */
export function LogoutButton({ 
  variant = 'button', 
  className,
  showIcon = true 
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { performLogout } = useAuth();

  const handleLogout = async (e?: Event) => {
    // منع إغلاق القائمة قبل اكتمال العملية
    if (e) {
      e.preventDefault();
    }
    
    setIsLoggingOut(true);
    
    try {
      // استدعاء API تسجيل الخروج
      await performLogout();
      
      toast.success('تم تسجيل الخروج بنجاح');
      
      // توجيه لصفحة تسجيل الدخول
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (variant === 'menu-item') {
    return (
      <DropdownMenuItem 
        className={cn("text-destructive focus:text-destructive cursor-pointer", className)}
        onSelect={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        ) : (
          showIcon && <LogOut className="ml-2 h-4 w-4" />
        )}
        <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive",
        className
      )}
      onClick={handleLogout as any}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-5 w-5" />
      )}
      <span>{isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}</span>
    </Button>
  );
}

export default LogoutButton;
