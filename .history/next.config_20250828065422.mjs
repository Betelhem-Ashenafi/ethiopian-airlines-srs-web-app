export default {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
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
