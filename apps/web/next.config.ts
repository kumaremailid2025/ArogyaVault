import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@arogyavault/shared-types", "@arogyavault/utils"],

  /**
   * `optimizePackageImports` rewrites deep imports for listed packages so
   * that only the icons/components actually used are pulled into the
   * bundle (and into the dev compile graph). With 130+ files importing
   * from `lucide-react` alone, this is a large win on both cold-start
   * compile time and shipped JS size.
   *
   * Safe for packages that expose a barrel (`index.js`) with named
   * re-exports. See:
   * https://nextjs.org/docs/app/api-reference/next-config-js/optimizePackageImports
   */
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "recharts",
    ],
  },
};

export default nextConfig;
