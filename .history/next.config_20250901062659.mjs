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
