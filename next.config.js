/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
    optimizeCss: true,
    scrollRestoration: true,
  },
  output: 'standalone',
  env: {
    HTTP_PROXY: '',
    HTTPS_PROXY: '',
    http_proxy: '',
    https_proxy: '',
    NO_PROXY: '*',
  },
  images: {
    domains: ['fonts.googleapis.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 