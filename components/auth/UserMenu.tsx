'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from './AuthProvider'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, LogOut, User, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  credits?: number
}

export function UserMenu({ credits = 0 }: UserMenuProps) {
  const t = useTranslations('nav')
  const tCredits = useTranslations('credits')
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-tertiary">
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || 'User'}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-4 h-4 text-text-muted" />
            </div>
          )}
        </div>

        {/* Credits */}
        <div className="hidden sm:flex items-center gap-1 text-sm">
          <Coins className="w-4 h-4 text-warning" />
          <span className="text-text-primary font-medium">{credits}</span>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-muted transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl bg-bg-secondary border border-white/10 shadow-xl overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <p className="text-sm font-medium text-text-primary truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user.email}
              </p>
            </div>

            {/* Credits (Mobile) */}
            <div className="sm:hidden p-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-sm text-text-secondary">{tCredits('balance')}</span>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-warning" />
                <span className="font-medium">{credits}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" />
                {t('dashboard')}
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false)
                  signOut()
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
