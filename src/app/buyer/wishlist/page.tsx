/**
 * Buyer Wishlist Page
 * Saved products with add to cart and remove functionality
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Share2,
  Eye,
  Grid3X3,
  List,
  Filter,
  ArrowUpDown,
  CheckCircle,
  X,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

// Mock wishlist data
const initialWishlistItems = [
  {
    id: '1',
    productId: 'prod-001',
    name: 'سماعات لاسلكية بلوتوث برو - إلغاء الضوضاء النشط',
    price: 299,
    originalPrice: 399,
    discount: 25,
    image: 'https://picsum.photos/seed/wish1/300/300',
    rating: 4.5,
    reviews: 128,
    store: 'متجر التقنية',
    inStock: true,
    addedAt: '2024-01-15',
  },
  {
    id: '2',
    productId: 'prod-002',
    name: 'ساعة ذكية رياضية مقاومة للماء - متتبع اللياقة البدنية',
    price: 450,
    originalPrice: null,
    discount: null,
    image: 'https://picsum.photos/seed/wish2/300/300',
    rating: 4.8,
    reviews: 256,
    store: 'متجر الإلكترونيات',
    inStock: true,
    addedAt: '2024-01-14',
  },
  {
    id: '3',
    productId: 'prod-003',
    name: 'حقيبة ظهر جلدية فاخرة للابتوب 15 بوصة',
    price: 189,
    originalPrice: 250,
    discount: 24,
    image: 'https://picsum.photos/seed/wish3/300/300',
    rating: 4.2,
    reviews: 89,
    store: 'متجر الجلود',
    inStock: true,
    addedAt: '2024-01-13',
  },
  {
    id: '4',
    productId: 'prod-004',
    name: 'كاميرا رقمية احترافية DSLR مع عدسة 18-55mm',
    price: 2899,
    originalPrice: 3200,
    discount: 9,
    image: 'https://picsum.photos/seed/wish4/300/300',
    rating: 4.9,
    reviews: 412,
    store: 'متجر التصوير',
    inStock: false,
    addedAt: '2024-01-12',
  },
  {
    id: '5',
    productId: 'prod-005',
    name: 'مسجل صوتي محمول احترافي - 4K تسجيل',
    price: 799,
    originalPrice: null,
    discount: null,
    image: 'https://picsum.photos/seed/wish5/300/300',
    rating: 4.6,
    reviews: 67,
    store: 'متجر الصوتيات',
    inStock: true,
    addedAt: '2024-01-11',
  },
  {
    id: '6',
    productId: 'prod-006',
    name: 'طابعة ليزر ملونة متعددة الوظائف - WiFi',
    price: 1250,
    originalPrice: 1450,
    discount: 14,
    image: 'https://picsum.photos/seed/wish6/300/300',
    rating: 4.3,
    reviews: 234,
    store: 'متجر المكتبة',
    inStock: true,
    addedAt: '2024-01-10',
  },
];

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string;
  rating: number;
  reviews: number;
  store: string;
  inStock: boolean;
  addedAt: string;
}

export default function BuyerWishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [addedToCartItems, setAddedToCartItems] = useState<string[]>([]);

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map((item) => item.id));
    }
  };

  const handleDeleteItem = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((i) => i !== id));
    setDeleteItemId(null);
  };

  const handleDeleteSelected = () => {
    setWishlistItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handleAddToCart = (id: string) => {
    // Simulate adding to cart
    setAddedToCartItems((prev) => [...prev, id]);
    setTimeout(() => {
      setAddedToCartItems((prev) => prev.filter((i) => i !== id));
    }, 2000);
  };

  const handleAddSelectedToCart = () => {
    // Simulate adding selected items to cart
    const inStockSelected = wishlistItems.filter(
      (item) => selectedItems.includes(item.id) && item.inStock
    );
    setAddedToCartItems((prev) => [...prev, ...inStockSelected.map((i) => i.id)]);
    setTimeout(() => {
      setAddedToCartItems([]);
    }, 2000);
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">قائمة الأمنيات</h1>
          <p className="text-muted-foreground">
            {wishlistItems.length} منتج محفوظ
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <ArrowUpDown className="h-4 w-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="price-low">السعر: الأقل</SelectItem>
              <SelectItem value="price-high">السعر: الأعلى</SelectItem>
              <SelectItem value="rating">التقييم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection Bar */}
      {wishlistItems.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="selectAll"
                  checked={selectedItems.length === wishlistItems.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="cursor-pointer">
                  تحديد الكل ({selectedItems.length} محدد)
                </Label>
              </div>
              <div className="flex gap-2">
                {selectedItems.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSelectedToCart}
                      className="gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      إضافة المحدد للسلة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteSelected}
                      className="text-destructive gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف المحدد
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="h-20 w-20 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              قائمة الأمنيات فارغة
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              لم تقم بإضافة أي منتجات إلى قائمة الأمنيات بعد. تصفح المنتجات وأضف ما يعجبك!
            </p>
            <Link href="/">
              <Button className="gap-2">
                تسوق الآن
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedItems.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden transition-all hover:shadow-lg ${
                !item.inStock ? 'opacity-70' : ''
              }`}
            >
              <div className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    className="bg-white/80"
                  />
                </div>

                {/* Discount Badge */}
                {item.discount && (
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                    -{item.discount}%
                  </Badge>
                )}

                {/* Out of Stock Overlay */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <Badge variant="destructive" className="text-sm">
                      نفذت الكمية
                    </Badge>
                  </div>
                )}

                {/* Image */}
                <Link href={`/products/${item.productId}`}>
                  <div className="aspect-square bg-muted overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Store */}
                <p className="text-xs text-muted-foreground">{item.store}</p>

                {/* Name */}
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= Math.floor(item.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({item.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {item.price} ر.س
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {item.originalPrice} ر.س
                    </span>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  {addedToCartItems.includes(item.id) ? (
                    <Button className="flex-1 gap-2 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-4 w-4" />
                      تمت الإضافة
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 gap-2"
                      disabled={!item.inStock}
                      onClick={() => handleAddToCart(item.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      أضف للسلة
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteItemId(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {sortedItems.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden ${!item.inStock ? 'opacity-70' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Selection Checkbox */}
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleSelectItem(item.id)}
                    />
                  </div>

                  {/* Image */}
                  <Link href={`/products/${item.productId}`}>
                    <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                      {item.discount && (
                        <Badge className="absolute top-1 left-1 bg-accent text-accent-foreground text-[10px]">
                          -{item.discount}%
                        </Badge>
                      )}
                      {!item.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">{item.store}</p>
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-medium text-foreground line-clamp-1 hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${
                              star <= Math.floor(item.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.rating} ({item.reviews} تقييم)
                      </span>
                    </div>
                    {!item.inStock && (
                      <Badge variant="destructive" className="mt-2">
                        نفذت الكمية
                      </Badge>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-left">
                      <span className="text-lg font-bold text-primary">
                        {item.price} ر.س
                      </span>
                      {item.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {item.originalPrice} ر.س
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {addedToCartItems.includes(item.id) ? (
                        <Button size="sm" className="gap-2 bg-green-500 hover:bg-green-600">
                          <CheckCircle className="h-4 w-4" />
                          تمت الإضافة
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="gap-2"
                          disabled={!item.inStock}
                          onClick={() => handleAddToCart(item.id)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          أضف للسلة
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteItemId(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteItemId}
        onOpenChange={() => setDeleteItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إزالة من قائمة الأمنيات</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إزالة هذا المنتج من قائمة الأمنيات؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteItemId && handleDeleteItem(deleteItemId)}
            >
              إزالة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Import Label component
function Label({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none ${className || ''}`}>
      {children}
    </label>
  );
}
