/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // appDir: true,
    cpus: 2, // Limit to 4 workers to prevent OOM on build
    workerThreads: false,
  },
   allowedDevOrigins: ['192.168.0.223'],
  productionBrowserSourceMaps: false, // Disable source maps to save memory
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
      mocha: { browser: 'mocha/browser-entry.js' },
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "tazama.co.zm" },
    ],
  },
  // Mark server-only packages to prevent client bundling
  serverExternalPackages: [
    'tedious',
    'mssql',
    '@prisma/adapter-mssql',
    '@prisma/client',
    'bcryptjs',
    'bcrypt',
  ],
  // Extend Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tls: false,
        net: false,
        dns: false,
        dgram: false,
        fs: false,
        request: false,
        child_process: false,
        worker_threads: false,
      };
    }
    return config;
  },
  output: "standalone",
};

export default nextConfig;
