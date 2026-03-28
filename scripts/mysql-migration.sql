-- =============================================
-- منصة تشارك - سكريبت ترحيل قاعدة البيانات
-- Tasharak Platform - MySQL Migration Script
-- =============================================
-- تحويل SQLite Schema إلى MySQL
-- Converts SQLite schema to MySQL compatible format
-- =============================================

-- إعداد الاتصال
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- التعدادات (Enums as Tables)
-- =============================================

-- ملاحظة: MySQL لا يدعم ENUM بشكل جيد مع Prisma
-- سنستخدم VARCHAR مع قيود CHECK

-- =============================================
-- المستخدمون والمصادقة
-- Users & Authentication
-- =============================================

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `password` VARCHAR(191) NULL,
  `name` VARCHAR(191) NULL,
  `avatar` VARCHAR(191) NULL,
  `userType` VARCHAR(191) NOT NULL DEFAULT 'BUYER',
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `language` VARCHAR(191) NOT NULL DEFAULT 'ar',
  `currency` VARCHAR(191) NOT NULL DEFAULT 'SAR',
  `isPhoneVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `isEmailVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `is2FAEnabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `twoFASecret` VARCHAR(191) NULL,
  `lastLoginAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_phone_key`(`phone`),
  UNIQUE INDEX `users_email_key`(`email`),
  INDEX `users_userType_idx`(`userType`),
  INDEX `users_status_idx`(`status`),
  INDEX `users_phone_idx`(`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `otp_codes`;
CREATE TABLE `otp_codes` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isUsed` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `otp_codes_userId_idx`(`userId`),
  INDEX `otp_codes_phone_idx`(`phone`),
  INDEX `otp_codes_expiresAt_idx`(`expiresAt`),
  CONSTRAINT `otp_codes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `userAgent` VARCHAR(500) NULL,
  `ipAddress` VARCHAR(191) NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `sessions_token_key`(`token`),
  INDEX `sessions_userId_idx`(`userId`),
  INDEX `sessions_expiresAt_idx`(`expiresAt`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `isRevoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `refresh_tokens_token_key`(`token`),
  INDEX `refresh_tokens_userId_idx`(`userId`),
  INDEX `refresh_tokens_expiresAt_idx`(`expiresAt`),
  CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `admin_profiles`;
CREATE TABLE `admin_profiles` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'OPERATIONS_MANAGER',
  `permissions` TEXT NOT NULL,
  `department` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `admin_profiles_userId_key`(`userId`),
  CONSTRAINT `admin_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `buyer_profiles`;
CREATE TABLE `buyer_profiles` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `totalOrders` INTEGER NOT NULL DEFAULT 0,
  `totalSpent` DOUBLE NOT NULL DEFAULT 0,
  `loyaltyPoints` INTEGER NOT NULL DEFAULT 0,
  `defaultAddressId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `buyer_profiles_userId_key`(`userId`),
  CONSTRAINT `buyer_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `merchant_profiles`;
CREATE TABLE `merchant_profiles` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `businessName` VARCHAR(191) NULL,
  `commercialRegNumber` VARCHAR(191) NULL,
  `taxNumber` VARCHAR(191) NULL,
  `bankName` VARCHAR(191) NULL,
  `bankAccountNumber` VARCHAR(191) NULL,
  `iban` VARCHAR(191) NULL,
  `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `verificationData` TEXT NULL,
  `verificationNotes` TEXT NULL,
  `subscriptionId` VARCHAR(191) NULL,
  `subscriptionPlan` VARCHAR(191) NOT NULL DEFAULT 'FREE',
  `productsLimit` INTEGER NOT NULL DEFAULT 10,
  `commissionRate` DOUBLE NOT NULL DEFAULT 0.15,
  `totalSales` DOUBLE NOT NULL DEFAULT 0,
  `totalOrders` INTEGER NOT NULL DEFAULT 0,
  `rating` DOUBLE NOT NULL DEFAULT 0,
  `totalReviews` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `merchant_profiles_userId_key`(`userId`),
  INDEX `merchant_profiles_verificationStatus_idx`(`verificationStatus`),
  INDEX `merchant_profiles_subscriptionPlan_idx`(`subscriptionPlan`),
  CONSTRAINT `merchant_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `merchant_documents`;
CREATE TABLE `merchant_documents` (
  `id` VARCHAR(191) NOT NULL,
  `merchantId` VARCHAR(191) NOT NULL,
  `documentType` VARCHAR(191) NOT NULL,
  `documentUrl` VARCHAR(500) NOT NULL,
  `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `merchant_documents_merchantId_idx`(`merchantId`),
  CONSTRAINT `merchant_documents_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant_profiles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `stores`;
CREATE TABLE `stores` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `storeName` VARCHAR(191) NOT NULL,
  `storeNameEn` VARCHAR(191) NULL,
  `slug` VARCHAR(191) NOT NULL,
  `logo` VARCHAR(500) NULL,
  `coverImage` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `descriptionEn` TEXT NULL,
  `theme` TEXT NULL,
  `socialLinks` TEXT NULL,
  `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `verificationData` TEXT NULL,
  `verificationNotes` TEXT NULL,
  `subscriptionId` VARCHAR(191) NULL,
  `subscriptionPlan` VARCHAR(191) NOT NULL DEFAULT 'FREE',
  `productsLimit` INTEGER NOT NULL DEFAULT 50,
  `commissionRate` DOUBLE NOT NULL DEFAULT 0.10,
  `totalSales` DOUBLE NOT NULL DEFAULT 0,
  `totalOrders` INTEGER NOT NULL DEFAULT 0,
  `rating` DOUBLE NOT NULL DEFAULT 0,
  `totalReviews` INTEGER NOT NULL DEFAULT 0,
  `isFeatured` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `stores_userId_key`(`userId`),
  UNIQUE INDEX `stores_slug_key`(`slug`),
  INDEX `stores_verificationStatus_idx`(`verificationStatus`),
  INDEX `stores_slug_idx`(`slug`),
  INDEX `stores_isFeatured_idx`(`isFeatured`),
  CONSTRAINT `stores_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `store_customizations`;
CREATE TABLE `store_customizations` (
  `id` VARCHAR(191) NOT NULL,
  `storeId` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `store_customizations_storeId_key_key`(`storeId`, `key`),
  CONSTRAINT `store_customizations_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `label` VARCHAR(191) NOT NULL,
  `recipientName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NOT NULL,
  `country` VARCHAR(191) NOT NULL DEFAULT 'السعودية',
  `city` VARCHAR(191) NOT NULL,
  `district` VARCHAR(191) NULL,
  `street` VARCHAR(191) NOT NULL,
  `buildingNo` VARCHAR(191) NULL,
  `floorNo` VARCHAR(191) NULL,
  `apartmentNo` VARCHAR(191) NULL,
  `postalCode` VARCHAR(191) NULL,
  `additionalInstructions` TEXT NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `addresses_userId_idx`(`userId`),
  CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- المنتجات والفئات
-- Products & Categories
-- =============================================

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` VARCHAR(191) NOT NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(500) NULL,
  `icon` VARCHAR(191) NULL,
  `parentId` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `showInHome` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `categories_slug_key`(`slug`),
  INDEX `categories_parentId_idx`(`parentId`),
  INDEX `categories_slug_idx`(`slug`),
  INDEX `categories_isActive_idx`(`isActive`),
  CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `category_specifications`;
CREATE TABLE `category_specifications` (
  `id` VARCHAR(191) NOT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `unit` VARCHAR(191) NULL,
  `isRequired` BOOLEAN NOT NULL DEFAULT FALSE,
  `isFilterable` BOOLEAN NOT NULL DEFAULT TRUE,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `category_specifications_categoryId_idx`(`categoryId`),
  CONSTRAINT `category_specifications_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` VARCHAR(191) NOT NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `slug` VARCHAR(191) NOT NULL,
  `logo` VARCHAR(500) NULL,
  `description` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `isFeatured` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `brands_slug_key`(`slug`),
  INDEX `brands_slug_idx`(`slug`),
  INDEX `brands_isActive_idx`(`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` VARCHAR(191) NOT NULL,
  `sku` VARCHAR(191) NOT NULL,
  `barcode` VARCHAR(191) NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `descriptionEn` TEXT NULL,
  `highlights` TEXT NULL,
  `categoryId` VARCHAR(191) NOT NULL,
  `brandId` VARCHAR(191) NULL,
  `merchantId` VARCHAR(191) NULL,
  `storeId` VARCHAR(191) NULL,
  `basePrice` DOUBLE NOT NULL,
  `salePrice` DOUBLE NULL,
  `costPrice` DOUBLE NULL,
  `vatRate` DOUBLE NOT NULL DEFAULT 0.15,
  `totalStock` INTEGER NOT NULL DEFAULT 0,
  `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,
  `weight` DOUBLE NULL,
  `length` DOUBLE NULL,
  `width` DOUBLE NULL,
  `height` DOUBLE NULL,
  `shippingCities` TEXT NULL,
  `images` TEXT NOT NULL,
  `videoUrl` VARCHAR(500) NULL,
  `metaTitle` VARCHAR(191) NULL,
  `metaDescription` TEXT NULL,
  `metaKeywords` VARCHAR(500) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  `isFeatured` BOOLEAN NOT NULL DEFAULT FALSE,
  `isFlashSale` BOOLEAN NOT NULL DEFAULT FALSE,
  `flashSaleEndsAt` DATETIME(3) NULL,
  `viewCount` INTEGER NOT NULL DEFAULT 0,
  `saleCount` INTEGER NOT NULL DEFAULT 0,
  `rating` DOUBLE NOT NULL DEFAULT 0,
  `totalReviews` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `products_sku_key`(`sku`),
  UNIQUE INDEX `products_slug_key`(`slug`),
  INDEX `products_categoryId_idx`(`categoryId`),
  INDEX `products_brandId_idx`(`brandId`),
  INDEX `products_merchantId_idx`(`merchantId`),
  INDEX `products_storeId_idx`(`storeId`),
  INDEX `products_slug_idx`(`slug`),
  INDEX `products_status_idx`(`status`),
  INDEX `products_isFeatured_idx`(`isFeatured`),
  INDEX `products_nameAr_idx`(`nameAr`),
  CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `products_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brands`(`id`) ON DELETE SET NULL,
  CONSTRAINT `products_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant_profiles`(`id`) ON DELETE SET NULL,
  CONSTRAINT `products_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `sku` VARCHAR(191) NOT NULL,
  `barcode` VARCHAR(191) NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `color` VARCHAR(191) NULL,
  `colorCode` VARCHAR(191) NULL,
  `size` VARCHAR(191) NULL,
  `packageSize` VARCHAR(191) NULL,
  `customAttributes` TEXT NULL,
  `price` DOUBLE NOT NULL,
  `salePrice` DOUBLE NULL,
  `stock` INTEGER NOT NULL DEFAULT 0,
  `images` TEXT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `product_variants_sku_key`(`sku`),
  INDEX `product_variants_productId_idx`(`productId`),
  CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `product_specifications`;
CREATE TABLE `product_specifications` (
  `id` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `specificationId` VARCHAR(191) NOT NULL,
  `value` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `product_specifications_productId_specificationId_key`(`productId`, `specificationId`),
  CONSTRAINT `product_specifications_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `product_specifications_specificationId_fkey` FOREIGN KEY (`specificationId`) REFERENCES `category_specifications`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- الطلبات والمدفوعات
-- Orders & Payments
-- =============================================

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` VARCHAR(191) NOT NULL,
  `orderNumber` VARCHAR(191) NOT NULL,
  `buyerId` VARCHAR(191) NOT NULL,
  `shippingAddressId` VARCHAR(191) NOT NULL,
  `merchantId` VARCHAR(191) NULL,
  `storeId` VARCHAR(191) NULL,
  `subtotal` DOUBLE NOT NULL,
  `discountAmount` DOUBLE NOT NULL DEFAULT 0,
  `shippingFee` DOUBLE NOT NULL DEFAULT 0,
  `vatAmount` DOUBLE NOT NULL DEFAULT 0,
  `totalAmount` DOUBLE NOT NULL,
  `commissionAmount` DOUBLE NOT NULL DEFAULT 0,
  `couponId` VARCHAR(191) NULL,
  `couponCode` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `shippingStatus` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `confirmedAt` DATETIME(3) NULL,
  `shippedAt` DATETIME(3) NULL,
  `deliveredAt` DATETIME(3) NULL,
  `cancelledAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `notes` TEXT NULL,
  `cancellationReason` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
  INDEX `orders_buyerId_idx`(`buyerId`),
  INDEX `orders_merchantId_idx`(`merchantId`),
  INDEX `orders_storeId_idx`(`storeId`),
  INDEX `orders_status_idx`(`status`),
  INDEX `orders_paymentStatus_idx`(`paymentStatus`),
  INDEX `orders_createdAt_idx`(`createdAt`),
  CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `orders_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant_profiles`(`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_shippingAddressId_fkey` FOREIGN KEY (`shippingAddressId`) REFERENCES `addresses`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `variantId` VARCHAR(191) NULL,
  `quantity` INTEGER NOT NULL,
  `unitPrice` DOUBLE NOT NULL,
  `totalPrice` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `order_items_orderId_idx`(`orderId`),
  INDEX `order_items_productId_idx`(`productId`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `order_tracking`;
CREATE TABLE `order_tracking` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `description` TEXT NOT NULL,
  `location` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `order_tracking_orderId_idx`(`orderId`),
  CONSTRAINT `order_tracking_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` VARCHAR(191) NOT NULL,
  `orderId` VARCHAR(191) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `method` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `transactionId` VARCHAR(191) NULL,
  `paymentGateway` VARCHAR(191) NULL,
  `gatewayResponse` TEXT NULL,
  `paidAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `payments_orderId_idx`(`orderId`),
  INDEX `payments_transactionId_idx`(`transactionId`),
  CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- السلة وقائمة الأمنيات
-- Cart & Wishlist
-- =============================================

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` VARCHAR(191) NOT NULL,
  `cartId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `variantId` VARCHAR(191) NULL,
  `quantity` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cart_items_cartId_productId_variantId_key`(`cartId`, `productId`, `variantId`),
  CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `carts_userId_key`(`userId`),
  CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for cart_items.cartId after carts table is created
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE CASCADE;

DROP TABLE IF EXISTS `wishlist_items`;
CREATE TABLE `wishlist_items` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `wishlist_items_userId_productId_key`(`userId`, `productId`),
  CONSTRAINT `wishlist_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- الكوبونات والعروض
-- Coupons & Promotions
-- =============================================

DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `value` DOUBLE NOT NULL,
  `minValue` DOUBLE NULL,
  `maxDiscount` DOUBLE NULL,
  `usageLimit` INTEGER NULL,
  `usedCount` INTEGER NOT NULL DEFAULT 0,
  `perUserLimit` INTEGER NOT NULL DEFAULT 1,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `applicableCategories` TEXT NULL,
  `applicableProducts` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `coupons_code_key`(`code`),
  INDEX `coupons_code_idx`(`code`),
  INDEX `coupons_isActive_idx`(`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `flash_sale_items`;
CREATE TABLE `flash_sale_items` (
  `id` VARCHAR(191) NOT NULL,
  `flashSaleId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `salePrice` DOUBLE NOT NULL,
  `quantity` INTEGER NOT NULL,
  `soldCount` INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `flash_sale_items_flashSaleId_fkey` FOREIGN KEY (`flashSaleId`) REFERENCES `flash_sales`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `flash_sales`;
CREATE TABLE `flash_sales` (
  `id` VARCHAR(191) NOT NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `startTime` DATETIME(3) NOT NULL,
  `endTime` DATETIME(3) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `flash_sales_isActive_idx`(`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- التقييمات والمراجعات
-- Reviews & Ratings
-- =============================================

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `rating` INTEGER NOT NULL,
  `title` VARCHAR(191) NULL,
  `comment` TEXT NULL,
  `images` TEXT NULL,
  `isVerified` BOOLEAN NOT NULL DEFAULT FALSE,
  `isApproved` BOOLEAN NOT NULL DEFAULT TRUE,
  `helpfulCount` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reviews_userId_productId_key`(`userId`, `productId`),
  INDEX `reviews_productId_idx`(`productId`),
  CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- الاشتراكات والتسويات
-- Subscriptions & Settlements
-- =============================================

DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` VARCHAR(191) NOT NULL,
  `nameAr` VARCHAR(191) NOT NULL,
  `nameEn` VARCHAR(191) NULL,
  `code` VARCHAR(191) NOT NULL,
  `priceMonthly` DOUBLE NOT NULL,
  `priceYearly` DOUBLE NOT NULL,
  `productsLimit` INTEGER NOT NULL,
  `commissionRate` DOUBLE NOT NULL,
  `features` TEXT NOT NULL,
  `isFeatured` BOOLEAN NOT NULL DEFAULT FALSE,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `subscription_plans_code_key`(`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` VARCHAR(191) NOT NULL,
  `planId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `storeId` VARCHAR(191) NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  `autoRenew` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `subscriptions_userId_idx`(`userId`),
  CONSTRAINT `subscriptions_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `settlements`;
CREATE TABLE `settlements` (
  `id` VARCHAR(191) NOT NULL,
  `merchantId` VARCHAR(191) NULL,
  `storeId` VARCHAR(191) NULL,
  `periodStart` DATETIME(3) NOT NULL,
  `periodEnd` DATETIME(3) NOT NULL,
  `totalSales` DOUBLE NOT NULL,
  `totalCommission` DOUBLE NOT NULL,
  `totalRefunds` DOUBLE NOT NULL DEFAULT 0,
  `netAmount` DOUBLE NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `paidAt` DATETIME(3) NULL,
  `paymentReference` VARCHAR(191) NULL,
  `reportUrl` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `settlements_merchantId_idx`(`merchantId`),
  INDEX `settlements_storeId_idx`(`storeId`),
  INDEX `settlements_status_idx`(`status`),
  CONSTRAINT `settlements_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `merchant_profiles`(`id`) ON DELETE SET NULL,
  CONSTRAINT `settlements_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `stores`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- الصفحة الرئيسية الديناميكية
-- Dynamic Homepage
-- =============================================

DROP TABLE IF EXISTS `homepage_products`;
CREATE TABLE `homepage_products` (
  `id` VARCHAR(191) NOT NULL,
  `sectionId` VARCHAR(191) NOT NULL,
  `productId` VARCHAR(191) NOT NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `homepage_products_sectionId_productId_key`(`sectionId`, `productId`),
  CONSTRAINT `homepage_products_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `homepage_sections`(`id`) ON DELETE CASCADE,
  CONSTRAINT `homepage_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `homepage_banners`;
CREATE TABLE `homepage_banners` (
  `id` VARCHAR(191) NOT NULL,
  `sectionId` VARCHAR(191) NOT NULL,
  `titleAr` VARCHAR(191) NULL,
  `titleEn` VARCHAR(191) NULL,
  `subtitleAr` VARCHAR(191) NULL,
  `subtitleEn` VARCHAR(191) NULL,
  `imageAr` VARCHAR(500) NOT NULL,
  `imageEn` VARCHAR(500) NULL,
  `linkUrl` VARCHAR(500) NULL,
  `buttonTextAr` VARCHAR(191) NULL,
  `buttonTextEn` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `homepage_banners_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `homepage_sections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `homepage_sections`;
CREATE TABLE `homepage_sections` (
  `id` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `titleAr` VARCHAR(191) NULL,
  `titleEn` VARCHAR(191) NULL,
  `isVisible` BOOLEAN NOT NULL DEFAULT TRUE,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `config` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `homepage_sections_isVisible_idx`(`isVisible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `homepage_sliders`;
CREATE TABLE `homepage_sliders` (
  `id` VARCHAR(191) NOT NULL,
  `titleAr` VARCHAR(191) NULL,
  `titleEn` VARCHAR(191) NULL,
  `subtitleAr` VARCHAR(191) NULL,
  `subtitleEn` VARCHAR(191) NULL,
  `imageAr` VARCHAR(500) NOT NULL,
  `imageEn` VARCHAR(500) NULL,
  `linkUrl` VARCHAR(500) NULL,
  `buttonTextAr` VARCHAR(191) NULL,
  `buttonTextEn` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `homepage_sliders_isActive_idx`(`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- الإشعارات والدعم
-- Notifications & Support
-- =============================================

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `data` TEXT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `notifications_userId_idx`(`userId`),
  INDEX `notifications_isRead_idx`(`isRead`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ticket_replies`;
CREATE TABLE `ticket_replies` (
  `id` VARCHAR(191) NOT NULL,
  `ticketId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `adminId` VARCHAR(191) NULL,
  `message` TEXT NOT NULL,
  `attachments` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `ticket_replies_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE `support_tickets` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'OPEN',
  `priority` VARCHAR(191) NOT NULL DEFAULT 'MEDIUM',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `support_tickets_userId_idx`(`userId`),
  INDEX `support_tickets_status_idx`(`status`),
  CONSTRAINT `support_tickets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `entityType` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `oldValue` TEXT NULL,
  `newValue` TEXT NULL,
  `ipAddress` VARCHAR(191) NULL,
  `userAgent` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `audit_logs_userId_idx`(`userId`),
  INDEX `audit_logs_action_idx`(`action`),
  INDEX `audit_logs_entityType_idx`(`entityType`),
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  `type` VARCHAR(191) NOT NULL DEFAULT 'string',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `settings_key_key`(`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- إعادة تفعيل الفحص
-- Re-enable Foreign Key Checks
-- =============================================
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- بيانات أولية - Seed Data
-- =============================================

-- إضافة خطط الاشتراك الافتراضية
INSERT INTO `subscription_plans` (`id`, `nameAr`, `nameEn`, `code`, `priceMonthly`, `priceYearly`, `productsLimit`, `commissionRate`, `features`, `isFeatured`, `isActive`, `sortOrder`) VALUES
('plan_free', 'المجانية', 'Free', 'FREE', 0, 0, 10, 0.15, '{"ar":["10 منتجات","عمولة 15%","دعم فني بالبريد"],"en":["10 products","15% commission","Email support"]}', FALSE, TRUE, 1),
('plan_basic', 'الأساسية', 'Basic', 'BASIC', 99, 990, 50, 0.12, '{"ar":["50 منتج","عمولة 12%","دعم فني بالواتساب","تقارير مبيعات"],"en":["50 products","12% commission","WhatsApp support","Sales reports"]}', FALSE, TRUE, 2),
('plan_professional', 'المحترفة', 'Professional', 'PROFESSIONAL', 299, 2990, 200, 0.10, '{"ar":["200 منتج","عمولة 10%","دعم فني 24/7","تقارير متقدمة","API كامل"],"en":["200 products","10% commission","24/7 support","Advanced reports","Full API"]}', TRUE, TRUE, 3),
('plan_premium', 'المميزة', 'Premium', 'PREMIUM', 599, 5990, 1000, 0.08, '{"ar":["1000 منتج","عمولة 8%","دعم فني VIP","تقارير مخصصة","API كامل","متجر مخصص"],"en":["1000 products","8% commission","VIP support","Custom reports","Full API","Custom store"]}', FALSE, TRUE, 4);

-- =============================================
-- نهاية السكريبت
-- End of Script
-- =============================================
