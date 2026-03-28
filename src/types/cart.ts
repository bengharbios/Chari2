/**
 * Cart Types
 * Type definitions for cart-related entities
 */

import { PaymentMethod } from '@prisma/client';

// Cart item with product details
export interface CartItemWithProduct {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    slug: string;
    basePrice: number;
    salePrice: number | null;
    images: string;
    totalStock: number;
    status: string;
    category: {
      id: string;
      nameAr: string;
      nameEn: string | null;
    };
  };
  variant: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    price: number;
    salePrice: number | null;
    stock: number;
    color: string | null;
    colorCode: string | null;
    size: string | null;
    images: string | null;
  } | null;
  price: number;
  itemTotal: number;
}

// Cart with calculated totals
export interface CartWithTotals {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemWithProduct[];
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
}

// Add to cart request
export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

// Update cart request
export interface UpdateCartRequest {
  itemId: string;
  quantity: number;
}

// Remove from cart request
export interface RemoveFromCartRequest {
  itemId: string;
}

// Apply coupon request
export interface ApplyCouponRequest {
  couponCode: string;
}

// Cart summary for checkout
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  shippingFee: number;
  total: number;
  estimatedDelivery?: Date;
}

// Shipping option
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  isDefault: boolean;
}

// Checkout request
export interface CheckoutRequest {
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  shippingOptionId?: string;
}

// Cart validation result
export interface CartValidationResult {
  valid: boolean;
  errors: CartValidationError[];
}

// Cart validation error
export interface CartValidationError {
  productId: string;
  variantId?: string;
  message: string;
  type: 'STOCK' | 'PRICE' | 'AVAILABILITY' | 'OTHER';
}

// Cart response
export interface CartResponse {
  success: boolean;
  data?: CartWithTotals;
  message?: string;
  errors?: CartValidationError[];
}

// Coupon validation result
export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minOrderValue?: number;
    maxDiscount?: number;
  };
}
