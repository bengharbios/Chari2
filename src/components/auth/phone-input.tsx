/**
 * Phone Input Component
 * حقل إدخال رقم الهاتف السعودي
 */

'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
}

export function PhoneInput({
  label = 'رقم الجوال',
  value,
  onChange,
  error,
  helperText,
  className,
  disabled,
  ...props
}: PhoneInputProps) {
  // تنسيق الرقم أثناء الكتابة
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // إزالة غير الأرقام
    
    // تحديد الحد الأقصى للأرقام
    if (inputValue.startsWith('966')) {
      inputValue = inputValue.slice(0, 12);
    } else if (inputValue.startsWith('0')) {
      inputValue = inputValue.slice(0, 10);
    } else {
      inputValue = inputValue.slice(0, 9);
      if (inputValue.length === 9) {
        inputValue = '0' + inputValue;
      }
    }
    
    onChange(inputValue);
  };

  // تنسيق الرقم للعرض
  const formatDisplay = (phone: string): string => {
    if (!phone) return '';
    if (phone.startsWith('966')) {
      // تحويل 9665xxxxxxxx إلى +966 5x xxx xxxx
      const localNumber = phone.slice(3);
      if (localNumber.length >= 9) {
        return `+966 ${localNumber.slice(0, 2)} ${localNumber.slice(2, 5)} ${localNumber.slice(5)}`;
      }
      return `+966 ${localNumber}`;
    }
    if (phone.startsWith('05')) {
      // تنسيق 05xxxxxxxx إلى 05xx xxx xxx
      if (phone.length >= 7) {
        return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
      }
    }
    return phone;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-gray-700 font-medium">
        {label}
      </Label>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <div className="flex items-center gap-1.5 text-gray-500">
            <span className="text-lg">🇸🇦</span>
            <span className="text-sm font-medium">+966</span>
          </div>
        </div>
        <Input
          id="phone"
          type="tel"
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder="5XX XXX XXX"
          disabled={disabled}
          dir="ltr"
          className={cn(
            'ps-20 h-12 text-base',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : helperText ? 'phone-helper' : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id="phone-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id="phone-helper" className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}

// تصدير دالة التحقق للرقم السعودي
export function validateSaudiPhone(phone: string): { isValid: boolean; error?: string } {
  const saudiPhoneRegex = /^(\+966|966|0)?5\d{8}$/;
  
  if (!phone) {
    return { isValid: false, error: 'رقم الجوال مطلوب' };
  }
  
  if (!saudiPhoneRegex.test(phone)) {
    return { isValid: false, error: 'رقم جوال غير صحيح' };
  }
  
  return { isValid: true };
}

// تصدير دالة توحيد صيغة الرقم
export function normalizePhoneNumber(phone: string): string {
  let normalized = phone.replace(/\s|-/g, '');
  if (normalized.startsWith('+966')) {
    normalized = '0' + normalized.slice(4);
  } else if (normalized.startsWith('966')) {
    normalized = '0' + normalized.slice(3);
  }
  return normalized;
}
