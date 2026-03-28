/**
 * Category [id] API Routes
 * Handles single category operations
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, hasRole, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Category update schema
const categoryUpdateSchema = z.object({
  nameAr: z.string().min(1, 'اسم التصنيف بالعربية مطلوب').max(100).optional(),
  nameEn: z.string().max(100).optional(),
  slug: z.string().min(1, 'الرابط مطلوب').max(150).optional(),
  description: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal('')),
  icon: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  showInHome: z.boolean().optional(),
});

/**
 * GET /api/categories/[id]
 * Get category by ID or slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const category = await db.category.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        parent: {
          include: {
            parent: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: [
            { sortOrder: 'asc' },
            { nameAr: 'asc' },
          ],
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        specifications: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      return Response.json({
        success: false,
        message: 'التصنيف غير موجود',
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      data: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Get category error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء جلب التصنيف',
    }, { status: 500 });
  }
}

/**
 * PUT /api/categories/[id]
 * Update category
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

    if (!hasRole(user, ['ADMIN'])) {
      return AuthResponses.forbidden('ليس لديك صلاحية لتعديل التصنيفات');
    }

    const { id } = await params;
    const body = await request.json();
    const validated = categoryUpdateSchema.parse(body);

    // Get existing category
    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return Response.json({
        success: false,
        message: 'التصنيف غير موجود',
      }, { status: 404 });
    }

    // Check if new slug already exists (if changing slug)
    if (validated.slug && validated.slug !== existingCategory.slug) {
      const slugExists = await db.category.findUnique({
        where: { slug: validated.slug },
      });
      if (slugExists) {
        return Response.json({
          success: false,
          message: 'رابط التصنيف مستخدم بالفعل',
        }, { status: 400 });
      }
    }

    // Check if parent exists and not self (if changing parent)
    if (validated.parentId !== undefined) {
      if (validated.parentId === id) {
        return Response.json({
          success: false,
          message: 'لا يمكن جعل التصنيف أبًا لنفسه',
        }, { status: 400 });
      }
      if (validated.parentId !== null) {
        const parent = await db.category.findUnique({
          where: { id: validated.parentId },
        });
        if (!parent) {
          return Response.json({
            success: false,
            message: 'التصنيف الأب غير موجود',
          }, { status: 400 });
        }
      }
    }

    // Update category
    const updateData: Record<string, unknown> = {};
    if (validated.nameAr !== undefined) updateData.nameAr = validated.nameAr;
    if (validated.nameEn !== undefined) updateData.nameEn = validated.nameEn;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.image !== undefined) updateData.image = validated.image;
    if (validated.icon !== undefined) updateData.icon = validated.icon;
    if (validated.parentId !== undefined) updateData.parentId = validated.parentId;
    if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (validated.showInHome !== undefined) updateData.showInHome = validated.showInHome;

    const category = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });

    return Response.json({
      success: true,
      data: category,
      message: 'تم تحديث التصنيف بنجاح',
    });
  } catch (error) {
    console.error('Update category error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: error.errors,
      }, { status: 400 });
    }
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث التصنيف',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete category
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

    if (!hasRole(user, ['ADMIN'])) {
      return AuthResponses.forbidden('ليس لديك صلاحية لحذف التصنيفات');
    }

    const { id } = await params;

    // Get existing category
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return Response.json({
        success: false,
        message: 'التصنيف غير موجود',
      }, { status: 404 });
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return Response.json({
        success: false,
        message: 'لا يمكن حذف التصنيف لأنه يحتوي على منتجات',
      }, { status: 400 });
    }

    // Check if category has children
    if (existingCategory._count.children > 0) {
      return Response.json({
        success: false,
        message: 'لا يمكن حذف التصنيف لأنه يحتوي على تصنيفات فرعية',
      }, { status: 400 });
    }

    // Delete category
    await db.category.delete({
      where: { id },
    });

    return Response.json({
      success: true,
      message: 'تم حذف التصنيف بنجاح',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء حذف التصنيف',
    }, { status: 500 });
  }
}
