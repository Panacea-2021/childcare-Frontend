import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  // Pin tracing to this app root (avoids scanning parent Desktop lockfiles)
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: ['@react-pdf/renderer', 'pdfjs-dist'],
  // Tree-shake heavy icon/motion barrels for faster compiles & smaller client JS
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
