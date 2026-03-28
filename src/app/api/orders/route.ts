/**
 * Orders API Routes
 * Handles order CRUD operations
 */

import { NextRequest } from 'next/server';
import { createOrderSchema, orderQuerySchema, updateOrderStatusSchema } from '@/lib/validators';
import { getOrders, getOrder, createOrder, updateOrderStatus, cancelOrder, addOrderTracking } from '@/lib/services';
import { getUserFromRequest, AuthResponses, hasRole, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';

/**
 * GET /api/orders
 * Get all orders with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const { searchParams } = new URL(request.url);
    const query = orderQuerySchema.parse({
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
      status: searchParams.get('status') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    });
    
    let buyerId: string | undefined;
    let merchantId: string | undefined;
    let storeId: string | undefined;
    
    // Filter based on user type
    if (user.userType === 'BUYER') {
      buyerId = user.id;
    } else if (user.userType === 'MERCHANT') {
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
    
    const result = await getOrders(query, buyerId, merchantId, storeId);
    
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
    console.error('Get orders error:', error);
    return AuthResponses.error('حدث خطأ أثناء جلب الطلبات');
  }
}

/**
 * POST /api/orders
 * Create new order
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
    
    const body = await request.json();
    const validated = createOrderSchema.parse(body);
    
    const order = await createOrder(user.id, validated);
    
    return Response.json({
      success: true,
      data: order,
      message: 'تم إنشاء الطلب بنجاح',
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return AuthResponses.error(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الطلب');
  }
}

/**
 * PUT /api/orders
 * Update order status
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
      return AuthResponses.error('معرف الطلب مطلوب');
    }
    
    const validated = updateOrderStatusSchema.parse(updateData);
    
    const order = await updateOrderStatus(
      id,
      validated.status as OrderStatus,
      validated.paymentStatus as PaymentStatus,
      validated.notes
    );
    
    // Add tracking entry
    if (validated.status) {
      await addOrderTracking(
        id,
        validated.status,
        validated.notes || `تم تغيير حالة الطلب إلى ${validated.status}`
      );
    }
    
    return Response.json({
      success: true,
      data: order,
      message: 'تم تحديث الطلب بنجاح',
    });
  } catch (error) {
    console.error('Update order error:', error);
    return AuthResponses.error('حدث خطأ أثناء تحديث الطلب');
  }
}

/**
 * DELETE /api/orders
 * Cancel order
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason') || 'تم الإلغاء من قبل المستخدم';
    
    if (!id) {
      return AuthResponses.error('معرف الطلب مطلوب');
    }
    
    const order = await cancelOrder(id, reason);
    
    return Response.json({
      success: true,
      data: order,
      message: 'تم إلغاء الطلب بنجاح',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return AuthResponses.error('حدث خطأ أثناء إلغاء الطلب');
  }
}
