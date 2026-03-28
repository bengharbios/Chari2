/**
 * Order Validators
 * Zod schemas for order-related requests
 */

import { z } from 'zod';

/**
 * Order Status Enum
 */
const orderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]);

/**
 * Payment Status Enum
 */
const paymentStatusEnum = z.enum([
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
]);

/**
 * Payment Method Enum
 */
const paymentMethodEnum = z.enum([
  'CREDIT_CARD',
  'DEBIT_CARD',
  'APPLE_PAY',
  'MADA',
  'BANK_TRANSFER',
  'CASH_ON_DELIVERY',
]);

/**
 * Order Item Schema
 */
const orderItemSchema = z.object({
  productId: z.string().min(1, 'معرف المنتج مطلوب'),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل'),
});

/**
 * Shipping Address Schema
 */
const shippingAddressSchema = z.object({
  addressId: z.string().min(1, 'معرف العنوان مطلوب'),
});

/**
 * Create Order Schema
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'طلب واحد على الأقل مطلوب'),
  shippingAddressId: z.string().min(1, 'عنوان الشحن مطلوب'),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  paymentMethod: paymentMethodEnum,
});

/**
 * Update Order Status Schema
 */
export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  notes: z.string().max(500).optional(),
  cancellationReason: z.string().max(500).optional(),
});

/**
 * Order Query Schema
 */
export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Order ID Schema
 */
export const orderIdSchema = z.object({
  id: z.string().min(1, 'معرف الطلب مطلوب'),
});

/**
 * Add Order Tracking Schema
 */
export const addOrderTrackingSchema = z.object({
  status: z.string().min(1, 'الحالة مطلوبة'),
  description: z.string().min(1, 'الوصف مطلوب'),
  location: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type AddOrderTrackingInput = z.infer<typeof addOrderTrackingSchema>;
