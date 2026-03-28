/**
 * Store Dashboard Layout
 * Protected route for store owners with RTL sidebar and header
 */

'use client';

import { ReactNode } from 'react';
import { StoreSidebar, StoreHeader } from '@/components/store';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface StoreLayoutProps {
  children: ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SidebarProvider defaultOpen={true}>
        <StoreSidebar />
        <SidebarInset className="flex flex-col">
          <StoreHeader storeName="متجر الأناقة" />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
