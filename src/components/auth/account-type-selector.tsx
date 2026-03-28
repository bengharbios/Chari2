/**
 * Account Type Selector Component
 * مكون اختيار نوع الحساب
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { User, Store, Building2, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';

type AccountType = 'BUYER' | 'MERCHANT' | 'STORE';

interface AccountTypeOption {
  value: AccountType;
  label: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const accountTypes: AccountTypeOption[] = [
  {
    value: 'BUYER',
    label: 'مشتري',
    description: 'تسوق واشتري من آلاف المتاجر',
    icon: <User className="h-6 w-6" />,
    features: [
      'تصفح وشراء المنتجات',
      'تتبع الطلبات',
      'تقييم المنتجات والمتاجر',
      'برنامج الولاء والنقاط',
    ],
  },
  {
    value: 'MERCHANT',
    label: 'تاجر مستقل',
    description: 'ابع منتجاتك بدون متجر',
    icon: <Store className="h-6 w-6" />,
    features: [
      'بيع المنتجات مباشرة',
      'عمولة تنافسية',
      'تحليلات المبيعات',
      'دعم فني مخصص',
    ],
  },
  {
    value: 'STORE',
    label: 'متجر',
    description: 'أنشئ متجرك الإلكتروني',
    icon: <Building2 className="h-6 w-6" />,
    features: [
      'متجر مستقل خاص بك',
      'رابط متجر مخصص',
      'أدوات تسويق متقدمة',
      'تقارير تفصيلية',
    ],
  },
];

interface AccountTypeSelectorProps {
  value: AccountType | null;
  onChange: (value: AccountType) => void;
  error?: string;
  disabled?: boolean;
}

export function AccountTypeSelector({
  value,
  onChange,
  error,
  disabled,
}: AccountTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-gray-700 font-medium">نوع الحساب</Label>
      
      <div className="grid gap-3">
        {accountTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            disabled={disabled}
            className={cn(
              'relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-start',
              'hover:border-primary/50 hover:bg-primary/5',
              value === type.value
                ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                : 'border-border bg-white',
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-destructive'
            )}
          >
            <div className="flex items-start gap-4">
              {/* أيقونة */}
              <div
                className={cn(
                  'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                  value === type.value
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {type.icon}
              </div>

              {/* المحتوى */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{type.label}</h3>
                  {value === type.value && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {type.description}
                </p>
                
                {/* المميزات */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {type.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-md"
                    >
                      <Check className="h-3 w-3 text-primary" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// تصدير النوع
export type { AccountType };
