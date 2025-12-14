import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import { ClientLayout } from '@/components/layout/ClientLayout'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SubErase - AI Video Subtitle Removal',
  description: 'Remove subtitles from videos with AI-powered precision. Fast, accurate, and watermark-free.',
  keywords: ['video', 'subtitle removal', 'AI', 'video editing', 'inpainting'],
}

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-bg-primary text-text-primary min-h-screen`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
