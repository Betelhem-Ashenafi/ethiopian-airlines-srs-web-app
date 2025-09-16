export default {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://172.20.96.42:7022/api/auth/:path*',
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
