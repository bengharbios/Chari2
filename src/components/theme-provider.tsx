/**
 * Theme Provider Component
 * Wraps next-themes ThemeProvider with application-specific defaults
 * Supports Light/Dark mode with localStorage persistence
 */

'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';

export interface ThemeProviderCustomProps extends ThemeProviderProps {
  /** Default theme to use */
  defaultTheme?: 'light' | 'dark' | 'system';
  /** Enable system preference detection */
  enableSystem?: boolean;
  /** Disable CSS transitions during theme change */
  disableTransitionOnChange?: boolean;
  /** Storage key for localStorage */
  storageKey?: string;
  /** HTML attribute to apply theme class */
  attribute?: 'class' | 'data-theme' | 'data-mode';
}

/**
 * Theme Provider
 * 
 * Provides theme context to the application with RTL support.
 * Automatically stores theme preference in localStorage.
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = 'souq-theme',
  attribute = 'class',
  ...props
}: ThemeProviderCustomProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from 'next-themes';

export default ThemeProvider;
