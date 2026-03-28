/**
 * Cart Service
 * Handles cart business logic
 * Single Responsibility: Cart operations
 */

import { db } from '../db';
import { Prisma } from '@prisma/client';

/**
 * Get or create cart for user
 */
export async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  return cart;
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(
  items: Array<{
    quantity: number;
    product: {
      basePrice: number;
      salePrice: number | null;
    };
    variant: {
      price: number;
      salePrice: number | null;
    } | null;
  }>,
  discountAmount: number = 0
) {
  let subtotal = 0;

  for (const item of items) {
    const price = item.variant?.salePrice || item.variant?.price ||
                 item.product.salePrice || item.product.basePrice;
    subtotal += price * item.quantity;
  }

  const vatAmount = subtotal * 0.15;
  const shippingFee = 0; // TODO: Calculate based on address
  const total = subtotal + vatAmount + shippingFee - discountAmount;

  return {
    subtotal,
    discountAmount,
    vatAmount,
    shippingFee,
    total,
  };
}

/**
 * Validate cart items
 */
export async function validateCartItems(
  items: Array<{
    productId: string;
    variantId: string | null;
    quantity: number;
  }>
): Promise<{
  valid: boolean;
  errors: Array<{
    productId: string;
    variantId?: string;
    message: string;
  }>;
}> {
  const errors: Array<{
    productId: string;
    variantId?: string;
    message: string;
  }> = [];

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
      errors.push({
        productId: item.productId,
        message: 'المنتج غير موجود',
      });
      continue;
    }

    if (product.status !== 'ACTIVE') {
      errors.push({
        productId: item.productId,
        message: 'المنتج غير متاح حالياً',
      });
      continue;
    }

    const availableStock = item.variantId && product.variants?.[0]
      ? product.variants[0].stock
      : product.totalStock;

    if (availableStock < item.quantity) {
      errors.push({
        productId: item.productId,
        variantId: item.variantId || undefined,
        message: `الكمية المتوفرة هي ${availableStock} فقط`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate and apply coupon
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
  userId: string
): Promise<{
  valid: boolean;
  discountAmount: number;
  message?: string;
  coupon?: {
    id: string;
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
  };
}> {
  const coupon = await db.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'كود الخصم غير صحيح',
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'كود الخصم غير فعال',
    };
  }

  const now = new Date();
  if (coupon.startDate > now || coupon.endDate < now) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'كود الخصم منتهي الصلاحية',
    };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'تم استخدام كود الخصم الحد الأقصى من المرات',
    };
  }

  if (coupon.minValue && subtotal < coupon.minValue) {
    return {
      valid: false,
      discountAmount: 0,
      message: `الحد الأدنى للطلب ${coupon.minValue} ريال`,
    };
  }

  // Check user usage
  // TODO: Add user usage tracking

  // Calculate discount
  let discountAmount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discountAmount = subtotal * (coupon.value / 100);
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.value;
  }

  return {
    valid: true,
    discountAmount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type as 'PERCENTAGE' | 'FIXED',
      value: coupon.value,
    },
  };
}

/**
 * Add item to cart
 */
export async function addToCart(
  userId: string,
  productId: string,
  quantity: number,
  variantId?: string
) {
  const cart = await getOrCreateCart(userId);

  // Check if product exists and is available
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      variants: variantId ? {
        where: { id: variantId },
      } : false,
    },
  });

  if (!product) {
    throw new Error('المنتج غير موجود');
  }

  if (product.status !== 'ACTIVE') {
    throw new Error('المنتج غير متاح حالياً');
  }

  // Check stock
  const availableStock = variantId && product.variants?.[0]
    ? product.variants[0].stock
    : product.totalStock;

  if (availableStock < quantity) {
    throw new Error(`الكمية المتوفرة هي ${availableStock} فقط`);
  }

  // Check if item already exists in cart
  const existingItem = await db.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (availableStock < newQuantity) {
      throw new Error(`الكمية المتوفرة هي ${availableStock} فقط`);
    }
    return db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  }

  // Create new item
  return db.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      variantId: variantId || null,
      quantity,
    },
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number
) {
  const cart = await getOrCreateCart(userId);

  const item = await db.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
    include: {
      product: true,
      variant: true,
    },
  });

  if (!item) {
    throw new Error('العنصر غير موجود في السلة');
  }

  if (quantity === 0) {
    return db.cartItem.delete({
      where: { id: itemId },
    });
  }

  // Check stock
  const availableStock = item.variantId ? item.variant?.stock : item.product.totalStock;
  if (availableStock && availableStock < quantity) {
    throw new Error(`الكمية المتوفرة هي ${availableStock} فقط`);
  }

  return db.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

/**
 * Remove item from cart
 */
export async function removeFromCart(userId: string, itemId: string) {
  const cart = await getOrCreateCart(userId);

  const item = await db.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  });

  if (!item) {
    throw new Error('العنصر غير موجود في السلة');
  }

  return db.cartItem.delete({
    where: { id: itemId },
  });
}

/**
 * Clear cart
 */
export async function clearCart(userId: string) {
  const cart = await getOrCreateCart(userId);

  return db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}

/**
 * Get cart with totals
 */
export async function getCartWithTotals(userId: string) {
  const cart = await getOrCreateCart(userId);

  // Parse product images
  const items = cart.items.map(item => ({
    ...item,
    product: {
      ...item.product,
      images: JSON.parse(item.product.images),
    },
    variant: item.variant ? {
      ...item.variant,
      images: item.variant.images ? JSON.parse(item.variant.images) : [],
    } : null,
  }));

  const totals = calculateCartTotals(items);

  return {
    ...cart,
    items,
    ...totals,
  };
}
