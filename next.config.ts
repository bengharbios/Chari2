import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // السماح بجميع المضيفين للنشر
  allowedDevOrigins: ['localhost', '.hostingersite.com', '.hstgr.io'],
  // إعدادات الإنتاج
  productionBrowserSourceMaps: false,
  // تحسين الأداء
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
