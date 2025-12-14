'use client'

import dynamic from 'next/dynamic'

const Hero = dynamic(() => import('@/components/home/Hero').then(mod => ({ default: mod.Hero })), { ssr: false })
const Features = dynamic(() => import('@/components/home/Features').then(mod => ({ default: mod.Features })), { ssr: false })
const HowItWorks = dynamic(() => import('@/components/home/HowItWorks').then(mod => ({ default: mod.HowItWorks })), { ssr: false })
const FAQ = dynamic(() => import('@/components/home/FAQ').then(mod => ({ default: mod.FAQ })), { ssr: false })

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
    </>
  )
}
