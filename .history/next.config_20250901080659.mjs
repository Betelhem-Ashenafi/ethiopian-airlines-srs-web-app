export default {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://svdcbas02:8212/api/auth/:path*',
      },
      {
        source: '/api/reports',
        destination: 'http://svdcbas02:8212/api/reports',
      },
      {
        source: '/api/reports/api/reports/data',
        destination: 'http://svdcbas02:8212/api/reports/data',
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
