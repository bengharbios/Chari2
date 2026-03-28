import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/merchant/products - Get all products for a merchant
export async function GET(request: NextRequest) {
  try {
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id'; // This would come from auth

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      merchantId,
    };

    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (status) {
      where.status = status;
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          category: {
            select: { nameAr: true, nameEn: true },
          },
          variants: {
            select: { id: true, nameAr: true, stock: true, price: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching merchant products:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}

// POST /api/merchant/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id'; // This would come from auth

    const body = await request.json();
    const {
      nameAr,
      nameEn,
      sku,
      barcode,
      description,
      descriptionEn,
      categoryId,
      brandId,
      basePrice,
      salePrice,
      costPrice,
      totalStock,
      lowStockThreshold,
      weight,
      length,
      width,
      height,
      images,
      videoUrl,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
    } = body;

    // Validate required fields
    if (!nameAr || !sku || !categoryId || !basePrice) {
      return NextResponse.json(
        { success: false, error: 'يرجى ملء جميع الحقول المطلوبة' },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const existingSku = await db.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return NextResponse.json(
        { success: false, error: 'رمز المنتج (SKU) مستخدم بالفعل' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = nameAr
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9-]/g, '');

    // Create product
    const product = await db.product.create({
      data: {
        nameAr,
        nameEn,
        sku,
        barcode,
        slug: `${slug}-${Date.now()}`,
        description,
        descriptionEn,
        categoryId,
        brandId,
        merchantId,
        basePrice: parseFloat(basePrice),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        totalStock: parseInt(totalStock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        images: images || '[]',
        videoUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        status: status || 'DRAFT',
        isFeatured: isFeatured || false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'تم إنشاء المنتج بنجاح',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إنشاء المنتج' },
      { status: 500 }
    );
  }
}
