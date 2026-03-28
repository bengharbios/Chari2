/**
 * OTP Input Component
 * حقل إدخال رمز التحقق OTP
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}

export function OTPInput({
  label = 'رمز التحقق',
  value,
  onChange,
  length = 6,
  error,
  helperText,
  disabled,
  autoFocus = true,
  onComplete,
}: OTPInputProps) {
  const handleChange = (newValue: string) => {
    // فقط أرقام
    const numericValue = newValue.replace(/\D/g, '').slice(0, length);
    onChange(numericValue);
    
    // استدعاء onComplete عند اكتمال الرمز
    if (numericValue.length === length && onComplete) {
      onComplete(numericValue);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <Label className="text-gray-700 font-medium text-center block">
          {label}
        </Label>
      )}
      
      <div className="flex justify-center" dir="ltr">
        <InputOTP
          maxLength={length}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          autoFocus={autoFocus}
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className={cn(
                  'w-12 h-14 text-xl font-bold rounded-lg border-2',
                  'transition-all duration-200',
                  'focus:border-primary focus:ring-4 focus:ring-primary/20',
                  error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-muted-foreground text-center">
          {helperText}
        </p>
      )}
    </div>
  );
}

// مكون مؤقت إعادة الإرسال
interface ResendTimerProps {
  initialTime?: number; // بالثواني
  onResend: () => void;
  isResending?: boolean;
}

export function ResendTimer({
  initialTime = 60,
  onResend,
  isResending = false,
}: ResendTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState(initialTime);
  const [canResend, setCanResend] = React.useState(false);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = () => {
    if (!canResend || isResending) return;
    setCanResend(false);
    setTimeLeft(initialTime);
    onResend();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-2">
      {canResend ? (
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className={cn(
            'text-primary font-medium hover:underline transition-all',
            isResending && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isResending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              جاري الإرسال...
            </span>
          ) : (
            'إعادة إرسال الرمز'
          )}
        </button>
      ) : (
        <p className="text-muted-foreground text-sm">
          إعادة الإرسال خلال{' '}
          <span className="font-bold text-primary" dir="ltr">
            {formatTime(timeLeft)}
          </span>
        </p>
      )}
    </div>
  );
}

// مكون عرض الرقم المرسل إليه
interface PhoneNumberDisplayProps {
  phone: string;
  onEdit?: () => void;
}

export function PhoneNumberDisplay({ phone, onEdit }: PhoneNumberDisplayProps) {
  // تنسيق الرقم للعرض
  const formatPhone = (p: string): string => {
    if (p.startsWith('05') && p.length === 10) {
      return `${p.slice(0, 4)} *** ${p.slice(7)}`;
    }
    if (p.startsWith('966')) {
      const local = p.slice(3);
      return `+966 ${local.slice(0, 2)} *** ${local.slice(5)}`;
    }
    return p;
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg">📱</span>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">تم إرسال الرمز إلى</p>
          <p className="font-medium text-gray-900" dir="ltr">
            {formatPhone(phone)}
          </p>
        </div>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-primary text-sm font-medium hover:underline"
        >
          تعديل
        </button>
      )}
    </div>
  );
}
