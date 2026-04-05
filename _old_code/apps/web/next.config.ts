import type { NextConfig } from "next";

type NextConfigWithEslint = NextConfig & { eslint?: { ignoreDuringBuilds?: boolean } };

const nextConfig: NextConfigWithEslint = {
  transpilePackages: ['@agri-scan/shared'],
  reactCompiler: true,
  output: "standalone",

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
