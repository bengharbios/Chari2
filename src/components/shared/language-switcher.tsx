"use client";

import { useState } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRTL } from "./rtl-provider";

// Supported Languages
interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir: "rtl" | "ltr";
  flag?: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    flag: "🇸🇦",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "🇺🇸",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    dir: "ltr",
    flag: "🇫🇷",
  },
];

// Language Switcher Props
interface LanguageSwitcherProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show native name */
  showNativeName?: boolean;
  /** Show flag */
  showFlag?: boolean;
  /** Custom class name */
  className?: string;
  /** Compact mode - just show flag/icon */
  compact?: boolean;
}

// Size mappings
const sizeClasses = {
  sm: "text-sm px-2 py-1",
  md: "text-base px-3 py-2",
  lg: "text-lg px-4 py-3",
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 20,
};

/**
 * Language Switcher Component
 *
 * A dropdown component for switching between languages.
 * Automatically updates RTL direction based on selected language.
 *
 * @example
 * ```tsx
 * <LanguageSwitcher />
 * <LanguageSwitcher showNativeName compact />
 * ```
 */
export function LanguageSwitcher({
  size = "md",
  showNativeName = true,
  showFlag = true,
  className,
  compact = false,
}: LanguageSwitcherProps) {
  const { lang, setLanguage } = useRTL();
  const [isOpen, setIsOpen] = useState(false);

  // Find current language
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (language: Language) => {
    setLanguage(language.code);
    setIsOpen(false);
    
    // In a real app, you would also:
    // 1. Update i18n locale
    // 2. Persist preference to localStorage/cookie
    // 3. Fetch translations if needed
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md",
          "border border-input bg-background transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          sizeClasses[size],
          compact && "p-2"
        )}
        aria-label="تغيير اللغة"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {compact ? (
          <Globe size={iconSizes[size]} />
        ) : (
          <>
            {showFlag && (
              <span className="text-base" role="img" aria-hidden="true">
                {currentLanguage.flag}
              </span>
            )}
            {showNativeName && (
              <span className="font-medium">{currentLanguage.nativeName}</span>
            )}
            <ChevronDown
              size={iconSizes[size]}
              className={cn(
                "transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className={cn(
              "absolute top-full mt-2 z-50 min-w-[180px] rounded-lg",
              "border bg-popover p-1 shadow-lg",
              "animate-in fade-in-0 zoom-in-95 duration-200",
              // Position based on RTL
              "end-0"
            )}
            role="listbox"
            aria-label="اختر اللغة"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2",
                  "text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  lang === language.code && "bg-accent/50"
                )}
                role="option"
                aria-selected={lang === language.code}
              >
                {/* Flag */}
                {showFlag && (
                  <span className="text-base" role="img" aria-hidden="true">
                    {language.flag}
                  </span>
                )}

                {/* Language Info */}
                <div className="flex-1 text-start">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-muted-foreground">
                    {language.name}
                  </div>
                </div>

                {/* Direction Badge */}
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {language.dir.toUpperCase()}
                </span>

                {/* Check Mark */}
                {lang === language.code && (
                  <Check
                    size={16}
                    className="text-primary flex-shrink-0"
                  />
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="my-1 border-t" />

            {/* Help Text */}
            <div className="px-3 py-2 text-xs text-muted-foreground">
              تغيير اللغة سيغير اتجاه الصفحة تلقائياً
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Language Switcher Button (Simple)
 *
 * A simple button that toggles between Arabic and English.
 *
 * @example
 * ```tsx
 * <LanguageSwitcherButton />
 * ```
 */
export function LanguageSwitcherButton({
  className,
}: {
  className?: string;
}) {
  const { lang, setLanguage, isRTL } = useRTL();

  const toggleLanguage = () => {
    setLanguage(lang === "ar" ? "en" : "ar");
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={isRTL ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe size={16} />
      <span className="text-sm font-medium">
        {isRTL ? "English" : "العربية"}
      </span>
    </button>
  );
}

export { SUPPORTED_LANGUAGES };
export type { Language };
