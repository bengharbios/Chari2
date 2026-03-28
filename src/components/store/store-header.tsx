"use client"

import { Bell, Search, Menu, ChevronDown } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface StoreHeaderProps {
  storeName?: string
  storeLogo?: string
}

export function StoreHeader({ storeName = "متجري", storeLogo }: StoreHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Right side - Sidebar trigger and search */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-2" />
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="بحث في المنتجات، الطلبات..."
              className="w-80 pr-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Left side - Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -left-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-accent text-accent-foreground">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>الإشعارات</span>
                <Badge variant="secondary" className="text-xs">3 جديدة</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="font-medium">طلب جديد #1234</span>
                <span className="text-xs text-muted-foreground">تم استلام طلب جديد من عميل</span>
                <span className="text-xs text-muted-foreground">منذ 5 دقائق</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="font-medium">تحديث المخزون</span>
                <span className="text-xs text-muted-foreground">المنتج "قميص قطني" وصل للحد الأدنى</span>
                <span className="text-xs text-muted-foreground">منذ ساعة</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                <span className="font-medium">تقييم جديد</span>
                <span className="text-xs text-muted-foreground">حصل منتجك على تقييم 5 نجوم</span>
                <span className="text-xs text-muted-foreground">منذ 3 ساعات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/store/notifications" className="w-full text-center text-primary">
                  عرض كل الإشعارات
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Store profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={storeLogo} alt={storeName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {storeName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">{storeName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{storeName}</span>
                  <span className="text-xs text-muted-foreground font-normal">store@example.com</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/store/settings">إعدادات المتجر</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/store/profile">الملف الشخصي</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
