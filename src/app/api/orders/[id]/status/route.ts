/**
 * Order Status API Routes
 * Handles order status updates
 */

import { NextRequest } from 'next/server';
import { getUserFromRequest, AuthResponses, isActiveUser, hasRole } from '@/lib/auth';
import { db } from '@/lib/db';
import { OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Status update schema
const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  shippingStatus: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED']).optional(),
  notes: z.string().max(500).optional(),
  cancellationReason: z.string().max(500).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * PUT /api/orders/[id]/status
 * Update order status
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
    const validated = statusUpdateSchema.parse(body);

    // Get existing order
    const existingOrder = await db.order.findUnique({
      where: { id },
      include: {
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

    // Check permission
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
      return AuthResponses.forbidden('ليس لديك صلاحية لتعديل حالة الطلب');
    }

    // Validate status transitions
    if (validated.status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED', 'RETURNED'],
        DELIVERED: ['RETURNED'],
        CANCELLED: [],
        RETURNED: [],
      };

      if (!validTransitions[existingOrder.status]?.includes(validated.status)) {
        return Response.json({
          success: false,
          message: `لا يمكن تغيير الحالة من ${existingOrder.status} إلى ${validated.status}`,
        }, { status: 400 });
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    
    if (validated.status) {
      updateData.status = validated.status as OrderStatus;
      
      // Update timestamps based on status
      switch (validated.status) {
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'SHIPPED':
          updateData.shippedAt = new Date();
          break;
        case 'DELIVERED':
          updateData.deliveredAt = new Date();
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          break;
      }
    }

    if (validated.paymentStatus) {
      updateData.paymentStatus = validated.paymentStatus as PaymentStatus;
    }

    if (validated.shippingStatus) {
      updateData.shippingStatus = validated.shippingStatus as ShippingStatus;
    }

    if (validated.notes !== undefined) {
      updateData.notes = validated.notes;
    }

    if (validated.cancellationReason !== undefined) {
      updateData.cancellationReason = validated.cancellationReason;
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    // Add tracking entry
    if (validated.status) {
      const statusMessages: Record<string, string> = {
        CONFIRMED: 'تم تأكيد الطلب',
        PROCESSING: 'جاري تجهيز الطلب',
        SHIPPED: validated.trackingNumber 
          ? `تم شحن الطلب - رقم التتبع: ${validated.trackingNumber}` 
          : 'تم شحن الطلب',
        DELIVERED: 'تم تسليم الطلب بنجاح',
        CANCELLED: validated.cancellationReason || 'تم إلغاء الطلب',
        RETURNED: 'تم إرجاع الطلب',
      };

      await db.orderTracking.create({
        data: {
          orderId: id,
          status: validated.status,
          description: validated.notes || statusMessages[validated.status] || `تم تغيير حالة الطلب إلى ${validated.status}`,
          location: validated.trackingNumber || undefined,
        },
      });
    }

    // Handle stock restoration for cancelled orders
    if (validated.status === 'CANCELLED') {
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
    }

    // Update payment status if provided
    if (validated.paymentStatus === 'COMPLETED') {
      await db.payment.updateMany({
        where: { orderId: id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      });
    }

    return Response.json({
      success: true,
      data: order,
      message: 'تم تحديث حالة الطلب بنجاح',
    });
  } catch (error) {
    console.error('Update order status error:', error);
    if (error instanceof z.ZodError) {
      return Response.json({
        success: false,
        message: 'بيانات غير صالحة',
        errors: error.errors,
      }, { status: 400 });
    }
    return Response.json({
      success: false,
      message: 'حدث خطأ أثناء تحديث حالة الطلب',
    }, { status: 500 });
  }
}
