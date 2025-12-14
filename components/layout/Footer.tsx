import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Sparkles, Github, Twitter } from 'lucide-react'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="border-t border-white/5 bg-bg-secondary/50">
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-purple to-primary-cyan flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary">SubErase</span>
            </Link>
            <p className="text-sm text-text-muted">{t('description')}</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-text-muted">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
