import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/merchant/orders/[id] - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    const order = await db.order.findFirst({
      where: {
        id,
        merchantId,
      },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                images: true,
                sku: true,
              },
            },
            variant: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
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
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب الطلب' },
      { status: 500 }
    );
  }
}

// PATCH /api/merchant/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    // Check if order belongs to merchant
    const existingOrder = await db.order.findFirst({
      where: { id, merchantId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status, notes, trackingNumber, shippingCompany } = body;

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;

      // Update timestamps based on status
      if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      } else if (status === 'SHIPPED') {
        updateData.shippedAt = new Date();
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      } else if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      }

      // Create tracking entry
      await db.orderTracking.create({
        data: {
          orderId: id,
          status,
          description: notes || `تم تحديث حالة الطلب إلى ${status}`,
        },
      });
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Update order
    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: order,
      message: 'تم تحديث الطلب بنجاح',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث الطلب' },
      { status: 500 }
    );
  }
}
