import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 在建置時跳過 TypeScript 類型檢查（僅用於快速建置，不建議長期使用）
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
