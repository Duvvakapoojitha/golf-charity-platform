import { useState } from 'react'
import { mockActivate, cancelSubscription } from '../../api/subscriptionApi'
import { formatDate, formatCurrency, extractError } from '../../utils/helpers'
import { PLANS } from '../../utils/constants'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Zap, Calendar } from 'lucide-react'

export default function SubscriptionCard({ subscription, active, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('MONTHLY')

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      await mockActivate({ plan: selectedPlan })
      toast.success('Subscription activated!')
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription?')) return
    setLoading(true)
    try {
      await cancelSubscription()
      toast.success('Subscription cancelled')
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  if (active && subscription) {
    return (
      <div className="card border-primary-500/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={18} className="text-primary-400" />
              <span className="font-semibold text-white">Active Subscription</span>
            </div>
            <p className="text-gray-400 text-sm">{subscription.plan} plan — {formatCurrency(subscription.amount)}</p>
          </div>
          <span className="badge-active">Active</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Started</p>
            <p className="text-sm text-white">{formatDate(subscription.startDate)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12} /> Renews</p>
            <p className="text-sm text-white">{formatDate(subscription.renewalDate)}</p>
          </div>
        </div>
        <button onClick={handleCancel} disabled={loading} className="text-sm text-red-400 hover:text-red-300 transition-colors">
          Cancel subscription
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <XCircle size={18} className="text-gray-500" />
        <span className="font-semibold text-white">No Active Subscription</span>
      </div>
      <p className="text-gray-400 text-sm mb-6">Subscribe to participate in monthly draws and win prizes.</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {Object.entries(PLANS).map(([key, plan]) => (
          <button
            key={key}
            onClick={() => setSelectedPlan(key)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedPlan === key ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <p className="font-semibold text-white">{plan.label}</p>
            <p className="text-2xl font-bold text-primary-400">${plan.price}</p>
            <p className="text-xs text-gray-500">{plan.period}</p>
            {plan.savings && <span className="text-xs text-accent-400">{plan.savings}</span>}
          </button>
        ))}
      </div>

      <button onClick={handleSubscribe} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        <Zap size={16} />
        {loading ? 'Activating...' : 'Subscribe Now'}
      </button>
    </div>
  )
}
