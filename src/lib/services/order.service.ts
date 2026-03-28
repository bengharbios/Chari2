/**
 * Order Service
 * Handles order business logic
 * Single Responsibility: Order operations
 */

import { db } from '../db';
import { Order, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { CreateOrderInput, OrderQueryInput } from '../validators';
import { generateOrderNumber } from '../utils';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Get orders with pagination and filtering
 */
export async function getOrders(
  query: OrderQueryInput,
  buyerId?: string,
  merchantId?: string,
  storeId?: string
): Promise<PaginatedResult<Order>> {
  const { page, limit, status, paymentStatus, startDate, endDate, search, sortBy, sortOrder } = query;
  
  const skip = (page - 1) * limit;
  
  const where: Prisma.OrderWhereInput = {};
  
  // Filter by buyer
  if (buyerId) {
    where.buyerId = buyerId;
  }
  
  // Filter by merchant or store
  if (merchantId) {
    where.merchantId = merchantId;
  }
  if (storeId) {
    where.storeId = storeId;
  }
  
  // Status filter
  if (status) {
    where.status = status;
  }
  
  // Payment status filter
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }
  
  // Date range filter
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }
  
  // Search filter
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { notes: { contains: search } },
    ];
  }
  
  // Get total count
  const total = await db.order.count({ where });
  
  // Get paginated orders
  const orders = await db.order.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
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
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      payments: true,
    },
  });
  
  return {
    data: orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get order by ID
 */
export async function getOrder(id: string): Promise<Order | null> {
  return db.order.findUnique({
    where: { id },
    include: {
      buyer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      merchant: true,
      store: true,
      items: {
        include: {
          product: {
            include: {
              category: true,
              brand: true,
            },
          },
          variant: true,
        },
      },
      shippingAddress: true,
      payments: true,
      tracking: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * Create order
 */
export async function createOrder(
  buyerId: string,
  data: CreateOrderInput
): Promise<Order> {
  const { items, shippingAddressId, couponCode, notes, paymentMethod } = data;
  
  // Get product prices and calculate totals
  let subtotal = 0;
  const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = [];
  
  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: {
        variants: item.variantId ? {
          where: { id: item.variantId },
        } : false,
      },
    });
    
    if (!product) {
      throw new Error(`المنتج غير موجود: ${item.productId}`);
    }
    
    const price = item.variantId && product.variants?.[0]
      ? product.variants[0].salePrice || product.variants[0].price
      : product.salePrice || product.basePrice;
    
    const totalPrice = price * item.quantity;
    subtotal += totalPrice;
    
    orderItems.push({
      product: { connect: { id: item.productId } },
      variant: item.variantId ? { connect: { id: item.variantId } } : undefined,
      quantity: item.quantity,
      unitPrice: price,
      totalPrice,
    });
  }
  
  // Calculate VAT (15%)
  const vatAmount = subtotal * 0.15;
  
  // TODO: Calculate shipping fee based on address and products
  const shippingFee = 0;
  
  // TODO: Apply coupon discount
  const discountAmount = 0;
  
  const totalAmount = subtotal + vatAmount + shippingFee - discountAmount;
  
  // Create order
  return db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      buyerId,
      shippingAddressId,
      subtotal,
      discountAmount,
      shippingFee,
      vatAmount,
      totalAmount,
      couponCode,
      notes,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      items: {
        create: orderItems,
      },
      payments: {
        create: {
          amount: totalAmount,
          method: paymentMethod,
          status: PaymentStatus.PENDING,
        },
      },
      tracking: {
        create: {
          status: 'تم إنشاء الطلب',
          description: 'تم استلام طلبك بنجاح',
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      payments: true,
    },
  });
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  notes?: string
): Promise<Order> {
  const updateData: Prisma.OrderUpdateInput = {
    status,
    notes,
  };
  
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  
  // Update timestamps based on status
  if (status === OrderStatus.CONFIRMED) {
    updateData.confirmedAt = new Date();
  } else if (status === OrderStatus.SHIPPED) {
    updateData.shippedAt = new Date();
  } else if (status === OrderStatus.DELIVERED) {
    updateData.deliveredAt = new Date();
  } else if (status === OrderStatus.CANCELLED) {
    updateData.cancelledAt = new Date();
  }
  
  return db.order.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Cancel order
 */
export async function cancelOrder(
  id: string,
  reason: string
): Promise<Order> {
  return db.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
    },
  });
}

/**
 * Add order tracking
 */
export async function addOrderTracking(
  orderId: string,
  status: string,
  description: string,
  location?: string
): Promise<void> {
  await db.orderTracking.create({
    data: {
      orderId,
      status,
      description,
      location,
    },
  });
}
