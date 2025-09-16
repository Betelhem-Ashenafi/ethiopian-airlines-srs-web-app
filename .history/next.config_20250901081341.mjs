export default {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://svdcbas02:8212/api/auth/:path*',
      },
  // Only /api/reports/api/reports/data rewrite is used for reports
      {
        source: '/api/reports/api/reports/data',
        destination: 'http://svdcbas02:8212/api/reports/GetAllReports',
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
