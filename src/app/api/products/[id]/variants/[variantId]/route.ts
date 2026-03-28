/**
 * Product Variant [variantId] API Routes
 * Handles single variant operations
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
    variantId: string;
  }>;
}

// Variant update schema
const variantUpdateSchema = z.object({
  sku: z.string().min(1, 'SKU مطلوب').optional(),
  barcode: z.string().optional(),
  nameAr: z.string().min(1, 'اسم المتغير بالعربية مطلوب').optional(),
  nameEn: z.string().optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),
  size: z.string().optional(),
  packageSize: z.string().optional(),
  customAttributes: z.record(z.string()).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر').optional(),
  salePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'المخزون يجب أن يكون أكبر من أو يساوي صفر').optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/products/[id]/variants/[variantId]
 * Get a single variant
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, variantId } = await params;
    
    const variant = await db.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
    });

    if (!variant) {
      return Response.json({
        success: false,
        message: 'المتغير غير موجود',
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        ...variant,
        images: variant.images ? JSON.parse(variant.images) : [],
        customAttributes: variant.customAttributes ? JSON.parse(variant.customAttributes) : null,
      },
    });
  } catch (error) {
    console.error('Get variant error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء جلب المتغير',
    }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id]/variants/[variantId]
 * Update a variant
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

    const { id, variantId } = await params;
    const body = await request.json();
    const validated = variantUpdateSchema.parse(body);

    // Get existing variant
    const existingVariant = await db.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
      include: {
        product: {
          include: {
            merchant: true,
            store: true,
          },
        },
      },
    });

    if (!existingVariant) {
      return Response.json({
        success: false,
        message: 'المتغير غير موجود',
      }, { status: 404 });
    }

    // Check ownership
    const product = existingVariant.product;
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === product.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === product.storeId;
    }

    if (!hasPermission) {
      return AuthResponses.forbidden('ليس لديك صلاحية لتعديل هذا المتغير');
    }

    // Check if new SKU already exists (if changing SKU)
    if (validated.sku && validated.sku !== existingVariant.sku) {
      const skuExists = await db.productVariant.findUnique({
        where: { sku: validated.sku },
      });
      if (skuExists) {
        return Response.json({
          success: false,
          message: 'SKU مستخدم بالفعل',
        }, { status: 400 });
      }
    }

    // Calculate stock difference
    const stockDiff = validated.stock !== undefined 
      ? validated.stock - existingVariant.stock 
      : 0;

    // Update variant
    const updateData: Record<string, unknown> = {};
    if (validated.sku !== undefined) updateData.sku = validated.sku;
    if (validated.barcode !== undefined) updateData.barcode = validated.barcode;
    if (validated.nameAr !== undefined) updateData.nameAr = validated.nameAr;
    if (validated.nameEn !== undefined) updateData.nameEn = validated.nameEn;
    if (validated.color !== undefined) updateData.color = validated.color;
    if (validated.colorCode !== undefined) updateData.colorCode = validated.colorCode;
    if (validated.size !== undefined) updateData.size = validated.size;
    if (validated.packageSize !== undefined) updateData.packageSize = validated.packageSize;
    if (validated.customAttributes !== undefined) updateData.customAttributes = JSON.stringify(validated.customAttributes);
    if (validated.price !== undefined) updateData.price = validated.price;
    if (validated.salePrice !== undefined) updateData.salePrice = validated.salePrice;
    if (validated.stock !== undefined) updateData.stock = validated.stock;
    if (validated.images !== undefined) updateData.images = JSON.stringify(validated.images);
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;

    const variant = await db.productVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    // Update product total stock if stock changed
    if (stockDiff !== 0) {
      await db.product.update({
        where: { id },
        data: {
          totalStock: {
            increment: stockDiff,
          },
        },
      });
    }

    return Response.json({
      success: true,
      data: {
        ...variant,
        images: variant.images ? JSON.parse(variant.images) : [],
        customAttributes: variant.customAttributes ? JSON.parse(variant.customAttributes) : null,
      },
      message: 'تم تحديث المتغير بنجاح',
    });
  } catch (error) {
    console.error('Update variant error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: error.errors,
      }, { status: 400 });
    }
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث المتغير',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]/variants/[variantId]
 * Delete a variant
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

    const { id, variantId } = await params;

    // Get existing variant
    const existingVariant = await db.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
      include: {
        product: {
          include: {
            merchant: true,
            store: true,
          },
        },
      },
    });

    if (!existingVariant) {
      return Response.json({
        success: false,
        message: 'المتغير غير موجود',
      }, { status: 404 });
    }

    // Check ownership
    const product = existingVariant.product;
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === product.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === product.storeId;
    }

    if (!hasPermission) {
      return AuthResponses.forbidden('ليس لديك صلاحية لحذف هذا المتغير');
    }

    // Delete variant
    await db.productVariant.delete({
      where: { id: variantId },
    });

    // Update product total stock
    await db.product.update({
      where: { id },
      data: {
        totalStock: {
          decrement: existingVariant.stock,
        },
      },
    });

    return Response.json({
      success: true,
      message: 'تم حذف المتغير بنجاح',
    });
  } catch (error) {
    console.error('Delete variant error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء حذف المتغير',
    }, { status: 500 });
  }
}
