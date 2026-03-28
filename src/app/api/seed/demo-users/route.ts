/**
 * API معلومات المستخدمين التجريبيين
 * Demo Users Info API
 */

import { NextResponse } from 'next/server';

// بيانات الحسابات التجريبية
const DEMO_ACCOUNTS = [
  { type: 'ADMIN', phone: '0500000000', password: 'Admin@123456', name: 'مدير النظام' },
  { type: 'BUYER', phone: '0500000001', password: 'Demo@123456', name: 'أحمد المشتري' },
  { type: 'MERCHANT', phone: '0500000002', password: 'Demo@123456', name: 'محمد التاجر' },
  { type: 'STORE', phone: '0500000003', password: 'Demo@123456', name: 'متجر التقنية' },
];

export async function GET() {
  return NextResponse.json({
    message: 'بيانات الحسابات التجريبية',
    accounts: DEMO_ACCOUNTS,
    note: 'هذه البيانات للعرض فقط - لا يمكن إنشاء حسابات من هنا'
  });
}
