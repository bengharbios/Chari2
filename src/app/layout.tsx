import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { RTLProvider } from "@/components/shared";
import { AuthProvider } from "@/contexts/auth-context";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "سوق - منصة التجارة الإلكترونية",
    template: "%s | سوق",
  },
  description: "منصة تجارة إلكترونية متكاملة بمستوى عالمي. تسوق أفضل المنتجات بأفضل الأسعار مع توصيل سريع وآمن.",
  keywords: ["تجارة إلكترونية", "تسوق أونلاين", "عروض", "منتجات", "سوق", "ecommerce", "shopping"],
  authors: [{ name: "فريق سوق" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "سوق - منصة التجارة الإلكترونية",
    description: "منصة تجارة إلكترونية متكاملة بمستوى عالمي",
    type: "website",
    locale: "ar_SA",
    siteName: "سوق",
  },
  twitter: {
    card: "summary_large_image",
    title: "سوق - منصة التجارة الإلكترونية",
    description: "منصة تجارة إلكترونية متكاملة بمستوى عالمي",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00A651" },
    { media: "(prefers-color-scheme: dark)", color: "#00C853" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} font-cairo antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <RTLProvider>
              {children}
              <Toaster />
            </RTLProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
