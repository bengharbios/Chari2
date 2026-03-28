/**
 * Order [id] API Routes
 * Handles single order operations
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, isActiveUser, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/orders/[id]
 * Get order by ID or order number
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }

    const { id } = await params;
    
    const order = await db.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
        ],
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
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
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true,
                images: true,
                category: {
                  select: {
                    id: true,
                    nameAr: true,
                    nameEn: true,
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                color: true,
                colorCode: true,
                size: true,
              },
            },
          },
        },
        shippingAddress: true,
        payments: true,
        tracking: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return Response.json({
        success: false,
        message: 'الطلب غير موجود',
      }, { status: 404 });
    }

    // Check permission
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'BUYER' && order.buyerId === user.id) {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === order.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === order.storeId;
    }

    if (!hasPermission) {
      return Response.json({
        success: false,
        message: 'ليس لديك صلاحية لعرض هذا الطلب',
      }, { status: 403 });
    }

    // Transform order items
    const transformedOrder = {
      ...order,
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          images: JSON.parse(item.product.images),
        },
      })),
      itemCount: order.items.length,
    };

    return Response.json({
      success: true,
      data: transformedOrder,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء جلب الطلب',
    }, { status: 500 });
  }
}

/**
 * PUT /api/orders/[id]
 * Update order
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

    // Get existing order
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        merchant: true,
        store: true,
      },
    });

    if (!existingOrder) {
      return Response.json({
        success: false,
        message: 'الطلب غير موجود',
      }, { status: 404 });
    }

    // Check permission based on what's being updated
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === existingOrder.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === existingOrder.storeId;
    }

    if (!hasPermission) {
      return AuthResponses.forbidden('ليس لديك صلاحية لتعديل هذا الطلب');
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (body.status !== undefined) updateData.status = body.status;
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.shippingStatus !== undefined) updateData.shippingStatus = body.shippingStatus;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Update timestamps based on status
    if (body.status === OrderStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (body.status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    } else if (body.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (body.status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      if (body.cancellationReason) {
        updateData.cancellationReason = body.cancellationReason;
      }
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // Add tracking entry if status changed
    if (body.status) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: 'تم تأكيد الطلب',
        PROCESSING: 'جاري تجهيز الطلب',
        SHIPPED: 'تم شحن الطلب',
        DELIVERED: 'تم تسليم الطلب',
        CANCELLED: 'تم إلغاء الطلب',
        RETURNED: 'تم إرجاع الطلب',
      };

      await db.orderTracking.create({
        data: {
          orderId: id,
          status: body.status,
          description: statusMessages[body.status] || `تم تغيير حالة الطلب إلى ${body.status}`,
        },
      });
    }

    return Response.json({
      success: true,
      data: order,
      message: 'تم تحديث الطلب بنجاح',
    });
  } catch (error) {
    console.error('Update order error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الطلب',
    }, { status: 500 });
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel order
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
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'تم الإلغاء من قبل المستخدم';

    // Get existing order
    const existingOrder = await db.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return Response.json({
        success: false,
        message: 'الطلب غير موجود',
      }, { status: 404 });
    }

    // Check if order can be cancelled
    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];
    if (!cancellableStatuses.includes(existingOrder.status)) {
      return Response.json({
        success: false,
        message: 'لا يمكن إلغاء هذا الطلب في حالته الحالية',
      }, { status: 400 });
    }

    // Check permission
    let hasPermission = false;
    if (user.userType === 'ADMIN') {
      hasPermission = true;
    } else if (user.userType === 'BUYER' && existingOrder.buyerId === user.id) {
      hasPermission = true;
    } else if (user.userType === 'MERCHANT') {
      const merchant = await db.merchantProfile.findUnique({
        where: { userId: user.id },
      });
      hasPermission = merchant?.id === existingOrder.merchantId;
    } else if (user.userType === 'STORE') {
      const store = await db.store.findUnique({
        where: { userId: user.id },
      });
      hasPermission = store?.id === existingOrder.storeId;
    }

    if (!hasPermission) {
      return AuthResponses.forbidden('ليس لديك صلاحية لإلغاء هذا الطلب');
    }

    // Cancel order
    const order = await db.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Add tracking entry
    await db.orderTracking.create({
      data: {
        orderId: id,
        status: 'CANCELLED',
        description: reason,
      },
    });

    // Restore stock for cancelled items
    const orderItems = await db.orderItem.findMany({
      where: { orderId: id },
    });

    for (const item of orderItems) {
      if (item.variantId) {
        await db.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await db.product.update({
        where: { id: item.productId },
        data: { totalStock: { increment: item.quantity } },
      });
    }

    return Response.json({
      success: true,
      data: order,
      message: 'تم إلغاء الطلب بنجاح',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء إلغاء الطلب',
    }, { status: 500 });
  }
}
