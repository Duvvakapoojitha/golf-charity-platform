import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { formatCurrency } from '../../utils/helpers'
import { Trophy, Target, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function ParticipationSummary() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/me/participation')
      .then(r => setSummary(r.data.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !summary) return null

  const stats = [
    {
      icon: Calendar,
      label: 'Draws Entered',
      value: summary.totalDrawsEntered,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Trophy,
      label: 'Total Wins',
      value: summary.totalWins,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Total Won',
      value: formatCurrency(summary.totalWon),
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
    },
    {
      icon: Clock,
      label: 'Pending Payments',
      value: summary.pendingPayments,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <Target size={18} className="text-primary-400" />
        <span className="font-semibold text-white">Participation Summary</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-gray-800/60 rounded-xl p-4">
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Score progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Scores submitted</span>
          <span className="text-sm text-white font-medium">{summary.currentScoreCount}/5</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(summary.currentScoreCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Subscription status */}
      <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
        summary.hasActiveSubscription
          ? 'bg-primary-500/10 text-primary-400'
          : 'bg-gray-800 text-gray-500'
      }`}>
        <CheckCircle size={15} />
        {summary.hasActiveSubscription
          ? 'Active — you are entered in the next draw'
          : 'Subscribe to enter the next draw'}
      </div>

      {/* Next draw info */}
      <p className="text-xs text-gray-600 mt-3 text-center">{summary.nextDrawInfo}</p>
    </div>
  )
}
