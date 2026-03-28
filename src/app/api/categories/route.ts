/**
 * Categories API Routes
 * Handles category operations
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, hasRole, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Category create schema
const categorySchema = z.object({
  nameAr: z.string().min(1, 'اسم التصنيف بالعربية مطلوب').max(100),
  nameEn: z.string().max(100).optional(),
  slug: z.string().min(1, 'الرابط مطلوب').max(150),
  description: z.string().max(500).optional(),
  image: z.string().url().optional().or(z.literal('')),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  showInHome: z.boolean().default(false),
});

/**
 * GET /api/categories
 * Get categories tree or flat list
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get('flat') === 'true';
    const parentId = searchParams.get('parentId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    if (flat) {
      // Return flat list of categories
      const where: Record<string, unknown> = {};
      if (activeOnly) where.isActive = true;
      if (parentId) where.parentId = parentId;

      const categories = await db.category.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { nameAr: 'asc' },
        ],
        include: {
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });

      return Response.json({
        success: true,
        data: categories,
      });
    }

    // Get root categories with children (tree structure)
    const rootCategories = await db.category.findMany({
      where: {
        parentId: null,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: [
        { sortOrder: 'asc' },
        { nameAr: 'asc' },
      ],
      include: {
        children: {
          where: activeOnly ? { isActive: true } : undefined,
          orderBy: [
            { sortOrder: 'asc' },
            { nameAr: 'asc' },
          ],
          include: {
            children: {
              where: activeOnly ? { isActive: true } : undefined,
              orderBy: [
                { sortOrder: 'asc' },
                { nameAr: 'asc' },
              ],
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    // Transform to tree structure with product counts
    const transformCategory = (cat: Record<string, unknown>) => ({
      ...cat,
      productCount: cat._count?.products || 0,
      children: cat.children?.map(transformCategory),
    });

    const categoryTree = rootCategories.map(transformCategory);

    return Response.json({
      success: true,
      data: categoryTree,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء جلب التصنيفات',
    }, { status: 500 });
  }
}

/**
 * POST /api/categories
 * Create a new category
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

    if (!hasRole(user, ['ADMIN'])) {
      return AuthResponses.forbidden('ليس لديك صلاحية لإنشاء تصنيفات');
    }

    const body = await request.json();
    const validated = categorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug: validated.slug },
    });

    if (existingCategory) {
      return Response.json({
        success: false,
        message: 'رابط التصنيف مستخدم بالفعل',
      }, { status: 400 });
    }

    // Check if parent exists (if provided)
    if (validated.parentId) {
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

    const category = await db.category.create({
      data: {
        nameAr: validated.nameAr,
        nameEn: validated.nameEn,
        slug: validated.slug,
        description: validated.description,
        image: validated.image,
        icon: validated.icon,
        parentId: validated.parentId,
        sortOrder: validated.sortOrder,
        isActive: validated.isActive,
        showInHome: validated.showInHome,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return Response.json({
      success: true,
      data: category,
      message: 'تم إنشاء التصنيف بنجاح',
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: error.errors,
      }, { status: 400 });
    }
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء التصنيف',
    }, { status: 500 });
  }
}
