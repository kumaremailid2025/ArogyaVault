import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@arogyavault/shared-types", "@arogyavault/utils"],
};

export default nextConfig;
