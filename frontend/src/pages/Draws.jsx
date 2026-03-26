import { useState, useEffect } from 'react'
import { getDraws, getDrawWinners } from '../api/drawApi'
import { formatDate, formatCurrency } from '../utils/helpers'
import { MATCH_LABELS } from '../utils/constants'
import Loader from '../components/common/Loader'
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react'

export default function Draws() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [winners, setWinners] = useState({})

  useEffect(() => {
    getDraws().then(r => setDraws(r.data.data || [])).finally(() => setLoading(false))
  }, [])

  const toggleDraw = async (id) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!winners[id]) {
      const res = await getDrawWinners(id)
      setWinners(prev => ({ ...prev, [id]: res.data.data || [] }))
    }
  }

  const statusColor = { PENDING: 'badge-pending', SIMULATED: 'badge-inactive', PUBLISHED: 'badge-active' }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Monthly Draws</h1>
        <p className="text-gray-400">Match your scores to win prizes</p>
      </div>

      {!draws.length ? (
        <div className="text-center py-16 text-gray-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p>No draws yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(d => (
            <div key={d.id} className="card">
              <button
                onClick={() => toggleDraw(d.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                    <Trophy size={22} className="text-yellow-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={statusColor[d.status]}>{d.status}</span>
                      <span className="text-xs text-gray-500">{d.drawType}</span>
                    </div>
                    <p className="text-white font-semibold">Draw Numbers: [{d.numbers?.join(', ')}]</p>
                    <p className="text-gray-500 text-sm">{formatDate(d.drawDate)} · Prize Pool: {formatCurrency(d.totalPrizePool)}</p>
                  </div>
                </div>
                {expanded === d.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {expanded === d.id && (
                <div className="mt-4 pt-4 border-t border-gray-800 animate-fade-in">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Jackpot (5)', amount: d.jackpotAmount },
                      { label: '4 Match', amount: d.fourMatchAmount },
                      { label: '3 Match', amount: d.threeMatchAmount },
                    ].map(({ label, amount }) => (
                      <div key={label} className="bg-gray-800 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-white font-semibold">{formatCurrency(amount)}</p>
                      </div>
                    ))}
                  </div>

                  {d.status === 'PUBLISHED' && (
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-3">Winners</p>
                      {winners[d.id]?.length ? (
                        <div className="space-y-2">
                          {winners[d.id].map(w => {
                            const matchInfo = MATCH_LABELS[w.matchCount] || {}
                            return (
                              <div key={w.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${matchInfo.bg} ${matchInfo.color}`}>
                                    {matchInfo.label}
                                  </span>
                                  <span className="text-gray-300 text-sm">{w.user?.fullName}</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{formatCurrency(w.prizeAmount)}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No winners for this draw</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
