/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    // appDir: true,
    cpus: 2, // Limit to 4 workers to prevent OOM on build
    workerThreads: false,
  },
  productionBrowserSourceMaps: false, // Disable source maps to save memory
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
      mocha: { browser: 'mocha/browser-entry.js' },
    },
    resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  images: {
    domains: ["encrypted-tbn0.gstatic.com", "tazama.co.zm"], // Only needed for external images
  },
  // Mark server-only packages to prevent client bundling
  serverComponentsExternalPackages: [
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
