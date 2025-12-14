'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Coins, History, Gift, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Card, Button } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'

interface UserData {
  credits: number
  canClaimDaily: boolean
}

export default function DashboardPage() {
  const t = useTranslations()
  const { user, loading: authLoading } = useAuth()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  // Fetch user credits and daily bonus status
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        // Fetch credits
        const creditsRes = await fetch('/api/credits')
        const creditsData = await creditsRes.json()

        // Fetch daily bonus status
        const dailyRes = await fetch('/api/credits/daily')
        const dailyData = await dailyRes.json()

        setUserData({
          credits: creditsData.credits ?? 0,
          canClaimDaily: dailyData.canClaim ?? false,
        })
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchUserData()
    }
  }, [user, authLoading])

  const handleClaimDaily = async () => {
    if (claiming) return

    setClaiming(true)
    try {
      const res = await fetch('/api/credits/daily', { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        setUserData(prev => prev ? {
          ...prev,
          credits: data.credits,
          canClaimDaily: false,
        } : null)
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error)
    } finally {
      setClaiming(false)
    }
  }

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container-custom text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t('auth.login')}
          </h1>
          <p className="text-text-secondary">
            Please login to view your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('nav.dashboard')}
          </h1>
          <p className="text-text-secondary mb-8">
            {user.email}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credits Card */}
            <div className="animate-fade-in">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">
                      {t('credits.balance')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Coins className="w-8 h-8 text-warning" />
                      <span className="text-4xl font-bold text-text-primary">
                        {userData?.credits ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Daily Bonus */}
                  <div className="text-right">
                    <p className="text-text-secondary text-sm mb-2">
                      {t('credits.dailyBonus')}
                    </p>
                    {userData?.canClaimDaily ? (
                      <Button onClick={handleClaimDaily} size="sm" disabled={claiming}>
                        {claiming ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Gift className="w-4 h-4 mr-2" />
                        )}
                        {t('credits.claim')}
                      </Button>
                    ) : (
                      <span className="text-success text-sm font-medium">
                        {t('credits.claimed')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Buy Credits (Coming Soon) */}
                <Button variant="secondary" className="w-full" disabled>
                  {t('credits.buyMore')} - {t('credits.comingSoon')}
                </Button>
              </Card>
            </div>

            {/* Recent Tasks - placeholder */}
            <div className="animate-fade-in">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Processing
                  </h2>
                </div>

                <p className="text-text-muted text-center py-8">
                  No processing history yet
                </p>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="animate-fade-in">
              <Card variant="glass" className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link href="/upload">
                    <Button className="w-full">Process New Video</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
