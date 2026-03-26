import { useState } from 'react'
import { deleteScore } from '../../api/scoreApi'
import { formatDate } from '../../utils/helpers'
import ScoreForm from './ScoreForm'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Target } from 'lucide-react'

export default function ScoreList({ scores, onRefresh }) {
  const [editing, setEditing] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('Delete this score?')) return
    try {
      await deleteScore(id)
      toast.success('Score deleted')
      onRefresh()
    } catch {
      toast.error('Failed to delete score')
    }
  }

  if (!scores?.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        <Target size={40} className="mx-auto mb-3 opacity-30" />
        <p>No scores yet. Add your first score above.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {scores.map((s, i) => (
        <div key={s.id}>
          {editing?.id === s.id ? (
            <div className="card">
              <ScoreForm
                editScore={s}
                onSuccess={() => { setEditing(null); onRefresh() }}
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-primary-400 font-bold">{s.score}</span>
                </div>
                <div>
                  <p className="text-white font-medium">Score: {s.score}</p>
                  <p className="text-gray-500 text-sm">{formatDate(s.scoreDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {i === 0 && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full mr-2">Latest</span>}
                <button onClick={() => setEditing(s)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-gray-600 text-center pt-2">Showing latest {scores.length}/5 scores</p>
    </div>
  )
}
