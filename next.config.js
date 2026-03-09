// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (used by `next dev --turbopack`)
  turbopack: {
    resolveAlias: {
      // kokoro-js imports path/fs/promises but branches on them at runtime;
      // stub fs out so the browser fetch path is used.
      'path':        'path-browserify',
      'fs':          './src/lib/empty-module.js',
      'fs/promises': './src/lib/empty-module.js',
    },
  },

  // Webpack config (used by `next build`)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:            false,
        path:          require.resolve('path-browserify'),
        'fs/promises': false,
      };
    }
    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);