import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❌ don’t fail builds on lint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❌ don’t fail builds on type errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
