export default {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://172.20.97.149;/api/auth/:path*',
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
