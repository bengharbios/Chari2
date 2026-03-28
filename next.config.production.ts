// =============================================
// منصة تشارك - إعدادات الإنتاج
// Tasharak Platform - Production Configuration
// =============================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =============================================
  // الإخراج - Output
  // =============================================
  output: "standalone",

  // =============================================
  // الأداء - Performance
  // =============================================
  reactStrictMode: true,
  
  // تحسين الصور
  images: {
    // نطاقات الصور المسموح بها
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.s3.me-south-1.amazonaws.com",
      },
    ],
    // تنسيقات الصور المحسنة
    formats: ["image/avif", "image/webp"],
    // أحجام الصور المُحسّنة
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // =============================================
  // الأمان - Security Headers
  // =============================================
  async headers() {
    return [
      {
        // تطبيق على جميع المسارات
        source: "/:path*",
        headers: [
          // منع النقر المحفوف بالمخاطر
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // حماية من XSS
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // منع الكشف عن معلومات المُحيل
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // سياسة أمان المحتوى
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.360dialog.io https://api.twilio.com https://*.amazonaws.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // سياسة ميزات المتصفح
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=(self)",
            ].join(", "),
          },
          // HSTS
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // =============================================
  // إعادة التوجيه - Redirects
  // =============================================
  async redirects() {
    return [
      // إعادة توجيه HTTP إلى HTTPS (يتم التعامل معها عادةً على مستوى الخادم)
      // {
      //   source: "/:path*",
      //   has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
      //   destination: "https://:host/:path*",
      //   permanent: true,
      // },
    ];
  },

  // =============================================
  // إعادة الكتابة - Rewrites
  // =============================================
  async rewrites() {
    return [
      // يمكن إضافة API proxies هنا
    ];
  },

  // =============================================
  // متغيرات البيئة العامة
  // Public Environment Variables
  // =============================================
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "منصة تشارك",
  },

  // =============================================
  // تحسين الحزم - Bundle Optimization
  // =============================================
  experimental: {
    // تحسين استيراد الحزم الكبيرة
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
      "date-fns",
    ],
  },

  // =============================================
  // Webpack مخصص
  // Custom Webpack Configuration
  // =============================================
  webpack: (config, { isServer }) => {
    // تحسينات خاصة بالإنتاج
    if (!isServer) {
      // تحسين لحزم العميل
    }
    
    // التعامل مع حزم خارجية
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // =============================================
  // TypeScript
  // =============================================
  typescript: {
    // تجاهل أخطاء البناء في الإنتاج (غير مستحسن)
    // ignoreBuildErrors: false,
  },

  // =============================================
  // ESLint
  // =============================================
  eslint: {
    // تجاهل ESLint أثناء البناء (غير مستحسن)
    // ignoreDuringBuilds: true,
  },

  // =============================================
  // سجلات التشخيص
  // Logging
  // =============================================
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
