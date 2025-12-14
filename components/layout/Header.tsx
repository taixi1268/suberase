'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X, Sparkles, LogOut, User, Coins } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { LoginButton } from '@/components/auth/LoginButton'
import { useAuth } from '@/components/auth/AuthProvider'
import { cn } from '@/lib/utils'

export function Header() {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const { user, loading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navLinks = [
    { href: '#features', label: t('features') },
    { href: '#how-it-works', label: t('howItWorks') },
    { href: '#faq', label: t('faq') },
  ]

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <nav className="container-custom flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-purple to-primary-cyan flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary group-hover:text-primary-blue transition-colors">
              SubErase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            {loading ? (
              <div className="w-20 h-9 bg-white/10 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-purple to-primary-cyan flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-text-primary">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-bg-secondary border border-white/10 rounded-xl shadow-xl">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Coins className="w-4 h-4" />
                      {tAuth('dashboard')}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {tAuth('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLoginModal(true)}
              >
                {t('login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            'md:hidden absolute top-16 left-0 right-0 bg-bg-primary border-b border-white/5 transition-all duration-300',
            mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          )}
        >
          <div className="container-custom py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-secondary hover:text-text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <LanguageSwitcher />
              {user ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={handleSignOut}
                >
                  {tAuth('logout')}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowLoginModal(true)
                  }}
                >
                  {t('login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-bg-secondary border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">{tAuth('login')}</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LoginButton />
            <p className="mt-4 text-xs text-text-muted text-center">
              {tAuth('registerBonus')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
