import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 在 Netlify 上运行时需要的配置
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  
  // 处理静态资源
  images: {
    unoptimized: true, // Netlify 建议设置为 true
  },
  
  // 处理 API 路由
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;