import { useState } from 'react'
import { addScore, updateScore } from '../../api/scoreApi'
import { extractError } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Plus, Save, X } from 'lucide-react'

export default function ScoreForm({ editScore, onSuccess, onCancel }) {
  const [score, setScore] = useState(editScore?.score || '')
  const [scoreDate, setScoreDate] = useState(editScore?.scoreDate || new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!score || score < 1 || score > 45) return toast.error('Score must be between 1 and 45')
    setLoading(true)
    try {
      if (editScore) {
        await updateScore(editScore.id, { score: Number(score), scoreDate })
        toast.success('Score updated')
      } else {
        await addScore({ score: Number(score), scoreDate })
        toast.success('Score added')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1">
        <label className="label">Score (1–45)</label>
        <input
          type="number"
          min={1}
          max={45}
          value={score}
          onChange={e => setScore(e.target.value)}
          className="input"
          placeholder="Enter score"
          required
        />
      </div>
      <div className="flex-1">
        <label className="label">Date</label>
        <input
          type="date"
          value={scoreDate}
          onChange={e => setScoreDate(e.target.value)}
          className="input"
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {editScore ? <Save size={16} /> : <Plus size={16} />}
          {editScore ? 'Update' : 'Add'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary p-3">
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  )
}
