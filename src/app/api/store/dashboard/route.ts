/**
 * Store Dashboard API
 * Provides statistics and data for the store dashboard
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/store/dashboard - Get store dashboard statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    // Get store info
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        storeName: true,
        logo: true,
        totalSales: true,
        totalOrders: true,
        rating: true,
        totalReviews: true,
        subscriptionPlan: true,
        commissionRate: true,
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Get products count
    const productsCount = await db.product.count({
      where: { storeId, status: 'ACTIVE' }
    })

    // Get orders statistics
    const orders = await db.order.findMany({
      where: { storeId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      }
    })

    // Calculate order statistics
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length
    const processingOrders = orders.filter(o => o.status === 'PROCESSING').length
    const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length

    // Get low stock products
    const lowStockProducts = await db.product.findMany({
      where: {
        storeId,
        totalStock: {
          lte: db.product.fields.lowStockThreshold
        }
      },
      select: {
        id: true,
        nameAr: true,
        sku: true,
        totalStock: true,
        lowStockThreshold: true,
      },
      take: 10
    })

    // Get recent orders
    const recentOrders = await db.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        buyer: {
          select: {
            name: true,
          }
        }
      }
    })

    // Get top selling products
    const topProducts = await db.product.findMany({
      where: { storeId },
      orderBy: { saleCount: 'desc' },
      take: 5,
      select: {
        id: true,
        nameAr: true,
        basePrice: true,
        salePrice: true,
        saleCount: true,
        rating: true,
      }
    })

    // Calculate this month's revenue
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth)
    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Calculate last month's revenue for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    const lastMonthOrders = orders.filter(o => {
      const date = new Date(o.createdAt)
      return date >= startOfLastMonth && date <= endOfLastMonth
    })
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Calculate growth percentage
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    // Get unique customers count
    const uniqueCustomers = new Set(orders.map(o => o.buyer?.id)).size

    // Calculate average order value
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    return NextResponse.json({
      store,
      statistics: {
        totalSales: store.totalSales,
        totalOrders: store.totalOrders,
        productsCount,
        customersCount: uniqueCustomers,
        thisMonthRevenue,
        revenueGrowth: revenueGrowth.toFixed(1),
        averageOrderValue: averageOrderValue.toFixed(2),
        rating: store.rating,
        totalReviews: store.totalReviews,
      },
      orderStats: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      lowStockProducts,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.buyer?.name || 'غير محدد',
        total: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      })),
      topProducts: topProducts.map(p => ({
        id: p.id,
        name: p.nameAr,
        price: p.salePrice || p.basePrice,
        sales: p.saleCount,
        rating: p.rating,
      })),
    })
  } catch (error) {
    console.error('Error fetching store dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
