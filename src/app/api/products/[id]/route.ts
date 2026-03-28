/**
 * Product [id] API Routes
 * Handles single product operations
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProductStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]
 * Get product by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const product = await db.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { sku: id },
        ],
      },
      include: {
        category: {
          include: {
            parent: true,
            specifications: {
              where: { isFilterable: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        brand: true,
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        specifications: {
          include: {
            specification: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        merchant: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            totalReviews: true,
          },
        },
        store: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            logo: true,
            rating: true,
            totalReviews: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return Response.json({
        success: false,
        message: 'المنتج غير موجود',
      }, { status: 404 });
    }

    // Increment view count
    await db.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // Parse JSON fields
    const productResponse = {
      ...product,
      images: JSON.parse(product.images),
      highlights: product.highlights ? JSON.parse(product.highlights) : null,
      shippingCities: product.shippingCities ? JSON.parse(product.shippingCities) : null,
      variants: product.variants.map(v => ({
        ...v,
        images: v.images ? JSON.parse(v.images) : [],
        customAttributes: v.customAttributes ? JSON.parse(v.customAttributes) : null,
      })),
      specifications: product.specifications.map(s => ({
        id: s.id,
        nameAr: s.specification.nameAr,
        nameEn: s.specification.nameEn,
        value: s.value,
        unit: s.specification.unit,
      })),
      reviews: product.reviews.map(r => ({
        ...r,
        images: r.images ? JSON.parse(r.images) : [],
      })),
    };

    return Response.json({
      success: true,
      data: productResponse,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء جلب المنتج',
    }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id]
 * Update product
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }

    if (!isActiveUser(user)) {
      return AuthResponses.forbidden('حسابك غير مفعل');
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing product
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        merchant: true,
        store: true,
      },
    });

    if (!existingProduct) {
      return Response.json({
        success: false,
        message: 'المنتج غير موجود',
      }, { status: 404 });
    }

    // Check ownership
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === existingProduct.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === existingProduct.storeId;
    }

    if (!hasPermission) {
      return AuthResponses.forbidden('ليس لديك صلاحية لتعديل هذا المنتج');
    }

    // Update product
    const updateData: Record<string, unknown> = {};
    
    // Only update provided fields
    if (body.nameAr !== undefined) updateData.nameAr = body.nameAr;
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.salePrice !== undefined) updateData.salePrice = body.salePrice;
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice;
    if (body.totalStock !== undefined) updateData.totalStock = body.totalStock;
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = body.lowStockThreshold;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isFlashSale !== undefined) updateData.isFlashSale = body.isFlashSale;
    if (body.flashSaleEndsAt !== undefined) updateData.flashSaleEndsAt = body.flashSaleEndsAt ? new Date(body.flashSaleEndsAt) : null;
    
    // Handle JSON fields
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images);
    if (body.highlights !== undefined) updateData.highlights = body.highlights ? JSON.stringify(body.highlights) : null;
    if (body.shippingCities !== undefined) updateData.shippingCities = body.shippingCities ? JSON.stringify(body.shippingCities) : null;
    
    // Handle SEO fields
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.metaKeywords !== undefined) updateData.metaKeywords = body.metaKeywords;

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    });

    return Response.json({
      success: true,
      data: product,
      message: 'تم تحديث المنتج بنجاح',
    });
  } catch (error) {
    console.error('Update product error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المنتج',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 * Delete product (soft delete by changing status to SUSPENDED)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }

    if (!isActiveUser(user)) {
      return AuthResponses.forbidden('حسابك غير مفعل');
    }

    const { id } = await params;

    // Get existing product
    const existingProduct = await db.product.findUnique({
      where: { id },
      include: {
        merchant: true,
        store: true,
      },
    });

    if (!existingProduct) {
      return Response.json({
        success: false,
        message: 'المنتج غير موجود',
      }, { status: 404 });
    }

    // Check ownership
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === existingProduct.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === existingProduct.storeId;
    }

    if (!hasPermission) {
      return AuthResponses.forbidden('ليس لديك صلاحية لحذف هذا المنتج');
    }

    // Soft delete by changing status
    await db.product.update({
      where: { id },
      data: { status: ProductStatus.SUSPENDED },
    });

    return Response.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء حذف المنتج',
    }, { status: 500 });
  }
}
