export const PLANS = {
  MONTHLY: { label: 'Monthly', price: 9.99, period: '/month' },
  YEARLY: { label: 'Yearly', price: 99.99, period: '/year', savings: 'Save 17%' },
}

export const MATCH_LABELS = {
  5: { label: 'Jackpot', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  4: { label: '4 Match', color: 'text-accent-400', bg: 'bg-accent-500/20' },
  3: { label: '3 Match', color: 'text-primary-400', bg: 'bg-primary-500/20' },
}

export const PAYMENT_STATUS_COLORS = {
  PENDING: 'badge-pending',
  APPROVED: 'badge-approved',
  PAID: 'badge-paid',
}
