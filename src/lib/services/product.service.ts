/**
 * Product Service
 * Handles product business logic
 * Single Responsibility: Product operations
 */

import { db } from '../db';
import { Product, ProductStatus, Prisma } from '@prisma/client';
import { CreateProductInput, ProductQueryInput } from '../validators';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get products with pagination and filtering
 */
export async function getProducts(
  query: ProductQueryInput,
  merchantId?: string,
  storeId?: string
): Promise<PaginatedResult<Product>> {
  const { page, limit, search, categoryId, brandId, status, minPrice, maxPrice, isFeatured, isFlashSale, sortBy, sortOrder } = query;
  
  const skip = (page - 1) * limit;
  
  const where: Prisma.ProductWhereInput = {};
  
  // Filter by merchant or store
  if (merchantId) {
    where.merchantId = merchantId;
  }
  if (storeId) {
    where.storeId = storeId;
  }
  
  // Search filter
  if (search) {
    where.OR = [
      { nameAr: { contains: search } },
      { nameEn: { contains: search } },
      { sku: { contains: search } },
    ];
  }
  
  // Category filter
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  // Brand filter
  if (brandId) {
    where.brandId = brandId;
  }
  
  // Status filter
  if (status) {
    where.status = status;
  }
  
  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) {
      where.basePrice.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.basePrice.lte = maxPrice;
    }
  }
  
  // Featured filter
  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }
  
  // Flash sale filter
  if (isFlashSale !== undefined) {
    where.isFlashSale = isFlashSale;
  }
  
  // Get total count
  const total = await db.product.count({ where });
  
  // Get paginated products
  const products = await db.product.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      brand: true,
      variants: true,
      _count: {
        select: {
          reviews: true,
          orderItems: true,
        },
      },
    },
  });
  
  return {
    data: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get product by ID or slug
 */
export async function getProduct(identifier: string): Promise<Product | null> {
  return db.product.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier },
        { sku: identifier },
      ],
    },
    include: {
      category: {
        include: {
          parent: true,
        },
      },
      brand: true,
      variants: true,
      specifications: {
        include: {
          specification: true,
        },
      },
      reviews: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
          orderItems: true,
        },
      },
    },
  });
}

/**
 * Create product
 */
export async function createProduct(
  data: CreateProductInput,
  merchantId?: string,
  storeId?: string
): Promise<Product> {
  const { variants, specifications, ...productData } = data;
  
  return db.product.create({
    data: {
      ...productData,
      images: JSON.stringify(productData.images),
      highlights: productData.highlights ? JSON.stringify(productData.highlights) : null,
      shippingCities: productData.shippingCities ? JSON.stringify(productData.shippingCities) : null,
      merchantId: merchantId || null,
      storeId: storeId || null,
      variants: variants ? {
        create: variants.map(v => ({
          ...v,
          images: v.images ? JSON.stringify(v.images) : null,
          customAttributes: v.customAttributes ? JSON.stringify(v.customAttributes) : null,
        })),
      } : undefined,
      specifications: specifications ? {
        create: specifications,
      } : undefined,
    },
    include: {
      variants: true,
      specifications: true,
    },
  });
}

/**
 * Update product
 */
export async function updateProduct(
  id: string,
  data: Partial<CreateProductInput>
): Promise<Product> {
  const { variants, specifications, ...productData } = data;
  
  const updateData: Prisma.ProductUpdateInput = {
    ...productData,
    images: productData.images ? JSON.stringify(productData.images) : undefined,
    highlights: productData.highlights ? JSON.stringify(productData.highlights) : undefined,
    shippingCities: productData.shippingCities ? JSON.stringify(productData.shippingCities) : undefined,
  };
  
  return db.product.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete product (soft delete by changing status)
 */
export async function deleteProduct(id: string): Promise<Product> {
  return db.product.update({
    where: { id },
    data: { status: ProductStatus.SUSPENDED },
  });
}

/**
 * Update product stock
 */
export async function updateProductStock(
  productId: string,
  variantId: string | null,
  quantity: number,
  operation: 'add' | 'subtract'
): Promise<void> {
  const multiplier = operation === 'add' ? 1 : -1;
  
  if (variantId) {
    await db.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          increment: quantity * multiplier,
        },
      },
    });
  }
  
  // Update total stock
  await db.product.update({
    where: { id: productId },
    data: {
      totalStock: {
        increment: quantity * multiplier,
      },
    },
  });
}

/**
 * Get related products
 */
export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 8
): Promise<Product[]> {
  return db.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      status: ProductStatus.ACTIVE,
    },
    take: limit,
    orderBy: {
      saleCount: 'desc',
    },
    include: {
      variants: {
        take: 1,
      },
    },
  });
}
