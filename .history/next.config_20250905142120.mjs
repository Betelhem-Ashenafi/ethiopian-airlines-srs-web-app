export default {
  async rewrites() {
    return [
  // NOTE: auth API routes are handled by local Next.js API proxy handlers
  // (pages/api/auth/*.ts). Do not rewrite /api/auth/* to the backend here,
  // otherwise the local handlers won't be reachable and browser requests
  // will be forwarded directly to the backend (often causing 404/dev issues).
  // Only /api/reports/api/reports/data rewrite is used for reports
      {
        source: '/api/reports/:path*',
        destination: 'http://svdcbas02:8212/api/reports/:path*',
      },
      {
        source: '/api/severity',
        destination: 'http://svdcbas02:8212/api/severity',
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {}
  },
}
