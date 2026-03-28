/**
 * Product Validators
 * Zod schemas for product-related requests
 */

import { z } from 'zod';

/**
 * Product Status Enum
 */
const productStatusEnum = z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'OUT_OF_STOCK', 'SUSPENDED']);

/**
 * Product Variant Schema
 */
const productVariantSchema = z.object({
  sku: z.string().min(1, 'SKU مطلوب'),
  barcode: z.string().optional(),
  nameAr: z.string().min(1, 'اسم المتغير بالعربية مطلوب'),
  nameEn: z.string().optional(),
  color: z.string().optional(),
  colorCode: z.string().optional(),
  size: z.string().optional(),
  packageSize: z.string().optional(),
  customAttributes: z.record(z.string()).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر'),
  salePrice: z.number().min(0).optional(),
  stock: z.number().int().min(0, 'المخزون يجب أن يكون أكبر من أو يساوي صفر'),
  images: z.array(z.string().url()).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Product Specification Schema
 */
const productSpecificationSchema = z.object({
  specificationId: z.string().min(1, 'معرف المواصفة مطلوب'),
  value: z.string().min(1, 'قيمة المواصفة مطلوبة'),
});

/**
 * Create Product Schema
 */
export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU مطلوب'),
  barcode: z.string().optional(),
  nameAr: z.string().min(1, 'اسم المنتج بالعربية مطلوب').max(200, 'اسم المنتج طويل جداً'),
  nameEn: z.string().max(200).optional(),
  slug: z.string().min(1, 'الرابط مطلوب').max(250),
  description: z.string().max(5000).optional(),
  descriptionEn: z.string().max(5000).optional(),
  highlights: z.array(z.string()).optional(),
  categoryId: z.string().min(1, 'التصنيف مطلوب'),
  brandId: z.string().optional(),
  
  // Pricing
  basePrice: z.number().min(0, 'السعر الأساسي مطلوب'),
  salePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  vatRate: z.number().min(0).max(1).default(0.15),
  
  // Inventory
  totalStock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  
  // Shipping
  weight: z.number().positive().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  shippingCities: z.array(z.string()).optional(),
  
  // Media
  images: z.array(z.string().url()).min(1, 'صورة واحدة على الأقل مطلوبة'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  
  // SEO
  metaTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(300).optional(),
  metaKeywords: z.string().max(200).optional(),
  
  // Status
  status: productStatusEnum.default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
  flashSaleEndsAt: z.string().datetime().optional(),
  
  // Variants
  variants: z.array(productVariantSchema).optional(),
  
  // Specifications
  specifications: z.array(productSpecificationSchema).optional(),
});

/**
 * Update Product Schema
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Product Query Schema
 */
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: productStatusEnum.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: z.coerce.boolean().optional(),
  isFlashSale: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'price', 'name', 'rating', 'saleCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Product ID Schema
 */
export const productIdSchema = z.object({
  id: z.string().min(1, 'معرف المنتج مطلوب'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
