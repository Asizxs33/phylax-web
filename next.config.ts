import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone-сборка нужна для лёгкого Docker-образа (docker-compose.yml)
  output: "standalone",
};

export default nextConfig;
