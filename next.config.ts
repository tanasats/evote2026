import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', //เพื่อสร้างโฟลเดอร์ out
  trailingSlash: true,     // แนะนำให้เปิด: จะทำให้ /login กลายเป็น /login/index.html 
  distDir: 'out',          // โฟลเดอร์ปลายทาง
  /* config options here */
  images: {
    domains: ['picsum.photos'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
  }



};

export default nextConfig;
