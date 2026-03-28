/**
 * Product Types
 * Type definitions for product-related entities
 */

import { ProductStatus } from '@prisma/client';

// Product image structure
export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

// Product variant
export interface ProductVariantDisplay {
  id: string;
  sku: string;
  barcode?: string;
  nameAr: string;
  nameEn: string | null;
  color?: string;
  colorCode?: string;
  size?: string;
  packageSize?: string;
  customAttributes?: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product specification
export interface ProductSpecificationDisplay {
  id: string;
  nameAr: string;
  nameEn: string | null;
  value: string;
  unit?: string;
  isRequired?: boolean;
  isFilterable?: boolean;
}

// Product list item
export interface ProductListItem {
  id: string;
  sku: string;
  barcode?: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  description?: string;
  basePrice: number;
  salePrice?: number;
  images: string[];
  totalStock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  isFlashSale: boolean;
  flashSaleEndsAt?: Date;
  rating: number;
  totalReviews: number;
  viewCount: number;
  saleCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    slug: string;
  };
  brand?: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    slug: string;
  };
  variants?: ProductVariantDisplay[];
}

// Product detail
export interface ProductDetail extends ProductListItem {
  descriptionEn?: string;
  highlights?: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  shippingCities?: string[];
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  specifications: ProductSpecificationDisplay[];
  variants: ProductVariantDisplay[];
  merchant?: {
    id: string;
    businessName?: string;
    rating: number;
    totalReviews: number;
  };
  store?: {
    id: string;
    storeName: string;
    slug: string;
    logo?: string;
    rating: number;
    totalReviews: number;
  };
}

// Product create input
export interface ProductCreateInput {
  sku: string;
  barcode?: string;
  nameAr: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionEn?: string;
  highlights?: string[];
  categoryId: string;
  brandId?: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  vatRate?: number;
  totalStock?: number;
  lowStockThreshold?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  shippingCities?: string[];
  images: string[];
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSaleEndsAt?: Date;
  variants?: ProductVariantCreateInput[];
  specifications?: ProductSpecificationInput[];
}

// Product variant create input
export interface ProductVariantCreateInput {
  sku: string;
  barcode?: string;
  nameAr: string;
  nameEn?: string;
  color?: string;
  colorCode?: string;
  size?: string;
  packageSize?: string;
  customAttributes?: Record<string, string>;
  price: number;
  salePrice?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}

// Product specification input
export interface ProductSpecificationInput {
  specificationId: string;
  value: string;
}

// Product update input
export type ProductUpdateInput = Partial<ProductCreateInput>;

// Product query filters
export interface ProductQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  merchantId?: string;
  storeId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  inStock?: boolean;
  sortBy?: 'createdAt' | 'price' | 'name' | 'rating' | 'saleCount' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

// Category tree item
export interface CategoryTreeItem {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  showInHome: boolean;
  productCount: number;
  children: CategoryTreeItem[];
}

// Category create input
export interface CategoryCreateInput {
  nameAr: string;
  nameEn?: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  showInHome?: boolean;
}

// Category update input
export type CategoryUpdateInput = Partial<CategoryCreateInput>;

// Brand display
export interface BrandDisplay {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
}

// Product response
export interface ProductResponse {
  success: boolean;
  data?: ProductDetail;
  message?: string;
}

// Products list response
export interface ProductsListResponse {
  success: boolean;
  data: ProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Related products
export interface RelatedProductsResponse {
  success: boolean;
  data: ProductListItem[];
}
