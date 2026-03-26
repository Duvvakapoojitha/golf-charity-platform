import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { PLANS } from '../utils/constants'
import { CheckCircle, Zap, ArrowRight } from 'lucide-react'

export default function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const features = [
    'Monthly draw participation',
    'Up to 5 active scores',
    'Charity contribution',
    'Winner verification',
    'Draw history access',
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-lg">Subscribe to enter monthly draws and support charities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div key={key} className={`card relative ${key === 'YEARLY' ? 'border-primary-500/50' : ''}`}>
            {key === 'YEARLY' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{plan.label}</h3>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-extrabold text-white">${plan.price}</span>
              <span className="text-gray-400 mb-1">{plan.period}</span>
            </div>
            {plan.savings && <p className="text-primary-400 text-sm mb-4">{plan.savings}</p>}
            <ul className="space-y-2 mb-6">
              {features.map(f => (
                <li key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                  <CheckCircle size={15} className="text-primary-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className={key === 'YEARLY' ? 'btn-primary w-full flex items-center justify-center gap-2' : 'btn-secondary w-full flex items-center justify-center gap-2'}
            >
              <Zap size={16} />
              {user ? 'Subscribe' : 'Get Started'}
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
