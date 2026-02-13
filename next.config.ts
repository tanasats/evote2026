import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export', //เพื่อสร้างโฟลเดอร์ out
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
