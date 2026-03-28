/**
 * Order Types
 * Type definitions for order-related entities
 */

import { OrderStatus, PaymentStatus, PaymentMethod, ShippingStatus } from '@prisma/client';

// Order item display
export interface OrderItemDisplay {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  product: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    slug: string;
    images: string;
  };
  variant?: {
    id: string;
    nameAr: string;
    nameEn: string | null;
    color?: string;
    size?: string;
  };
}

// Shipping address display
export interface ShippingAddressDisplay {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  country: string;
  city: string;
  district?: string;
  street: string;
  buildingNo?: string;
  floorNo?: string;
  apartmentNo?: string;
  postalCode?: string;
  additionalInstructions?: string;
  latitude?: number;
  longitude?: number;
}

// Payment display
export interface PaymentDisplay {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentGateway?: string;
  gatewayResponse?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Order tracking display
export interface OrderTrackingDisplay {
  id: string;
  orderId: string;
  status: string;
  description: string;
  location?: string;
  createdAt: Date;
}

// Order list item
export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  vatAmount: number;
  totalAmount: number;
  commissionAmount: number;
  itemCount: number;
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

// Order detail
export interface OrderDetail extends OrderListItem {
  notes?: string;
  cancellationReason?: string;
  buyer: {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    avatar?: string;
  };
  merchant?: {
    id: string;
    businessName?: string;
  };
  store?: {
    id: string;
    storeName: string;
    slug: string;
    logo?: string;
  };
  items: OrderItemDisplay[];
  shippingAddress: ShippingAddressDisplay;
  payments: PaymentDisplay[];
  tracking: OrderTrackingDisplay[];
}

// Order create input
export interface OrderCreateInput {
  items: OrderItemInput[];
  shippingAddressId: string;
  couponCode?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

// Order item input
export interface OrderItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

// Order status update input
export interface OrderStatusUpdateInput {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  notes?: string;
  cancellationReason?: string;
}

// Order query filters
export interface OrderQueryFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingStatus?: ShippingStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  buyerId?: string;
  merchantId?: string;
  storeId?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Order tracking input
export interface OrderTrackingInput {
  status: string;
  description: string;
  location?: string;
}

// Order statistics
export interface OrderStatistics {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  totalRevenue: number;
  averageOrderValue: number;
}

// Order response
export interface OrderResponse {
  success: boolean;
  data?: OrderDetail;
  message?: string;
}

// Orders list response
export interface OrdersListResponse {
  success: boolean;
  data: OrderListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Order status history
export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  changedAt: Date;
  changedBy?: string;
  notes?: string;
}

// Payment create input
export interface PaymentCreateInput {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  paymentGateway?: string;
  gatewayResponse?: string;
}

// Order fulfillment input
export interface OrderFulfillmentInput {
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDeliveryDate?: Date;
  trackingUrl?: string;
}

// Bulk order status update
export interface BulkOrderStatusUpdate {
  orderIds: string[];
  status: OrderStatus;
  notes?: string;
}

// Order refund request
export interface OrderRefundRequest {
  orderId: string;
  reason: string;
  amount?: number;
  refundItems?: {
    itemId: string;
    quantity: number;
  }[];
}
