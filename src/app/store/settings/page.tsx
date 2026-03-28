"use client"

import { useState } from "react"
import {
  Store,
  Palette,
  CreditCard,
  Truck,
  Bell,
  Shield,
  Globe,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  MapPin,
  DollarSign,
  Clock,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Sample data
const shippingZones = [
  { id: 1, name: "الرياض والمنطقة الوسطى", cities: ["الرياض", "الخرج", "الدرعية"], price: 25, deliveryTime: "1-3 أيام" },
  { id: 2, name: "جدة والمنطقة الغربية", cities: ["جدة", "مكة", "المدينة"], price: 30, deliveryTime: "2-4 أيام" },
  { id: 3, name: "الدمام والمنطقة الشرقية", cities: ["الدمام", "الخبر", "الظهران"], price: 35, deliveryTime: "2-4 أيام" },
  { id: 4, name: "المناطق الأخرى", cities: ["ابها", "تبوك", "حائل", "الطائف"], price: 45, deliveryTime: "3-5 أيام" },
]

const paymentMethods = [
  { id: 1, name: "مدى", type: "card", enabled: true, fees: "1.5%" },
  { id: 2, name: "Apple Pay", type: "digital", enabled: true, fees: "1.5%" },
  { id: 3, name: "STC Pay", type: "digital", enabled: true, fees: "1.0%" },
  { id: 4, name: "الدفع عند الاستلام", type: "cod", enabled: true, fees: "0%" },
  { id: 5, name: "تقسيط تمارا", type: "bnpl", enabled: false, fees: "3.0%" },
  { id: 6, name: "تقسيط تابي", type: "bnpl", enabled: false, fees: "3.0%" },
]

export default function StoreSettingsPage() {
  const [activeTab, setActiveTab] = useState("store")
  const [storeData, setStoreData] = useState({
    nameAr: "متجر الأناقة",
    nameEn: "Elegance Store",
    description: "متجر متخصص في الملابس والإكسسوارات الراقية للرجال والنساء",
    phone: "920000000",
    email: "support@elegance-store.com",
    logo: null,
    cover: null,
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات متجرك وتخصيصه</p>
        </div>
        <Button>
          <Save className="h-4 w-4 ml-2" />
          حفظ التغييرات
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">المتجر</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">المظهر</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">الدفع</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">الشحن</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">الإشعارات</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">الأمان</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Info Tab */}
        <TabsContent value="store" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Basic Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>معلومات المتجر</CardTitle>
                <CardDescription>المعلومات الأساسية لمتجرك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">اسم المتجر (عربي)</Label>
                    <Input
                      id="nameAr"
                      value={storeData.nameAr}
                      onChange={(e) => setStoreData({ ...storeData, nameAr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">اسم المتجر (إنجليزي)</Label>
                    <Input
                      id="nameEn"
                      value={storeData.nameEn}
                      onChange={(e) => setStoreData({ ...storeData, nameEn: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المتجر</Label>
                  <Textarea
                    id="description"
                    value={storeData.description}
                    onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={storeData.phone}
                        onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                        className="pr-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={storeData.email}
                        onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                        className="pr-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store Logo & Cover */}
            <Card>
              <CardHeader>
                <CardTitle>الشعار والغلاف</CardTitle>
                <CardDescription>صور هوية متجرك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>شعار المتجر</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 rounded-lg">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {storeData.nameAr.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Button variant="outline" size="sm">تغيير الشعار</Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG حتى 2MB
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Label>صورة الغلاف</Label>
                  <div className="aspect-[3/1] rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        اسحب الصورة هنا أو انقر للتحميل
                      </p>
                      <p className="text-xs text-muted-foreground">
                        1200x400 بكسل موصى به
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
              <CardDescription>أضف روابط حسابات متجرك على منصات التواصل</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    Instagram
                  </Label>
                  <Input placeholder="@store_name" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </Label>
                  <Input placeholder="@store_name" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Label>
                  <Input placeholder="facebook.com/store" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    YouTube
                  </Label>
                  <Input placeholder="youtube.com/@store" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>ألوان المتجر</CardTitle>
                <CardDescription>خصص ألوان واجهة متجرك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>اللون الرئيسي</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#00A651" className="w-12 h-12 rounded-lg cursor-pointer" />
                    <Input defaultValue="#00A651" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>اللون الثانوي</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#F7941D" className="w-12 h-12 rounded-lg cursor-pointer" />
                    <Input defaultValue="#F7941D" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>لون الخلفية</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" defaultValue="#FFFFFF" className="w-12 h-12 rounded-lg cursor-pointer" />
                    <Input defaultValue="#FFFFFF" className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الخطوط</CardTitle>
                <CardDescription>اختر خطوط متجرك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>خط العناوين</Label>
                  <Select defaultValue="cairo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cairo">Cairo</SelectItem>
                      <SelectItem value="tajawal">Tajawal</SelectItem>
                      <SelectItem value="almarai">Almarai</SelectItem>
                      <SelectItem value="ibm-plex">IBM Plex Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>خط النصوص</Label>
                  <Select defaultValue="cairo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cairo">Cairo</SelectItem>
                      <SelectItem value="tajawal">Tajawal</SelectItem>
                      <SelectItem value="almarai">Almarai</SelectItem>
                      <SelectItem value="ibm-plex">IBM Plex Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>معاينة المظهر</CardTitle>
              <CardDescription>شاهد كيف سيبدو متجرك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg border bg-muted overflow-hidden">
                <div className="h-16 bg-primary flex items-center px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20" />
                    <span className="text-white font-bold">متجر الأناقة</span>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square rounded-lg bg-muted-foreground/10" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>وسائل الدفع</CardTitle>
              <CardDescription>إدارة طرق الدفع المتاحة في متجرك</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">وسيلة الدفع</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الرسوم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {method.type === 'card' && 'بطاقة'}
                          {method.type === 'digital' && 'رقمي'}
                          {method.type === 'cod' && 'عند الاستلام'}
                          {method.type === 'bnpl' && 'تقسيط'}
                        </Badge>
                      </TableCell>
                      <TableCell>{method.fees}</TableCell>
                      <TableCell>
                        <Switch checked={method.enabled} />
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>الحد الأدنى للطلب</Label>
                  <p className="text-sm text-muted-foreground">أقل قيمة للطلب</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={50} className="w-24" />
                  <span>ر.س</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>الدفع عند الاستلام</Label>
                  <p className="text-sm text-muted-foreground">السماح بالدفع عند الاستلام</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>رسوم الدفع عند الاستلام</Label>
                  <p className="text-sm text-muted-foreground">رسوم إضافية للدفع عند الاستلام</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={15} className="w-24" />
                  <span>ر.س</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>مناطق الشحن</CardTitle>
                <CardDescription>حدد مناطق الشحن وأسعارها</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة منطقة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة منطقة شحن جديدة</DialogTitle>
                    <DialogDescription>
                      أضف منطقة شحن جديدة مع تحديد المدن والسعر
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>اسم المنطقة</Label>
                      <Input placeholder="مثال: المنطقة الجنوبية" />
                    </div>
                    <div className="space-y-2">
                      <Label>المدن</Label>
                      <Input placeholder="أبها، خميس مشيط، نجران" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>سعر الشحن (ر.س)</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label>مدة التوصيل</Label>
                        <Input placeholder="3-5 أيام" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">إلغاء</Button>
                    <Button>حفظ</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنطقة</TableHead>
                    <TableHead className="text-right">المدن</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">مدة التوصيل</TableHead>
                    <TableHead className="text-right w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {zone.cities.slice(0, 3).map((city, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {city}
                            </Badge>
                          ))}
                          {zone.cities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{zone.cities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{zone.price} ر.س</TableCell>
                      <TableCell>{zone.deliveryTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات الشحن</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>شحن مجاني فوق</Label>
                  <p className="text-sm text-muted-foreground">الشحن مجاني للطلبات فوق هذا المبلغ</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={200} className="w-24" />
                  <span>ر.س</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>التوصيل السريع</Label>
                  <p className="text-sm text-muted-foreground">تقديم خيار التوصيل السريع</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>سعر التوصيل السريع</Label>
                  <p className="text-sm text-muted-foreground">رسوم إضافية للتوصيل السريع</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue={25} className="w-24" />
                  <span>ر.س</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>إدارة إشعارات المتجر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "طلبات جديدة", description: "إشعار عند استلام طلب جديد", enabled: true },
                { title: "تحديثات الطلبات", description: "إشعار عند تغيير حالة الطلب", enabled: true },
                { title: "مخزون منخفض", description: "إشعار عند وصول المخزون للحد الأدنى", enabled: true },
                { title: "تقييمات جديدة", description: "إشعار عند تلقي تقييم جديد", enabled: false },
                { title: "تقارير أسبوعية", description: "تقرير أسبوعي بأداء المتجر", enabled: true },
                { title: "عروض تسويقية", description: "إشعارات عن العروض والتحديثات", enabled: false },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{item.title}</Label>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.enabled} />
                  </div>
                  {index < 5 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الأمان</CardTitle>
              <CardDescription>حماية متجرك وبياناتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>المصادقة الثنائية</Label>
                  <p className="text-sm text-muted-foreground">تفعيل التحقق بخطوتين لحسابك</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>إشعارات تسجيل الدخول</Label>
                  <p className="text-sm text-muted-foreground">إشعار عند تسجيل الدخول من جهاز جديد</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>تغيير كلمة المرور</Label>
                <div className="grid gap-3 max-w-md">
                  <Input type="password" placeholder="كلمة المرور الحالية" />
                  <Input type="password" placeholder="كلمة المرور الجديدة" />
                  <Input type="password" placeholder="تأكيد كلمة المرور الجديدة" />
                  <Button variant="outline" className="w-fit">تحديث كلمة المرور</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الجلسات النشطة</CardTitle>
              <CardDescription>الأجهزة التي سجلت الدخول منها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { device: "Chrome على Windows", location: "الرياض، السعودية", lastActive: "الآن", current: true },
                  { device: "Safari على iPhone", location: "جدة، السعودية", lastActive: "منذ ساعتين", current: false },
                  { device: "Chrome على Android", location: "الدمام، السعودية", lastActive: "منذ يوم", current: false },
                ].map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <Badge className="bg-green-100 text-green-700">الجلسة الحالية</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                    {!session.current && (
                      <Button variant="outline" size="sm" className="text-destructive">
                        إنهاء
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
