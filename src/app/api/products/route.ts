/**
 * Products API Routes
 * Handles product CRUD operations
 */

import { NextRequest } from 'next/server';
import { createProductSchema, productQuerySchema, productIdSchema } from '@/lib/validators';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getRelatedProducts } from '@/lib/services';
import { getUserFromRequest, AuthResponses, hasRole, isActiveUser } from '@/lib/auth';
import { ProductStatus } from '@prisma/client';

/**
 * GET /api/products
 * Get all products with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      brandId: searchParams.get('brandId') || undefined,
      status: searchParams.get('status') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      isFeatured: searchParams.get('isFeatured') || undefined,
      isFlashSale: searchParams.get('isFlashSale') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });
    
    const result = await getProducts(query);
    
    return Response.json({
      success: true,
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return AuthResponses.error('حدث خطأ أثناء جلب المنتجات');
  }
}

/**
 * POST /api/products
 * Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    if (!isActiveUser(user)) {
      return AuthResponses.forbidden('حسابك غير مفعل');
    }
    
    if (!hasRole(user, ['MERCHANT', 'STORE', 'ADMIN'])) {
      return AuthResponses.forbidden('ليس لديك صلاحية لإضافة منتجات');
    }
    
    const body = await request.json();
    const validated = createProductSchema.parse(body);
    
    // Determine merchant/store ID based on user type
    let merchantId: string | undefined;
    let storeId: string | undefined;
    
    if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      merchantId = merchant?.id;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      storeId = store?.id;
    }
    
    const product = await createProduct(validated, merchantId, storeId);
    
    return Response.json({
      success: true,
      data: product,
      message: 'تم إنشاء المنتج بنجاح',
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return AuthResponses.error('حدث خطأ أثناء إنشاء المنتج');
  }
}

/**
 * PUT /api/products
 * Update product
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return AuthResponses.error('معرف المنتج مطلوب');
    }
    
    // Get existing product
    const existingProduct = await db.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return AuthResponses.error('المنتج غير موجود');
    }
    
    // Check ownership (simplified - should check merchant/store ownership)
    const validated = createProductSchema.partial().parse(updateData);
    const product = await updateProduct(id, validated);
    
    return Response.json({
      success: true,
      data: product,
      message: 'تم تحديث المنتج بنجاح',
    });
  } catch (error) {
    console.error('Update product error:', error);
    return AuthResponses.error('حدث خطأ أثناء تحديث المنتج');
  }
}

/**
 * DELETE /api/products
 * Delete product (soft delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return AuthResponses.error('معرف المنتج مطلوب');
    }
    
    await deleteProduct(id);
    
    return Response.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return AuthResponses.error('حدث خطأ أثناء حذف المنتج');
  }
}

// Import db for the handlers
import { db } from '@/lib/db';
