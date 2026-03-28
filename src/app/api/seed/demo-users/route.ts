/**
 * API إنشاء المستخدمين التجريبيين
 * Demo Users Seeder API
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

// الحسابات التجريبية
const DEMO_ACCOUNTS = [
  { 
    type: 'BUYER', 
    name: 'أحمد المشتري', 
    phone: '0500000001', 
    password: 'Demo@123456',
    email: 'buyer@demo.com',
  },
  { 
    type: 'MERCHANT', 
    name: 'محمد التاجر', 
    phone: '0500000002', 
    password: 'Demo@123456',
    email: 'merchant@demo.com',
  },
  { 
    type: 'STORE', 
    name: 'متجر التقنية', 
    phone: '0500000003', 
    password: 'Demo@123456',
    email: 'store@demo.com',
  },
  { 
    type: 'ADMIN', 
    name: 'مدير النظام', 
    phone: '0500000000', 
    password: 'Admin@123456',
    email: 'admin@demo.com',
  },
];

export async function GET() {
  try {
    // التحقق من وجود مستخدمين مسبقاً
    const existingUsers = await db.user.findMany({
      where: {
        phone: { in: DEMO_ACCOUNTS.map(a => a.phone) }
      }
    });
    
    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'الحسابات التجريبية موجودة مسبقاً',
        demoUsers: DEMO_ACCOUNTS.map(a => ({
          ...a,
          password: a.password, // نعرض كلمة المرور
        })),
        existingCount: existingUsers.length,
      });
    }

    // تشفير كلمات المرور
    const salt = await hash('Demo@123456', 12);
    const hashedPassword = salt;
    const hashedAdminPassword = await hash('Admin@123456', 12);

    // إنشاء المستخدمين التجريبيين
    const users = await Promise.all([
      // 1. مشتري
      db.user.create({
        data: {
          phone: '0500000001',
          name: 'أحمد المشتري',
          email: 'buyer@demo.com',
          password: hashedPassword,
          userType: 'BUYER',
          status: 'ACTIVE',
          isPhoneVerified: true,
          buyerProfile: {
            create: {
              totalOrders: 5,
              totalSpent: 2500,
              loyaltyPoints: 250,
            }
          }
        }
      }),
      
      // 2. تاجر مستقل
      db.user.create({
        data: {
          phone: '0500000002',
          name: 'محمد التاجر',
          email: 'merchant@demo.com',
          password: hashedPassword,
          userType: 'MERCHANT',
          status: 'ACTIVE',
          isPhoneVerified: true,
          merchantProfile: {
            create: {
              businessName: 'متجر محمد الإلكتروني',
              subscriptionPlan: 'BASIC',
              productsLimit: 50,
              commissionRate: 0.12,
              totalSales: 15000,
              totalOrders: 25,
              rating: 4.5,
              totalReviews: 12,
              verificationStatus: 'VERIFIED',
            }
          }
        }
      }),
      
      // 3. متجر
      db.user.create({
        data: {
          phone: '0500000003',
          name: 'متجر التقنية',
          email: 'store@demo.com',
          password: hashedPassword,
          userType: 'STORE',
          status: 'ACTIVE',
          isPhoneVerified: true,
          store: {
            create: {
              storeName: 'متجر التقنية المتقدم',
              storeNameEn: 'Tech Store',
              slug: 'tech-store',
              description: 'متجر متخصص في الأجهزة الإلكترونية والإكسسوارات',
              subscriptionPlan: 'PROFESSIONAL',
              productsLimit: 200,
              commissionRate: 0.10,
              totalSales: 85000,
              totalOrders: 150,
              rating: 4.8,
              totalReviews: 85,
              verificationStatus: 'VERIFIED',
              isFeatured: true,
            }
          }
        }
      }),
      
      // 4. أدمن
      db.user.create({
        data: {
          phone: '0500000000',
          name: 'مدير النظام',
          email: 'admin@demo.com',
          password: hashedAdminPassword,
          userType: 'ADMIN',
          status: 'ACTIVE',
          isPhoneVerified: true,
          adminProfile: {
            create: {
              role: 'SUPER_ADMIN',
              permissions: JSON.stringify([
                'manage_users',
                'manage_merchants',
                'manage_stores',
                'manage_products',
                'manage_orders',
                'manage_categories',
                'manage_coupons',
                'manage_subscriptions',
                'view_reports',
                'manage_settings',
              ]),
              department: 'الإدارة العامة',
            }
          }
        }
      }),
    ]);

    // إنشاء فئات تجريبية
    const categories = await Promise.all([
      db.category.create({
        data: {
          nameAr: 'إلكترونيات',
          nameEn: 'Electronics',
          slug: 'electronics',
          isActive: true,
          showInHome: true,
        }
      }),
      db.category.create({
        data: {
          nameAr: 'أزياء',
          nameEn: 'Fashion',
          slug: 'fashion',
          isActive: true,
          showInHome: true,
        }
      }),
      db.category.create({
        data: {
          nameAr: 'منزل ومطبخ',
          nameEn: 'Home & Kitchen',
          slug: 'home-kitchen',
          isActive: true,
          showInHome: true,
        }
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحسابات التجريبية بنجاح ✅',
      demoUsers: DEMO_ACCOUNTS,
      stats: {
        users: users.length,
        categories: categories.length,
      },
    });
    
  } catch (error) {
    console.error('Error seeding demo users:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ أثناء إنشاء الحسابات التجريبية',
      demoUsers: DEMO_ACCOUNTS,
      hint: 'يمكنك تسجيل حساب جديد من صفحة التسجيل',
    }, { status: 500 });
  }
}
