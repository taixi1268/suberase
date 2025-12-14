import { setRequestLocale } from 'next-intl/server'
import EditPageClient from './EditPageClient'

interface EditPageProps {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return <EditPageClient />
}
