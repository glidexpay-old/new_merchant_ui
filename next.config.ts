/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
    domains: ['via.placeholder.com'],
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://dashboard.glidexpay.com' : '',
  // Disable features that don't work with static export
  experimental: {
    // Disable partial prerendering for static export
    ppr: false,
  },
};

module.exports = nextConfig;
