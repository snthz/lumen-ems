import type { NextConfig } from "next";

// Signal to lib/db/postgres.ts that we're building (skip DB connections)
if (process.env.NODE_ENV === "production" || process.argv.includes("build")) {
  process.env.__NEXT_BUILD = "1";
}

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  serverExternalPackages: ['@amcharts/amcharts4'],
};

export default nextConfig;
