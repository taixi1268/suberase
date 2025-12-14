'use client'

import { useTranslations } from 'next-intl'
import { Coins, History, Gift, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card, Button } from '@/components/ui'

export default function DashboardPage() {
  const t = useTranslations()

  // Demo data
  const user = {
    name: 'Demo User',
    email: 'demo@example.com',
    credits: 90,
    canClaimDaily: true,
  }

  const recentTasks = [
    { id: '1', name: 'video1.mp4', status: 'completed', date: '2024-01-15' },
    { id: '2', name: 'video2.mp4', status: 'completed', date: '2024-01-14' },
    { id: '3', name: 'video3.mp4', status: 'failed', date: '2024-01-13' },
  ]

  const handleClaimDaily = () => {
    alert('Daily bonus claimed! +10 credits (Demo)')
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-custom">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-text-primary mb-8">
            {t('nav.dashboard')}
          </h1>
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
                        {user.credits}
                      </span>
                    </div>
                  </div>

                  {/* Daily Bonus */}
                  <div className="text-right">
                    <p className="text-text-secondary text-sm mb-2">
                      {t('credits.dailyBonus')}
                    </p>
                    {user.canClaimDaily ? (
                      <Button onClick={handleClaimDaily} size="sm">
                        <Gift className="w-4 h-4 mr-2" />
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

            {/* Recent Tasks */}
            <div className="animate-fade-in">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Processing
                  </h2>
                </div>

                {recentTasks.length === 0 ? (
                  <p className="text-text-muted text-center py-8">
                    No processing history yet
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {recentTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {task.name}
                          </p>
                          <p className="text-xs text-text-muted">{task.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              task.status === 'completed'
                                ? 'bg-success/20 text-success'
                                : 'bg-error/20 text-error'
                            }`}
                          >
                            {task.status}
                          </span>
                          <ChevronRight className="w-4 h-4 text-text-muted" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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

            {/* Stats */}
            <div className="animate-fade-in">
              <Card variant="glass" className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Your Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Videos Processed</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Credits Used</span>
                    <span className="font-medium">30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Member Since</span>
                    <span className="font-medium">Jan 2024</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
