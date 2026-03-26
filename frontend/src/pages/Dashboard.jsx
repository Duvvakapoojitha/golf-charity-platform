import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getScores } from '../api/scoreApi'
import { getSubscriptionStatus } from '../api/subscriptionApi'
import ScoreForm from '../components/dashboard/ScoreForm'
import ScoreList from '../components/dashboard/ScoreList'
import SubscriptionCard from '../components/dashboard/SubscriptionCard'
import CharitySelector from '../components/dashboard/CharitySelector'
import WinningsCard from '../components/dashboard/WinningsCard'
import ParticipationSummary from '../components/dashboard/ParticipationSummary'
import Loader from '../components/common/Loader'
import { getInitials } from '../utils/helpers'
import { Target, Trophy, Heart, CreditCard, BarChart2 } from 'lucide-react'

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [scores, setScores] = useState([])
  const [subData, setSubData] = useState({ active: false, subscription: null })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('scores')

  const loadData = useCallback(async () => {
    try {
      const [scoresRes, subRes] = await Promise.all([getScores(), getSubscriptionStatus()])
      setScores(scoresRes.data.data || [])
      setSubData(subRes.data.data || { active: false })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <Loader />

  const tabs = [
    { id: 'scores', label: 'Scores', icon: Target },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'charity', label: 'Charity', icon: Heart },
    { id: 'participation', label: 'Summary', icon: BarChart2 },
    { id: 'winnings', label: 'Winnings', icon: Trophy },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center">
          <span className="text-primary-400 font-bold text-xl">{getInitials(user?.fullName)}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Hey, {user?.fullName?.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={subData.active ? 'badge-active' : 'badge-inactive'}>
              {subData.active ? 'Subscribed' : 'Not subscribed'}
            </span>
            <span className="text-gray-500 text-sm">{scores.length}/5 scores</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'scores' && (
        <div className="space-y-6 animate-slide-up">
          {!subData.active && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
              Subscribe to participate in draws. Your scores are saved but won't be entered until you subscribe.
            </div>
          )}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Add Score</h2>
            <ScoreForm onSuccess={loadData} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-white mb-4">Your Scores</h2>
            <ScoreList scores={scores} onRefresh={loadData} />
          </div>
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="animate-slide-up">
          <SubscriptionCard
            subscription={subData.subscription && typeof subData.subscription === 'object' && subData.subscription.id ? subData.subscription : null}
            active={subData.active}
            onRefresh={loadData}
          />
        </div>
      )}

      {activeTab === 'charity' && (
        <div className="animate-slide-up">
          <CharitySelector user={user} onRefresh={refreshUser} />
        </div>
      )}

      {activeTab === 'participation' && (
        <div className="animate-slide-up">
          <ParticipationSummary />
        </div>
      )}

      {activeTab === 'winnings' && (
        <div className="animate-slide-up">
          <WinningsCard />
        </div>
      )}
    </div>
  )
}
