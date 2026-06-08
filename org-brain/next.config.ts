import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // react-force-graph pulls in some packages that ship ESM/CJS interop quirks;
  // transpiling them keeps the dynamic (SSR-disabled) import happy.
  transpilePackages: ["react-force-graph-2d"],
};

export default nextConfig;
