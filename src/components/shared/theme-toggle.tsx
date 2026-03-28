"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

// Empty subscription for client-only rendering
const emptySubscribe = () => () => {};

// Hook to check if we're on the client
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Theme Toggle Props
interface ThemeToggleProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show label */
  showLabel?: boolean;
  /** Custom class name */
  className?: string;
  /** Button variant */
  variant?: "ghost" | "outline" | "default";
}

// Size mappings
const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

const variantClasses = {
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
};

/**
 * Theme Toggle Component
 *
 * A beautiful theme toggle button with RTL support and smooth animations.
 * Supports light, dark, and system themes.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * <ThemeToggle showLabel size="lg" />
 * ```
 */
export function ThemeToggle({
  size = "md",
  showLabel = false,
  className,
  variant = "ghost",
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        disabled
      >
        <div className="h-5 w-5 animate-pulse bg-muted rounded-full" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme(isDark ? "light" : "dark");
    } else {
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-all duration-200",
        sizeClasses[size],
        variantClasses[variant],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "active:scale-95",
        className
      )}
      aria-label={isDark ? "تبديل إلى الوضع الفاتح" : "تبديل إلى الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      <span className="relative">
        {/* Sun Icon */}
        <Sun
          size={iconSizes[size]}
          className={cn(
            "absolute transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0"
          )}
        />
        {/* Moon Icon */}
        <Moon
          size={iconSizes[size]}
          className={cn(
            "transition-all duration-300",
            isDark
              ? "-rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </span>
      {showLabel && (
        <span className="ms-2 text-sm font-medium">
          {isDark ? "فاتح" : "داكن"}
        </span>
      )}
    </button>
  );
}

/**
 * Theme Toggle with Dropdown
 *
 * Shows a dropdown with all theme options including system preference.
 *
 * @example
 * ```tsx
 * <ThemeToggleDropdown />
 * ```
 */
export function ThemeToggleDropdown({
  size = "md",
  className,
}: Omit<ThemeToggleProps, "showLabel" | "variant">) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isClient = useIsClient();
  const [isOpen, setIsOpen] = useState(false);

  if (!isClient) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-muted",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  const options = [
    { value: "light", label: "فاتح", icon: Sun },
    { value: "dark", label: "داكن", icon: Moon },
    { value: "system", label: "النظام", icon: Monitor },
  ] as const;

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          sizeClasses[size],
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        aria-label="تغيير السمة"
      >
        {resolvedTheme === "dark" ? (
          <Moon size={iconSizes[size]} />
        ) : (
          <Sun size={iconSizes[size]} />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 start-0 z-50 min-w-[140px] rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    theme === option.value && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon size={16} />
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <span className="ms-auto text-primary">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeToggle;
