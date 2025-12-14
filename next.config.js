/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 禁用严格模式以减少 hydration 问题
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

const withNextIntl = require('next-intl/plugin')('./i18n.ts');

module.exports = withNextIntl(nextConfig);
