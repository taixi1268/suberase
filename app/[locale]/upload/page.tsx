import { setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n'
import UploadPage from '@/components/upload/UploadPage'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <UploadPage />
}
