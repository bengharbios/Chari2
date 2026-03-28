/**
 * Cart Validators
 * Zod schemas for cart-related requests
 */

import { z } from 'zod';

/**
 * Add to Cart Schema
 */
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'معرف المنتج مطلوب'),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1, 'الكمية يجب أن تكون 1 على الأقل').max(99, 'الحد الأقصى للكمية هو 99'),
});

/**
 * Update Cart Item Schema
 */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'الكمية يجب أن تكون 0 على الأقل').max(99, 'الحد الأقصى للكمية هو 99'),
});

/**
 * Cart Item ID Schema
 */
export const cartItemIdSchema = z.object({
  itemId: z.string().min(1, 'معرف عنصر السلة مطلوب'),
});

/**
 * Apply Coupon Schema
 */
export const applyCouponSchema = z.object({
  couponCode: z.string().min(1, 'رمز الكوبون مطلوب'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CartItemIdInput = z.infer<typeof cartItemIdSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
