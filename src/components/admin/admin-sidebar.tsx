"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingCart,
  Tags,
  TicketPercent,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Moon,
  Sun,
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

const menuItems = [
  {
    title: "الرئيسية",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "المستخدمين",
    url: "/admin/users",
    icon: Users,
    badge: "12",
  },
  {
    title: "التجار",
    url: "/admin/merchants",
    icon: Store,
    badge: null,
  },
  {
    title: "المتاجر",
    url: "/admin/stores",
    icon: Store,
    badge: "5",
  },
  {
    title: "المنتجات",
    url: "/admin/products",
    icon: Package,
    badge: null,
  },
  {
    title: "الطلبات",
    url: "/admin/orders",
    icon: ShoppingCart,
    badge: "28",
  },
  {
    title: "الفئات",
    url: "/admin/categories",
    icon: Tags,
    badge: null,
  },
  {
    title: "الكوبونات",
    url: "/admin/coupons",
    icon: TicketPercent,
    badge: null,
  },
  {
    title: "الاشتراكات",
    url: "/admin/subscriptions",
    icon: CreditCard,
    badge: null,
  },
  {
    title: "التقارير",
    url: "/admin/reports",
    icon: BarChart3,
    badge: null,
  },
  {
    title: "الإعدادات",
    url: "/admin/settings",
    icon: Settings,
    badge: null,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const { theme, setTheme } = useTheme()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar side="right" collapsible="icon" className="border-l border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">نون أدمن</span>
              <span className="text-xs text-muted-foreground">لوحة التحكم</span>
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
                          isActive && "bg-primary/10 text-primary font-medium"
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
                              className="mr-auto bg-primary/10 text-primary text-xs px-2 py-0.5"
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
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/admin-avatar.png" alt="Admin" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      أدمن
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>الإشعارات</span>
                    <Badge className="mr-auto">3</Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <Sun className="ml-2 h-4 w-4" />
                  ) : (
                    <Moon className="ml-2 h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
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
