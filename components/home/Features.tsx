'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Zap, Target, Shield } from 'lucide-react'
import { Card } from '@/components/ui'

const features = [
  {
    key: 'fast',
    icon: Zap,
    color: 'from-yellow-400 to-orange-500',
  },
  {
    key: 'precise',
    icon: Target,
    color: 'from-primary-purple to-primary-blue',
  },
  {
    key: 'secure',
    icon: Shield,
    color: 'from-primary-cyan to-emerald-400',
  },
]

export function Features() {
  const t = useTranslations('features')

  return (
    <section id="features" className="section-padding">
      <div className="container-custom">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {t('title')}
          </h2>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card variant="glass" className="h-full hover:border-white/20 transition-all group">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-3 mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  {t(`${feature.key}.title`)}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {t(`${feature.key}.description`)}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
