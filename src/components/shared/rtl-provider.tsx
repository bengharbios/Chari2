/**
 * RTL Provider
 * Provides RTL (Right-to-Left) support for Arabic content
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';

interface RTLContextType {
  isRTL: boolean;
  direction: 'rtl' | 'ltr';
}

const RTLContext = createContext<RTLContextType>({
  isRTL: true,
  direction: 'rtl',
});

interface RTLProviderProps {
  children: ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
  // Default to RTL for Arabic content
  const value: RTLContextType = {
    isRTL: true,
    direction: 'rtl',
  };

  return (
    <RTLContext.Provider value={value}>
      {children}
    </RTLContext.Provider>
  );
}

export function useRTL() {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error('useRTL must be used within an RTLProvider');
  }
  return context;
}
