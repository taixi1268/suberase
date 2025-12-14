import { setRequestLocale } from 'next-intl/server'
import { locales } from '@/i18n'
import DashboardPage from '@/components/dashboard/DashboardPage'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <DashboardPage />
}
