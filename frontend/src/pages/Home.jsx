import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { getCharities } from '../api/charityApi'
import { Trophy, Heart, Zap, Target, ArrowRight, CheckCircle, Star } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const [featuredCharities, setFeaturedCharities] = useState([])

  useEffect(() => {
    getCharities()
      .then(r => setFeaturedCharities((r.data.data || []).slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 text-primary-400 text-sm font-medium mb-8">
            <Zap size={14} />
            Monthly draws. Real prizes. Real impact.
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight">
            Play Golf.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Win Big.</span><br />
            Give Back.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Submit your golf scores, enter monthly draws, and win prizes — while supporting the charities you care about.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard" className="btn-primary flex items-center gap-2 justify-center text-lg">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary flex items-center gap-2 justify-center text-lg">
                  Start Playing <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center gap-2 justify-center text-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">How It Works</h2>
        <p className="text-gray-400 text-center mb-12">Three simple steps to play and give</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Target, title: 'Submit Scores', desc: 'Enter your golf scores (1–45) each month. We keep your latest 5 scores for the draw.', color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { icon: Trophy, title: 'Enter the Draw', desc: 'Monthly draws match your scores against 5 random numbers. Match 3, 4, or all 5 to win.', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: Heart, title: 'Support Charities', desc: 'A portion of every prize goes to your chosen charity. Minimum 10%, you choose more.', color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card text-center hover:border-gray-700 transition-colors">
              <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon size={28} className={color} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize breakdown */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Prize Distribution</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Jackpot (5 matches)', pct: '40%', color: 'from-yellow-500 to-orange-500', note: 'Rolls over if no winner' },
              { label: '4 Matches', pct: '35%', color: 'from-accent-500 to-purple-500', note: 'Split among winners' },
              { label: '3 Matches', pct: '25%', color: 'from-primary-500 to-teal-500', note: 'Split among winners' },
            ].map(({ label, pct, color, note }) => (
              <div key={label} className="card text-center">
                <div className={`text-4xl font-extrabold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-2`}>{pct}</div>
                <p className="text-white font-semibold mb-1">{label}</p>
                <p className="text-gray-500 text-sm">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities Spotlight */}
      {featuredCharities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 text-yellow-400 text-sm font-medium mb-4">
              <Star size={14} />
              Featured Charities
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Your winnings make a difference</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every prize won contributes to causes that matter. Choose your charity and play with purpose.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {featuredCharities.map((c, i) => (
              <div key={c.id} className={`card hover:border-gray-700 transition-all hover:-translate-y-1 duration-200 ${i === 1 ? 'border-yellow-500/30' : ''}`}>
                {i === 1 && (
                  <div className="flex items-center gap-1 text-yellow-400 text-xs font-medium mb-3">
                    <Star size={12} fill="currentColor" /> Spotlight
                  </div>
                )}
                {c.imageUrl && (
                  <img src={c.imageUrl} alt={c.name} className="w-full h-36 object-cover rounded-xl mb-4" />
                )}
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{c.category}</span>
                <h3 className="text-white font-semibold mt-2 mb-1">{c.name}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/charities" className="btn-secondary inline-flex items-center gap-2">
              View All Charities <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Ready to play?</h2>
        <p className="text-gray-400 mb-8 text-lg">Join thousands of players making a difference with every score.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          {['Monthly plan from $9.99', 'Cancel anytime', 'Charity contribution included'].map(f => (
            <div key={f} className="flex items-center gap-2 text-gray-300 text-sm">
              <CheckCircle size={16} className="text-primary-400" />
              {f}
            </div>
          ))}
        </div>
        {!user && (
          <Link to="/register" className="btn-primary text-lg inline-flex items-center gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
        )}
      </section>
    </div>
  )
}
