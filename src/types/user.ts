/**
 * User Types
 * Type definitions for user-related entities
 */

import { UserType, UserStatus } from '@prisma/client';

// Safe user data (excludes sensitive fields)
export interface SafeUser {
  id: string;
  phone: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
  userType: UserType;
  status: UserStatus;
  language: string;
  currency: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  is2FAEnabled: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

// User profile based on type
export interface BuyerProfileData {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
}

export interface MerchantProfileData {
  businessName: string | null;
  commercialRegNumber: string | null;
  taxNumber: string | null;
  verificationStatus: string;
  subscriptionPlan: string;
  productsLimit: number;
  commissionRate: number;
  totalSales: number;
  totalOrders: number;
  rating: number;
  totalReviews: number;
}

export interface StoreProfileData extends MerchantProfileData {
  storeName: string;
  slug: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  isFeatured: boolean;
}

export interface AdminProfileData {
  role: string;
  permissions: string[];
  department: string | null;
}

// Combined user with profile
export interface UserWithProfile extends SafeUser {
  buyerProfile?: BuyerProfileData;
  merchantProfile?: MerchantProfileData;
  store?: StoreProfileData;
  adminProfile?: AdminProfileData;
}
