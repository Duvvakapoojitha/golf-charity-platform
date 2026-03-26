import { useState } from 'react'
import { createDraw, simulateDraw, publishDraw } from '../../api/drawApi'
import { formatDate, formatCurrency, extractError } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Play, Send, Plus, RefreshCw } from 'lucide-react'

export default function DrawManager({ draws, onRefresh }) {
  const [creating, setCreating] = useState(false)
  const [drawType, setDrawType] = useState('RANDOM')
  const [loading, setLoading] = useState(null)

  const handleCreate = async () => {
    setLoading('create')
    try {
      await createDraw({ drawType })
      toast.success('Draw created')
      setCreating(false)
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(null)
    }
  }

  const handleSimulate = async (id) => {
    setLoading(id + '_sim')
    try {
      await simulateDraw(id)
      toast.success('Draw simulated')
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(null)
    }
  }

  const handlePublish = async (id, isRepublish = false) => {
    const msg = isRepublish
      ? 'Re-run matching with current scores and republish?'
      : 'Publish this draw? This will notify winners.'
    if (!confirm(msg)) return
    setLoading(id + '_pub')
    try {
      await publishDraw(id)
      toast.success(isRepublish ? 'Draw re-published with updated winners' : 'Draw published')
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(null)
    }
  }

  const statusColor = { PENDING: 'badge-pending', SIMULATED: 'badge-inactive', PUBLISHED: 'badge-active' }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Draw Management</h3>
        <button onClick={() => setCreating(!creating)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={15} /> New Draw
        </button>
      </div>

      {creating && (
        <div className="card mb-4">
          <p className="text-sm font-medium text-white mb-3">Configure Draw</p>
          <div className="flex gap-3 mb-4">
            {['RANDOM', 'ALGORITHM'].map(t => (
              <button
                key={t}
                onClick={() => setDrawType(t)}
                className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                  drawType === t ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-gray-700 text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={handleCreate} disabled={loading === 'create'} className="btn-primary w-full">
            {loading === 'create' ? 'Creating...' : 'Create Draw'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {draws.map(d => (
          <div key={d.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={statusColor[d.status]}>{d.status}</span>
                <span className="text-xs text-gray-500">{d.drawType}</span>
              </div>
              <p className="text-white text-sm font-medium">Numbers: [{d.numbers?.join(', ')}]</p>
              <p className="text-gray-500 text-xs">{formatDate(d.drawDate)} · Pool: {formatCurrency(d.totalPrizePool)}</p>
            </div>
            <div className="flex gap-2">
              {d.status === 'PENDING' && (
                <button
                  onClick={() => handleSimulate(d.id)}
                  disabled={loading === d.id + '_sim'}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Simulate"
                >
                  <Play size={15} />
                </button>
              )}
              {(d.status === 'PENDING' || d.status === 'SIMULATED') && (
                <button
                  onClick={() => handlePublish(d.id)}
                  disabled={loading === d.id + '_pub'}
                  className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                  title="Publish"
                >
                  <Send size={15} />
                </button>
              )}
              {d.status === 'PUBLISHED' && (
                <button
                  onClick={() => handlePublish(d.id, true)}
                  disabled={loading === d.id + '_pub'}
                  className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                  title="Re-run matching & republish"
                >
                  <RefreshCw size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        {!draws.length && <p className="text-gray-500 text-sm text-center py-6">No draws yet</p>}
      </div>
    </div>
  )
}
