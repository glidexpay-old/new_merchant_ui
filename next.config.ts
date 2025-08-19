/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    domains: ['via.placeholder.com'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://dashboard.glidexpay.com' : '',
};

module.exports = nextConfig;
