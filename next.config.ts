import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "@libsql/client"],
  turbopack: {},
};

export default nextConfig;
