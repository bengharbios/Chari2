"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  Package,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

// Sample products data
const products = [
  {
    id: 1,
    name: "قميص قطني أبيض",
    sku: "SKU-001",
    category: "ملابس رجالية",
    price: 100,
    salePrice: 85,
    stock: 45,
    variants: 3,
    status: "active",
    image: "/product-1.png",
    sales: 156,
    rating: 4.8,
  },
  {
    id: 2,
    name: "بنطال جينز كلاسيك",
    sku: "SKU-002",
    category: "ملابس رجالية",
    price: 200,
    salePrice: null,
    stock: 32,
    variants: 5,
    status: "active",
    image: "/product-2.png",
    sales: 134,
    rating: 4.5,
  },
  {
    id: 3,
    name: "جاكيت جلد أسود",
    sku: "SKU-003",
    category: "ملابس رجالية",
    price: 300,
    salePrice: 250,
    stock: 18,
    variants: 2,
    status: "active",
    image: "/product-3.png",
    sales: 98,
    rating: 4.9,
  },
  {
    id: 4,
    name: "حزام جلد فاخر",
    sku: "SKU-004",
    category: "إكسسوارات",
    price: 100,
    salePrice: null,
    stock: 65,
    variants: 4,
    status: "active",
    image: "/product-4.png",
    sales: 87,
    rating: 4.6,
  },
  {
    id: 5,
    name: "نظارة شمسية راقية",
    sku: "SKU-005",
    category: "إكسسوارات",
    price: 200,
    salePrice: 150,
    stock: 8,
    variants: 2,
    status: "low_stock",
    image: "/product-5.png",
    sales: 76,
    rating: 4.7,
  },
  {
    id: 6,
    name: "ساعة يد كلاسيك",
    sku: "SKU-006",
    category: "إكسسوارات",
    price: 500,
    salePrice: null,
    stock: 4,
    variants: 1,
    status: "low_stock",
    image: "/product-6.png",
    sales: 45,
    rating: 4.9,
  },
  {
    id: 7,
    name: "فستان سهرة أنيق",
    sku: "SKU-007",
    category: "ملابس نسائية",
    price: 450,
    salePrice: 380,
    stock: 0,
    variants: 3,
    status: "out_of_stock",
    image: "/product-7.png",
    sales: 67,
    rating: 4.8,
  },
  {
    id: 8,
    name: "حقيبة يد جلدية",
    sku: "SKU-008",
    category: "إكسسوارات",
    price: 350,
    salePrice: null,
    stock: 22,
    variants: 4,
    status: "draft",
    image: "/product-8.png",
    sales: 0,
    rating: 0,
  },
]

const categories = [
  { id: 1, name: "ملابس رجالية", count: 45 },
  { id: 2, name: "ملابس نسائية", count: 38 },
  { id: 3, name: "إكسسوارات", count: 52 },
  { id: 4, name: "أحذية", count: 21 },
]

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    active: { label: "نشط", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
    draft: { label: "مسودة", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: Edit },
    low_stock: { label: "مخزون منخفض", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: AlertTriangle },
    out_of_stock: { label: "نفذ المخزون", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  }
  return config[status] || config.draft
}

export default function StoreProductsPage() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.includes(searchQuery) || product.sku.includes(searchQuery)
      const matchesCategory = selectedCategory === "all" || product.category === categories.find(c => c.id.toString() === selectedCategory)?.name
      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, selectedCategory, selectedStatus])

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter(p => p.status === "active").length,
    lowStock: products.filter(p => p.status === "low_stock").length,
    outOfStock: products.filter(p => p.status === "out_of_stock").length,
    draft: products.filter(p => p.status === "draft").length,
  }), [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجات متجرك ومتغيراتها</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 ml-2" />
            استيراد
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 ml-2" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <AddProductDialog onClose={() => setIsAddProductOpen(false)} />
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedStatus("all")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المنتجات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-500/50 transition-colors" onClick={() => setSelectedStatus("active")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نشطة</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-yellow-500/50 transition-colors" onClick={() => setSelectedStatus("low_stock")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setSelectedStatus("out_of_stock")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نفذ المخزون</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-gray-500/50 transition-colors" onClick={() => setSelectedStatus("draft")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مسودات</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-1 gap-3 items-center w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="low_stock">مخزون منخفض</SelectItem>
                  <SelectItem value="out_of_stock">نفذ المخزون</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {selectedProducts.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      إجراءات ({selectedProducts.length})
                      <ChevronDown className="h-4 w-4 mr-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <CheckCircle className="h-4 w-4 ml-2" />
                      تفعيل المحدد
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <XCircle className="h-4 w-4 ml-2" />
                      إلغاء التفعيل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف المحدد
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      {viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProducts(filteredProducts.map(p => p.id))
                        } else {
                          setSelectedProducts([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">المخزون</TableHead>
                  <TableHead className="text-right">المتغيرات</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">المبيعات</TableHead>
                  <TableHead className="text-right w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const statusConfig = getStatusBadge(product.status)
                  return (
                    <TableRow key={product.id} className="group">
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedProducts([...selectedProducts, product.id])
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div>
                          {product.salePrice ? (
                            <>
                              <span className="font-medium">{product.salePrice} ر.س</span>
                              <span className="text-sm text-muted-foreground line-through mr-2">
                                {product.price} ر.س
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">{product.price} ر.س</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            product.stock === 0 ? "text-red-600" :
                            product.stock < 10 ? "text-yellow-600" : ""
                          )}>
                            {product.stock}
                          </span>
                          {product.stock < 10 && product.stock > 0 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.variants} متغير</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.className}>
                          <statusConfig.icon className="h-3 w-3 ml-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 ml-2" />
                              عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 ml-2" />
                              نسخ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        // Grid View
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const statusConfig = getStatusBadge(product.status)
            return (
              <Card key={product.id} className="overflow-hidden group">
                <div className="aspect-square bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {product.salePrice && (
                    <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-sm font-bold">
                      خصم {Math.round((1 - product.salePrice / product.price) * 100)}%
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button size="icon" variant="secondary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="secondary">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{product.salePrice} ر.س</span>
                            <span className="text-sm text-muted-foreground line-through">
                              {product.price} ر.س
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold">{product.price} ر.س</span>
                        )}
                      </div>
                      <Badge variant="outline">{product.variants} متغير</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">المخزون: {product.stock}</span>
                      <span className="text-muted-foreground">{product.sales} مبيعة</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Add Product Dialog Component
function AddProductDialog({ onClose }: { onClose: () => void }) {
  const [variants, setVariants] = useState([{ id: 1, name: "متغير 1", price: "", stock: "", sku: "" }])
  const [images, setImages] = useState<string[]>([])

  const addVariant = () => {
    setVariants([...variants, { id: variants.length + 1, name: `متغير ${variants.length + 1}`, price: "", stock: "", sku: "" }])
  }

  const removeVariant = (id: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id))
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>إضافة منتج جديد</DialogTitle>
        <DialogDescription>
          أضف منتجاً جديداً إلى متجرك مع جميع التفاصيل والمتغيرات
        </DialogDescription>
      </DialogHeader>
      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-6 pb-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات أساسية</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج (عربي) *</Label>
                <Input id="name" placeholder="مثال: قميص قطني أبيض" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم المنتج (إنجليزي)</Label>
                <Input id="nameEn" placeholder="e.g., White Cotton Shirt" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">رمز المنتج (SKU) *</Label>
                <Input id="sku" placeholder="SKU-XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">الباركود</Label>
                <Input id="barcode" placeholder="اختياري" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">وصف المنتج</Label>
              <Textarea id="description" placeholder="اكتب وصفاً تفصيلياً للمنتج..." rows={4} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">العلامة التجارية</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العلامة التجارية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">علامة 1</SelectItem>
                    <SelectItem value="2">علامة 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">التسعير</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="basePrice">السعر الأساسي (ر.س) *</Label>
                <Input id="basePrice" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">سعر العرض (ر.س)</Label>
                <Input id="salePrice" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPrice">سعر التكلفة (ر.س)</Label>
                <Input id="costPrice" type="number" placeholder="0.00" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Inventory */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">المخزون</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalStock">الكمية المتوفرة</Label>
                <Input id="totalStock" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStock">حد التنبيه</Label>
                <Input id="lowStock" type="number" placeholder="5" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">المتغيرات</h3>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة متغير
              </Button>
            </div>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <Card key={variant.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label>اسم المتغير</Label>
                          <Input placeholder="مثال: أخضر - XL" />
                        </div>
                        <div className="space-y-2">
                          <Label>السعر</Label>
                          <Input type="number" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                          <Label>المخزون</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label>SKU المتغير</Label>
                          <Input placeholder="SKU-XXX-V1" />
                        </div>
                      </div>
                      {variants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">صور المنتج</h3>
            <div className="grid gap-4 md:grid-cols-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-xs">صورة {i}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              يمكنك إضافة حتى 10 صور. الصورة الأولى ستكون الصورة الرئيسية.
            </p>
          </div>

          <Separator />

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">تحسينات محركات البحث (SEO)</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">عنوان الصفحة</Label>
                <Input id="metaTitle" placeholder="عنوان مخصص للصفحة" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">وصف الصفحة</Label>
                <Textarea id="metaDescription" placeholder="وصف مخصص لمحركات البحث..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">الكلمات المفتاحية</Label>
                <Input id="metaKeywords" placeholder="كلمة1, كلمة2, كلمة3" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">معلومات الشحن</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="weight">الوزن (كجم)</Label>
                <Input id="weight" type="number" placeholder="0.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">الطول (سم)</Label>
                <Input id="length" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">العرض (سم)</Label>
                <Input id="width" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">الارتفاع (سم)</Label>
                <Input id="height" type="number" placeholder="0" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">حالة المنتج</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="active" />
                <Label htmlFor="active">نشط</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="featured" />
                <Label htmlFor="featured">مميز</Label>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter className="border-t pt-4">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button variant="secondary" onClick={onClose}>حفظ كمسودة</Button>
        <Button onClick={onClose}>نشر المنتج</Button>
      </DialogFooter>
    </DialogContent>
  )
}
