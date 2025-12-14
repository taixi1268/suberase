'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Upload, MousePointer2, Cpu, Download } from 'lucide-react'

const steps = [
  { key: 'step1', icon: Upload },
  { key: 'step2', icon: MousePointer2 },
  { key: 'step3', icon: Cpu },
  { key: 'step4', icon: Download },
]

export function HowItWorks() {
  const t = useTranslations('howItWorks')

  return (
    <section id="how-it-works" className="section-padding bg-bg-secondary/30">
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

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-purple via-primary-blue to-primary-cyan" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="relative text-center"
              >
                {/* Step Number & Icon */}
                <div className="relative z-10 inline-flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-purple to-primary-cyan flex items-center justify-center text-white font-bold text-lg mb-4">
                    {index + 1}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-bg-secondary border border-white/10 flex items-center justify-center mb-6">
                    <step.icon className="w-8 h-8 text-primary-blue" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="text-sm text-text-secondary max-w-xs mx-auto">
                  {t(`${step.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
