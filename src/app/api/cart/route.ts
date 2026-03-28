/**
 * Cart API Routes
 * Handles cart operations
 */

import { NextRequest } from 'next/server';
import { addToCartSchema, updateCartItemSchema, applyCouponSchema } from '@/lib/validators';
import { getUserFromRequest, AuthResponses, isActiveUser } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/cart
 * Get user's cart
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                variants: true,
              },
            },
            variant: true,
          },
        },
      },
    });
    
    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  variants: true,
                },
              },
              variant: true,
            },
          },
        },
      });
    }
    
    // Calculate totals
    let subtotal = 0;
    const items = cart.items.map((item) => {
      const price = item.variant?.salePrice || item.variant?.price || 
                   item.product.salePrice || item.product.basePrice;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      
      return {
        ...item,
        price,
        itemTotal,
      };
    });
    
    const vatAmount = subtotal * 0.15;
    const total = subtotal + vatAmount;
    
    return Response.json({
      success: true,
      data: {
        ...cart,
        items,
        subtotal,
        vatAmount,
        total,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return AuthResponses.error('حدث خطأ أثناء جلب السلة');
  }
}

/**
 * POST /api/cart
 * Add item to cart
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
    const validated = addToCartSchema.parse(body);
    
    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId: user.id },
    });
    
    if (!cart) {
      cart = await db.cart.create({
        data: { userId: user.id },
      });
    }
    
    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: validated.productId },
      include: {
        variants: validated.variantId ? {
          where: { id: validated.variantId },
        } : false,
      },
    });
    
    if (!product) {
      return AuthResponses.error('المنتج غير موجود');
    }
    
    // Check stock
    const availableStock = validated.variantId && product.variants?.[0]
      ? product.variants[0].stock
      : product.totalStock;
    
    if (availableStock < validated.quantity) {
      return AuthResponses.error('الكمية المطلوبة غير متوفرة');
    }
    
    // Add or update cart item
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validated.productId,
        variantId: validated.variantId || null,
      },
    });
    
    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + validated.quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validated.productId,
          variantId: validated.variantId || null,
          quantity: validated.quantity,
        },
      });
    }
    
    return Response.json({
      success: true,
      message: 'تمت الإضافة إلى السلة بنجاح',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return AuthResponses.error('حدث خطأ أثناء الإضافة إلى السلة');
  }
}

/**
 * PUT /api/cart
 * Update cart item quantity
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const body = await request.json();
    const { itemId, quantity } = body;
    
    if (!itemId) {
      return AuthResponses.error('معرف عنصر السلة مطلوب');
    }
    
    if (quantity === 0) {
      // Remove item
      await db.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Update quantity
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }
    
    return Response.json({
      success: true,
      message: 'تم تحديث السلة بنجاح',
    });
  } catch (error) {
    console.error('Update cart error:', error);
    return AuthResponses.error('حدث خطأ أثناء تحديث السلة');
  }
}

/**
 * DELETE /api/cart
 * Clear cart or remove item
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return AuthResponses.unauthorized();
    }
    
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    const cart = await db.cart.findUnique({
      where: { userId: user.id },
    });
    
    if (!cart) {
      return AuthResponses.error('السلة غير موجودة');
    }
    
    if (itemId) {
      // Remove specific item
      await db.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
    
    return Response.json({
      success: true,
      message: 'تم تحديث السلة بنجاح',
    });
  } catch (error) {
    console.error('Delete from cart error:', error);
    return AuthResponses.error('حدث خطأ أثناء تحديث السلة');
  }
}
