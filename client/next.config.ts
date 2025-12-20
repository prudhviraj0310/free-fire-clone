import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
