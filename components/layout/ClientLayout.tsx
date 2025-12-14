'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { AuthProvider } from '@/components/auth/AuthProvider'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 避免 hydration 不匹配，等待客户端挂载后再渲染
  if (!mounted) {
    return (
      <>
        <div className="h-16" /> {/* Header 占位 */}
        <main className="min-h-screen">
          {children}
        </main>
        <div className="py-12 bg-bg-secondary" /> {/* Footer 占位 */}
      </>
    )
  }

  return (
    <AuthProvider>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </AuthProvider>
  )
}
