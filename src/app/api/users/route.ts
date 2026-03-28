/**
 * Users API Routes
 * Handles user operations
 */

import { NextRequest } from 'next/server';
import { updateProfileSchema } from '@/lib/validators';
import { getUserFromRequest, AuthResponses, isActiveUser, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

/**
 * GET /api/users
 * Get users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    if (!hasRole(user, ['ADMIN'])) {
      return AuthResponses.forbidden();
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }
    
    if (userType) {
      where.userType = userType;
    }
    
    if (status) {
      where.status = status;
    }
    
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phone: true,
          email: true,
          name: true,
          avatar: true,
          userType: true,
          status: true,
          language: true,
          currency: true,
          isPhoneVerified: true,
          isEmailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              ordersAsBuyer: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);
    
    return Response.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    return AuthResponses.error('حدث خطأ أثناء جلب المستخدمين');
  }
}

/**
 * PUT /api/users
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const body = await request.json();
    const validated = updateProfileSchema.parse(body);
    
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: validated,
    });
    
    return Response.json({
      success: true,
      data: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        userType: updatedUser.userType,
        status: updatedUser.status,
        language: updatedUser.language,
        currency: updatedUser.currency,
      },
      message: 'تم تحديث البيانات بنجاح',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return AuthResponses.error('حدث خطأ أثناء تحديث البيانات');
  }
}

/**
 * DELETE /api/users
 * Deactivate user account
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    await db.user.update({
      where: { id: user.id },
      data: { status: 'SUSPENDED' },
    });
    
    return Response.json({
      success: true,
      message: 'تم تعطيل الحساب بنجاح',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return AuthResponses.error('حدث خطأ أثناء تعطيل الحساب');
  }
}
