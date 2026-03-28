'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronLeft,
  ChevronRight,
  Star,
  Truck,
  Shield,
  CreditCard,
  HeadphonesIcon,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Clock,
  Percent,
  TrendingUp,
  Package,
  Sparkles,
  Zap
} from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'

// بيانات تجريبية للعرض
const heroSlides = [
  {
    id: 1,
    title: 'عروض الصيف الكبرى',
    subtitle: 'خصومات تصل إلى 70% على جميع المنتجات',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    cta: 'تسوق الآن',
    bgColor: 'from-primary/20 to-accent/20'
  },
  {
    id: 2,
    title: 'أجهزة إلكترونية مميزة',
    subtitle: 'أحدث الهواتف والأجهزة بأسعار لا تُقاوم',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=400&fit=crop',
    cta: 'اكتشف المزيد',
    bgColor: 'from-blue-500/20 to-purple-500/20'
  },
  {
    id: 3,
    title: 'أزياء وموضة',
    subtitle: 'تشكيلة جديدة من أحدث صيحات الموضة',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop',
    cta: 'تصفح التشكيلة',
    bgColor: 'from-pink-500/20 to-rose-500/20'
  }
]

const categories = [
  { id: 1, name: 'إلكترونيات', icon: '📱', count: 2540, color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 2, name: 'أزياء رجالية', icon: '👔', count: 1820, color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 3, name: 'أزياء نسائية', icon: '👗', count: 3200, color: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 4, name: 'منزل ومطبخ', icon: '🏠', count: 1560, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 5, name: 'جمال وعناية', icon: '💄', count: 980, color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 6, name: 'رياضة ولياقة', icon: '⚽', count: 720, color: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 7, name: 'كتب ومستلزمات', icon: '📚', count: 450, color: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 8, name: 'ألعاب أطفال', icon: '🧸', count: 890, color: 'bg-red-100 dark:bg-red-900/30' },
]

const flashSaleProducts = [
  { id: 1, name: 'سماعات لاسلكية بلوتوث', price: 199, oldPrice: 399, discount: 50, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', sold: 156, total: 200 },
  { id: 2, name: 'ساعة ذكية رياضية', price: 299, oldPrice: 599, discount: 50, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', sold: 89, total: 150 },
  { id: 3, name: 'حقيبة ظهر عصرية', price: 149, oldPrice: 249, discount: 40, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop', sold: 234, total: 300 },
  { id: 4, name: 'نظارة شمسية أنيقة', price: 89, oldPrice: 179, discount: 50, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop', sold: 178, total: 250 },
]

const featuredProducts = [
  { id: 1, name: 'هاتف ذكي متطور', price: 2499, rating: 4.8, reviews: 256, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop', isFreeShipping: true },
  { id: 2, name: 'لابتوب احترافي', price: 4999, rating: 4.9, reviews: 189, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop', isFreeShipping: true },
  { id: 3, name: 'كاميرا رقمية', price: 1899, rating: 4.7, reviews: 124, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop', isFreeShipping: false },
  { id: 4, name: 'سماعات رأسية', price: 599, rating: 4.6, reviews: 312, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=200&fit=crop', isFreeShipping: true },
  { id: 5, name: 'تلفزيون ذكي', price: 3299, rating: 4.8, reviews: 98, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop', isFreeShipping: true },
  { id: 6, name: 'جهاز ألعاب', price: 1999, rating: 4.9, reviews: 445, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop', isFreeShipping: false },
  { id: 7, name: 'طابعة ليزر', price: 799, rating: 4.5, reviews: 67, image: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200&h=200&fit=crop', isFreeShipping: false },
  { id: 8, name: 'جهاز توجيه WiFi', price: 299, rating: 4.4, reviews: 234, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', isFreeShipping: true },
]

const features = [
  { icon: Truck, title: 'توصيل مجاني', description: 'للطلبات أكثر من 200 ريال' },
  { icon: Shield, title: 'ضمان الجودة', description: 'ضمان على جميع المنتجات' },
  { icon: CreditCard, title: 'دفع آمن', description: 'تشفير كامل للبيانات' },
  { icon: HeadphonesIcon, title: 'دعم 24/7', description: 'فريق دعم متخصص' },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [flashSaleTime, setFlashSaleTime] = useState({ hours: 5, minutes: 23, seconds: 45 })
  const [searchQuery, setSearchQuery] = useState('')

  // Timer للفلاش سيل
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTime(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-slide للهيرو
  useEffect(() => {
    const slider = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(slider)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        {/* Top Bar */}
        <div className="bg-primary text-primary-foreground py-2">
          <div className="container mx-auto px-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>920012345</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                <span>support@souq.com</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/login" className="hover:underline">تسجيل الدخول</Link>
              <span>|</span>
              <Link href="/auth/login" className="hover:underline">إنشاء حساب</Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">س</span>
              </div>
              <span className="text-2xl font-bold text-primary">سوق</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ابحث عن منتجات، علامات تجارية، وأكثر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-4 pl-12 h-12 rounded-full border-2 focus:border-primary"
                />
                <Button className="absolute left-1 top-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/90">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">3</span>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">5</span>
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost" size="icon">
                  <User className="w-6 h-6" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-4 pl-12 h-10 rounded-full"
              />
              <Button className="absolute left-1 top-1 h-8 w-8 rounded-full bg-primary">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t hidden md:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-6 py-3 text-sm">
              <li><Link href="#" className="flex items-center gap-1 hover:text-primary font-medium"><Menu className="w-4 h-4" /> جميع الأقسام</Link></li>
              <li><Link href="#" className="hover:text-primary">إلكترونيات</Link></li>
              <li><Link href="#" className="hover:text-primary">أزياء</Link></li>
              <li><Link href="#" className="hover:text-primary">منزل ومطبخ</Link></li>
              <li><Link href="#" className="hover:text-primary text-accent font-bold flex items-center gap-1"><Zap className="w-4 h-4" /> عروض اليوم</Link></li>
              <li><Link href="#" className="hover:text-primary">جديدنا</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Slider */}
        <section className="relative overflow-hidden">
          <div className="relative h-[300px] md:h-[450px]">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-l ${slide.bgColor}`} />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center container mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-rtl">{slide.title}</h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-6">{slide.subtitle}</p>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
                      {slide.cta}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Controls */}
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center shadow-lg hover:bg-background"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % heroSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center shadow-lg hover:bg-background"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-6 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg">
                  <feature.icon className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-bold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                تسوق حسب الفئة
              </h2>
              <Link href="#" className="text-primary hover:underline">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {categories.map((category) => (
                <Link key={category.id} href="#" className="group">
                  <Card className="text-center p-4 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${category.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                      {category.icon}
                    </div>
                    <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} منتج</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Flash Sale */}
        <section className="py-8 bg-gradient-to-l from-accent/10 to-primary/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-accent" />
                  عروض فلاش
                </h2>
                <div className="flex items-center gap-2 bg-background rounded-lg px-4 py-2 shadow">
                  <Clock className="w-5 h-5 text-accent" />
                  <div className="flex items-center gap-1 font-mono font-bold">
                    <span className="bg-muted px-2 py-1 rounded">{String(flashSaleTime.hours).padStart(2, '0')}</span>
                    <span>:</span>
                    <span className="bg-muted px-2 py-1 rounded">{String(flashSaleTime.minutes).padStart(2, '0')}</span>
                    <span>:</span>
                    <span className="bg-muted px-2 py-1 rounded">{String(flashSaleTime.seconds).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
              <Link href="#" className="text-primary hover:underline">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashSaleProducts.map((product) => (
                <Link key={product.id} href="#">
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="relative">
                      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
                      <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                        -{product.discount}%
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-primary">{product.price} ر.س</span>
                        <span className="text-sm text-muted-foreground line-through">{product.oldPrice}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full"
                          style={{ width: `${(product.sold / product.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">تم بيع {product.sold} من {product.total}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                المنتجات المميزة
              </h2>
              <Link href="#" className="text-primary hover:underline">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <Link key={product.id} href="#">
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group">
                    <div className="relative">
                      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
                      <button className="absolute top-2 left-2 w-8 h-8 bg-background/80 rounded-full flex items-center justify-center hover:bg-background">
                        <Heart className="w-4 h-4" />
                      </button>
                      {product.isFreeShipping && (
                        <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs">
                          <Truck className="w-3 h-3 ml-1" /> شحن مجاني
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                      <p className="font-bold text-primary">{product.price} ر.س</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden h-48 bg-gradient-to-l from-primary/20 to-primary/5 flex items-center p-8">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">تسوق كتاجر</h3>
                  <p className="text-muted-foreground mb-4">انضم لآلاف التجار وابدأ البيع اليوم</p>
                  <Button className="bg-primary">ابدأ الآن</Button>
                </div>
                <Package className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-32 text-primary/20" />
              </div>
              <div className="relative rounded-xl overflow-hidden h-48 bg-gradient-to-l from-accent/20 to-accent/5 flex items-center p-8">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">احصل على خصم 20%</h3>
                  <p className="text-muted-foreground mb-4">اشترك في النشرة البريدية</p>
                  <div className="flex gap-2">
                    <Input placeholder="بريدك الإلكتروني" className="w-48" />
                    <Button className="bg-accent text-accent-foreground">اشتراك</Button>
                  </div>
                </div>
                <Percent className="absolute left-8 top-1/2 -translate-y-1/2 w-32 h-32 text-accent/20" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">س</span>
                </div>
                <span className="text-2xl font-bold text-primary">سوق</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                منصة تجارة إلكترونية متكاملة توفر أفضل المنتجات بأفضل الأسعار مع توصيل سريع وآمن.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">من نحن</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">اتصل بنا</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">الأسئلة الشائعة</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">سياسة الخصوصية</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">الشروط والأحكام</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-bold mb-4">خدمة العملاء</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">تتبع طلبك</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">سياسة الإرجاع</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">طرق الدفع</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">الشحن والتوصيل</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">مركز المساعدة</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  الرياض، المملكة العربية السعودية
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  920012345
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  support@souq.com
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t mt-8 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2024 سوق. جميع الحقوق محفوظة.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">طرق الدفع:</span>
                <div className="flex gap-2">
                  <div className="w-12 h-8 bg-background rounded flex items-center justify-center text-xs font-bold border">مدى</div>
                  <div className="w-12 h-8 bg-background rounded flex items-center justify-center text-xs font-bold border">فيزا</div>
                  <div className="w-12 h-8 bg-background rounded flex items-center justify-center text-xs font-bold border">STC</div>
                  <div className="w-12 h-8 bg-background rounded flex items-center justify-center text-xs font-bold border">Apple</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
