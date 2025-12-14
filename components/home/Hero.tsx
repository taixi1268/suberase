'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui'

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-cyan/20 rounded-full blur-3xl" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="container-custom pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-text-secondary">{t('titleHighlight')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            <span className="gradient-text">{t('title')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/upload">
              <Button size="lg" className="group">
                {t('cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="secondary" size="lg">
              <Play className="mr-2 w-5 h-5" />
              {t('demo')}
            </Button>
          </motion.div>

          {/* Demo Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-bg-secondary/50 backdrop-blur-sm aspect-video max-w-3xl mx-auto">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-purple via-primary-blue to-primary-cyan opacity-20 blur-xl" />

              {/* Video Placeholder */}
              <div className="relative flex items-center justify-center h-full bg-bg-secondary">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors group">
                    <Play className="w-8 h-8 text-text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-text-muted text-sm">Demo Video</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
