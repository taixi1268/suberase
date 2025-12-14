'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui'

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5']

export function FAQ() {
  const t = useTranslations('faq')

  return (
    <section id="faq" className="section-padding">
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

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqKeys.map((key, index) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger>
                  {t(`${key}.question`)}
                </AccordionTrigger>
                <AccordionContent>
                  {t(`${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
