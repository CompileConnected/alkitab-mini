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

  // Skip linting during build — run lint separately in CI
  eslint: { ignoreDuringBuilds: true },

  // Tree-shake barrel exports for heavy icon/UI packages
  optimizePackageImports: [
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/react-fontawesome',
    '@fortawesome/fontawesome-svg-core',
    'zustand',
  ],

  // Parallelize webpack compilation
  experimental: {
    webpackBuildWorker: true,
  },

  // Local dev only — production headers are in vercel.json
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },
};

// Bundle analyzer only when explicitly requested
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);
