import withBundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack config (used by `next dev --turbopack`)
  turbopack: {
    resolveAlias: {
      // kokoro-js imports path/fs/promises but branches on them at runtime;
      // stub fs out so the browser fetch path is used.
      path: 'path-browserify',
      fs: './src/lib/empty-module.js',
      'fs/promises': './src/lib/empty-module.js',
    },
  },

  // Webpack config (used by `next build`)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        // In ESM, we don't use require.resolve, we use the string path
        path: 'path-browserify',
      };
    }
    return config;
  },
};

// Initialize the bundle analyzer with your config
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);
