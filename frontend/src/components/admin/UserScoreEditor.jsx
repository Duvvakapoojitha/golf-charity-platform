import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { formatDate, extractError } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Pencil, Trash2, Save, X, Target, ChevronDown, ChevronUp } from 'lucide-react'

export default function UserScoreEditor({ user }) {
  const [scores, setScores] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ score: '', scoreDate: '' })
  const [loading, setLoading] = useState(false)

  const loadScores = () => {
    api.get(`/admin/users/${user.id}/scores`)
      .then(r => setScores(r.data.data || []))
      .catch(() => setScores([]))
  }

  useEffect(() => {
    if (expanded) loadScores()
  }, [expanded])

  const handleEdit = (s) => {
    setEditing(s.id)
    setEditForm({ score: s.score, scoreDate: s.scoreDate })
  }

  const handleSave = async (scoreId) => {
    setLoading(true)
    try {
      await api.put(`/admin/scores/${scoreId}`, {
        score: Number(editForm.score),
        scoreDate: editForm.scoreDate
      })
      toast.success('Score updated')
      setEditing(null)
      loadScores()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (scoreId) => {
    if (!confirm('Delete this score?')) return
    try {
      await api.delete(`/admin/scores/${scoreId}`)
      toast.success('Score deleted')
      loadScores()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
      >
        <Target size={12} />
        {expanded ? 'Hide' : 'View/Edit'} Scores
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-700">
          {scores.length === 0 && (
            <p className="text-xs text-gray-600">No scores yet</p>
          )}
          {scores.map(s => (
            <div key={s.id}>
              {editing === s.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={45}
                    value={editForm.score}
                    onChange={e => setEditForm({ ...editForm, score: e.target.value })}
                    className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={editForm.scoreDate}
                    onChange={e => setEditForm({ ...editForm, scoreDate: e.target.value })}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-xs text-white"
                  />
                  <button
                    onClick={() => handleSave(s.id)}
                    disabled={loading}
                    className="p-1 text-primary-400 hover:text-primary-300"
                  >
                    <Save size={13} />
                  </button>
                  <button onClick={() => setEditing(null)} className="p-1 text-gray-500 hover:text-white">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    <span className="text-white font-medium">{s.score}</span>
                    <span className="text-gray-500 ml-2">{formatDate(s.scoreDate)}</span>
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(s)} className="p-1 text-gray-500 hover:text-white">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-500 hover:text-red-400">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
