/**
 * Password Input Component
 * حقل إدخال كلمة المرور مع إظهار/إخفاء
 */

'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isStrong: boolean;
}

export function PasswordInput({
  label = 'كلمة المرور',
  value,
  onChange,
  error,
  showStrength = false,
  onStrengthChange,
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // حساب قوة كلمة المرور
  const calculateStrength = React.useCallback((password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]/.test(password)) score++;

    if (password.length < 8) feedback.push('8 أحرف على الأقل');
    if (!/[a-z]/.test(password)) feedback.push('حرف صغير');
    if (!/[A-Z]/.test(password)) feedback.push('حرف كبير');
    if (!/\d/.test(password)) feedback.push('رقم');
    if (!/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]/.test(password)) feedback.push('رمز خاص');

    return {
      score: Math.min(score, 4),
      feedback,
      isStrong: score >= 4
    };
  }, []);

  const strength = React.useMemo(() => calculateStrength(value), [calculateStrength, value]);

  // إرسال تحديث قوة كلمة المرور
  React.useEffect(() => {
    if (showStrength && onStrengthChange) {
      onStrengthChange(strength);
    }
  }, [strength, showStrength, onStrengthChange]);

  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-destructive';
      case 2:
        return 'bg-warning';
      case 3:
        return 'bg-info';
      case 4:
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'ضعيفة جداً';
      case 2:
        return 'ضعيفة';
      case 3:
        return 'متوسطة';
      case 4:
        return 'قوية';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="password" className="text-gray-700 font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="••••••••"
          dir="ltr"
          className={cn(
            'h-12 text-base ps-4 pe-12',
            error && 'border-destructive focus-visible:ring-destructive/30',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'password-error' : undefined}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 end-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </Button>
      </div>

      {/* مؤشر قوة كلمة المرور */}
      {showStrength && value && (
        <div className="space-y-2">
          {/* شريط القوة */}
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  index < strength.score
                    ? getStrengthColor(strength.score)
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
          
          {/* تسمية القوة */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              القوة: <span className={cn(
                'font-medium',
                strength.score >= 4 ? 'text-success' : strength.score <= 1 ? 'text-destructive' : 'text-warning'
              )}>
                {getStrengthLabel(strength.score)}
              </span>
            </span>
          </div>

          {/* متطلبات كلمة المرور */}
          {isFocused && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 animate-fade-in-rtl">
              <p className="text-xs font-medium text-gray-600 mb-2">متطلبات كلمة المرور:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <RequirementItem met={value.length >= 8} text="8 أحرف على الأقل" />
                <RequirementItem met={/[a-z]/.test(value)} text="حرف صغير" />
                <RequirementItem met={/[A-Z]/.test(value)} text="حرف كبير" />
                <RequirementItem met={/\d/.test(value)} text="رقم" />
                <RequirementItem met={/[@$!%*?&#^()_+\-=\[\]{}|;:'",.<>\/\\~`]/.test(value)} text="رمز خاص" />
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p id="password-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// عنصر متطلب كلمة المرور
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 text-xs transition-colors',
      met ? 'text-success' : 'text-muted-foreground'
    )}>
      {met ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      <span>{text}</span>
    </div>
  );
}

// مكون تأكيد كلمة المرور
interface ConfirmPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  password: string;
  error?: string;
}

export function ConfirmPasswordInput({
  label = 'تأكيد كلمة المرور',
  value,
  onChange,
  password,
  error,
  className,
  disabled,
  ...props
}: ConfirmPasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isMatch = value && password && value === password;
  const isMismatch = value && password && value !== password;

  return (
    <div className="space-y-2">
      <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="••••••••"
          dir="ltr"
          className={cn(
            'h-12 text-base ps-4 pe-12',
            (error || isMismatch) && 'border-destructive focus-visible:ring-destructive/30',
            isMatch && 'border-success focus-visible:ring-success/30',
            className
          )}
          aria-invalid={!!error || isMismatch}
          aria-describedby={error ? 'confirm-password-error' : undefined}
          {...props}
        />
        <div className="absolute inset-y-0 end-0 flex items-center gap-1 px-1">
          {isMatch && (
            <Check className="h-4 w-4 text-success" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </div>
      {error && (
        <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {isMatch && (
        <p className="text-sm text-success flex items-center gap-1">
          <Check className="h-3.5 w-3.5" />
          كلمتا المرور متطابقتان
        </p>
      )}
    </div>
  );
}
