import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/merchant/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    const product = await db.product.findFirst({
      where: {
        id,
        merchantId,
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        specifications: {
          include: {
            specification: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب المنتج' },
      { status: 500 }
    );
  }
}

// PUT /api/merchant/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    // Check if product belongs to merchant
    const existingProduct = await db.product.findFirst({
      where: { id, merchantId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      nameAr,
      nameEn,
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

    // Update product
    const product = await db.product.update({
      where: { id },
      data: {
        nameAr,
        nameEn,
        barcode,
        description,
        descriptionEn,
        categoryId,
        brandId,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        totalStock: totalStock ? parseInt(totalStock) : undefined,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined,
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        images,
        videoUrl,
        metaTitle,
        metaDescription,
        metaKeywords,
        status,
        isFeatured,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'تم تحديث المنتج بنجاح',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث المنتج' },
      { status: 500 }
    );
  }
}

// DELETE /api/merchant/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    // Check if product belongs to merchant
    const existingProduct = await db.product.findFirst({
      where: { id, merchantId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    // Delete product
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
}
