"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Moon,
  Sun,
  Store,
  Tags,
  Users,
  Wallet,
  Truck,
  HelpCircle,
  Loader2,
} from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { useState, useCallback } from "react"

const menuItems = [
  {
    title: "الرئيسية",
    url: "/store/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "المنتجات",
    url: "/store/products",
    icon: Package,
    badge: null,
  },
  {
    title: "الطلبات",
    url: "/store/orders",
    icon: ShoppingCart,
    badge: "5",
  },
  {
    title: "التقارير",
    url: "/store/reports",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "العملاء",
    url: "/store/customers",
    icon: Users,
    badge: null,
  },
  {
    title: "العروض",
    url: "/store/promotions",
    icon: Tags,
    badge: null,
  },
  {
    title: "المالية",
    url: "/store/finance",
    icon: Wallet,
    badge: null,
  },
  {
    title: "الشحن",
    url: "/store/shipping",
    icon: Truck,
    badge: null,
  },
  {
    title: "الإعدادات",
    url: "/store/settings",
    icon: Settings,
    badge: null,
  },
  {
    title: "المساعدة",
    url: "/store/support",
    icon: HelpCircle,
    badge: null,
  },
]

export function StoreSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const isCollapsed = state === "collapsed"
  const { user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // دالة تسجيل الخروج - تعمل بشكل مباشر
  const handleLogoutClick = useCallback(async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    
    try {
      // استدعاء API تسجيل الخروج
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      // مسح localStorage في كل الأحوال
      localStorage.removeItem('auth-storage')
      
      toast.success('تم تسجيل الخروج بنجاح')
      
      // توجيه لصفحة تسجيل الدخول مع إعادة تحميل كاملة
      window.location.href = '/auth/login'
      
    } catch (error) {
      console.error('Logout error:', error)
      // حتى لو حدث خطأ، نوجه المستخدم لصفحة الدخول
      localStorage.removeItem('auth-storage')
      window.location.href = '/auth/login'
    } finally {
      setIsLoggingOut(false)
    }
  }, [isLoggingOut])

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/store/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
            <Store className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">متجري</span>
              <span className="text-xs text-muted-foreground">لوحة تحكم المتجر</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground text-xs">
              {!isCollapsed && "القائمة الرئيسية"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "w-full justify-end",
                          isActive && "bg-purple-500/10 text-purple-600 font-medium dark:bg-purple-900/30 dark:text-purple-400"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          {!isCollapsed && (
                            <span className="flex-1 text-right">{item.title}</span>
                          )}
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.badge && !isCollapsed && (
                            <Badge
                              variant="secondary"
                              className="mr-auto bg-purple-500 text-white text-xs px-2 py-0.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0">
                  <Avatar className="h-8 w-8 border-2 border-purple-500">
                    <AvatarImage src={user?.avatar || ''} alt="Store" />
                    <AvatarFallback className="bg-purple-500 text-white text-xs font-bold">
                      {user?.name?.charAt(0) || 'م'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium text-sm">{user?.name || 'مستخدم'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || user?.phone}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/store/profile" className="flex items-center gap-2 cursor-pointer">
                    <Store className="h-4 w-4" />
                    <span>ملف المتجر</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/store/notifications" className="flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    <span>الإشعارات</span>
                    <Badge className="mr-auto bg-purple-500 text-white text-xs">3</Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="ml-2 h-4 w-4" />
                  ) : (
                    <Moon className="ml-2 h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* زر تسجيل الخروج - يستخدم onClick مباشرة */}
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onClick={handleLogoutClick}
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
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("h-9 w-9", isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
