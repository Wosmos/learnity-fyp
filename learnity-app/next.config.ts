import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  turbopack: {}, // Enable Turbopack for Next.js 16
};

export default nextConfig;
