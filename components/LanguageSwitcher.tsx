'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en'
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <button
      onClick={switchLocale}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === 'en' ? '中文' : 'EN'}</span>
    </button>
  )
}
