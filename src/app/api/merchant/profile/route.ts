import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/merchant/profile - Get merchant profile
export async function GET() {
  try {
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    const merchant = await db.merchantProfile.findUnique({
      where: { userId: merchantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
        documents: true,
        products: {
          select: {
            id: true,
            status: true,
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
    });

    if (!merchant) {
      // Return demo data for development
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: 'demo-user-id',
            name: 'محمد أحمد العلي',
            phone: '0501234567',
            email: 'merchant@example.com',
            avatar: null,
            createdAt: new Date('2024-01-01'),
          },
          businessName: 'متجر الأمانة',
          commercialRegNumber: '1010123456',
          taxNumber: '310123456789003',
          bankName: 'البنك الأهلي السعودي',
          bankAccountNumber: '****4567',
          iban: 'SA******4567',
          verificationStatus: 'VERIFIED',
          subscriptionPlan: 'FREE',
          productsLimit: 10,
          commissionRate: 0.15,
          totalSales: 45230,
          totalOrders: 156,
          rating: 4.8,
          totalReviews: 89,
          createdAt: new Date('2024-01-01'),
          documents: [
            {
              id: '1',
              documentType: 'COMMERCIAL_REGISTRATION',
              verificationStatus: 'VERIFIED',
              uploadedAt: new Date('2024-01-01'),
            },
            {
              id: '2',
              documentType: 'TAX_CERTIFICATE',
              verificationStatus: 'VERIFIED',
              uploadedAt: new Date('2024-01-01'),
            },
          ],
          products: [
            { id: '1', status: 'ACTIVE' },
            { id: '2', status: 'ACTIVE' },
          ],
          orders: [
            { id: '1', totalAmount: 500, status: 'DELIVERED' },
          ],
        },
      });
    }

    // Calculate stats
    const totalSales = merchant.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = merchant.orders.length;
    const activeProducts = merchant.products.filter(p => p.status === 'ACTIVE').length;

    return NextResponse.json({
      success: true,
      data: {
        ...merchant,
        stats: {
          totalSales,
          totalOrders,
          activeProducts,
          totalProducts: merchant.products.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching merchant profile:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب الملف الشخصي' },
      { status: 500 }
    );
  }
}

// PUT /api/merchant/profile - Update merchant profile
export async function PUT(request: NextRequest) {
  try {
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    const body = await request.json();
    const {
      businessName,
      description,
      city,
      bankName,
      bankAccountNumber,
      iban,
    } = body;

    // Update merchant profile
    const merchant = await db.merchantProfile.update({
      where: { userId: merchantId },
      data: {
        businessName,
        bankName,
        bankAccountNumber,
        iban,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Update user city if provided
    if (city) {
      await db.user.update({
        where: { id: merchantId },
        data: { /* city field would go here if it exists */ },
      });
    }

    return NextResponse.json({
      success: true,
      data: merchant,
      message: 'تم تحديث الملف الشخصي بنجاح',
    });
  } catch (error) {
    console.error('Error updating merchant profile:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث الملف الشخصي' },
      { status: 500 }
    );
  }
}

// POST /api/merchant/profile/documents - Upload document
export async function POST(request: NextRequest) {
  try {
    // In a real app, get merchant ID from auth token
    const merchantId = 'demo-merchant-id';

    const body = await request.json();
    const { documentType, documentUrl } = body;

    if (!documentType || !documentUrl) {
      return NextResponse.json(
        { success: false, error: 'يرجى تحديد نوع المستند والملف' },
        { status: 400 }
      );
    }

    // Create document record
    const document = await db.merchantDocument.create({
      data: {
        merchantId,
        documentType,
        documentUrl,
        verificationStatus: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: document,
      message: 'تم رفع المستند بنجاح، سيتم مراجعته قريباً',
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء رفع المستند' },
      { status: 500 }
    );
  }
}
