// Pricing configuration for future payment integration

export const CREDIT_PACKAGES = [
  { id: 'basic', credits: 100, price: 199, currency: 'USD', label: '100 Credits' },
  { id: 'plus', credits: 500, price: 799, bonus: 50, currency: 'USD', label: '500 + 50 Bonus' },
  { id: 'pro', credits: 1000, price: 1499, bonus: 150, currency: 'USD', label: '1000 + 150 Bonus' },
] as const

export const SUBSCRIPTION_PLANS = [
  { id: 'free', name: 'Free', credits_monthly: 100, price: 0 },
  { id: 'basic', name: 'Basic', credits_monthly: 500, price: 999 },
  { id: 'pro', name: 'Pro', credits_monthly: 2000, price: 2999 },
] as const

export type CreditPackageId = (typeof CREDIT_PACKAGES)[number]['id']
export type SubscriptionPlanId = (typeof SUBSCRIPTION_PLANS)[number]['id']

export function formatPrice(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function getPackageById(id: CreditPackageId) {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === id)
}

export function getPlanById(id: SubscriptionPlanId) {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id)
}
