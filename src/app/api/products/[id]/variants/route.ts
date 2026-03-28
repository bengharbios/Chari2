/**
 * Product Variants API Routes
 * Handles product variant operations
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Variant create/update schema
const variantSchema = z.object({
  sku: z.string().min(1, 'SKU مطلوب'),
  barcode: z.string().optional(),
  nameAr: z.string().min(1, 'اسم المتغير بالعربية مطلوب'),
  nameEn: z.string().optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),
  size: z.string().optional(),
  packageSize: z.string().optional(),
  customAttributes: z.record(z.string()).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
  salePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'المخزون يجب أن يكون أكبر من أو يساوي صفر'),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/products/[id]/variants
 * Get all variants for a product
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if product exists
    const product = await db.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      return Response.json({
        success: false,
        message: 'المنتج غير موجود',
      }, { status: 404 });
    }

    const variants = await db.productVariant.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'asc' },
    });

    // Parse JSON fields
    const variantsResponse = variants.map(v => ({
      ...v,
      images: v.images ? JSON.parse(v.images) : [],
      customAttributes: v.customAttributes ? JSON.parse(v.customAttributes) : null,
    }));

    return Response.json({
      success: true,
      data: variantsResponse,
    });
  } catch (error) {
    console.error('Get variants error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء جلب المتغيرات',
    }, { status: 500 });
  }
}

/**
 * POST /api/products/[id]/variants
 * Add a new variant to product
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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
    const validated = variantSchema.parse(body);

    // Check if product exists and user has permission
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
      return AuthResponses.forbidden('ليس لديك صلاحية لإضافة متغيرات لهذا المنتج');
    }

    // Check if SKU already exists
    const existingVariant = await db.productVariant.findUnique({
      where: { sku: validated.sku },
    });

    if (existingVariant) {
      return Response.json({
        success: false,
        message: 'SKU مستخدم بالفعل',
      }, { status: 400 });
    }

    // Create variant
    const variant = await db.productVariant.create({
      data: {
        productId: id,
        sku: validated.sku,
        barcode: validated.barcode,
        nameAr: validated.nameAr,
        nameEn: validated.nameEn,
        color: validated.color,
        colorCode: validated.colorCode,
        size: validated.size,
        packageSize: validated.packageSize,
        customAttributes: validated.customAttributes ? JSON.stringify(validated.customAttributes) : null,
        price: validated.price,
        salePrice: validated.salePrice,
        stock: validated.stock,
        images: validated.images ? JSON.stringify(validated.images) : null,
        isActive: validated.isActive,
      },
    });

    // Update total stock
    await db.product.update({
      where: { id },
      data: {
        totalStock: {
          increment: validated.stock,
        },
      },
    });

    return Response.json({
      success: true,
      data: {
        ...variant,
        images: variant.images ? JSON.parse(variant.images) : [],
        customAttributes: variant.customAttributes ? JSON.parse(variant.customAttributes) : null,
      },
      message: 'تم إضافة المتغير بنجاح',
    }, { status: 201 });
  } catch (error) {
    console.error('Create variant error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: error.errors,
      }, { status: 400 });
    }
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء إضافة المتغير',
    }, { status: 500 });
  }
}
