import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // 匹配所有路径，排除静态文件和API路由
  matcher: [
    '/',
    '/(en|zh)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
