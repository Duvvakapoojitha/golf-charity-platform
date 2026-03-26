import { useState, useEffect } from 'react'
import { getCharities } from '../../api/charityApi'
import { updateProfile } from '../../api/authApi'
import { extractError } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Heart, ChevronDown } from 'lucide-react'

export default function CharitySelector({ user, onRefresh }) {
  const [charities, setCharities] = useState([])
  const [editing, setEditing] = useState(false)
  const [charityId, setCharityId] = useState(user?.charity?.id || '')
  const [donationPct, setDonationPct] = useState(user?.donationPercentage || 10)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCharities().then(r => setCharities(r.data.data || []))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile({ charityId, donationPercentage: Number(donationPct) })
      toast.success('Charity preferences saved')
      setEditing(false)
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-red-400" />
          <span className="font-semibold text-white">Your Charity</span>
        </div>
        <button onClick={() => setEditing(!editing)} className="text-sm text-primary-400 hover:text-primary-300">
          {editing ? 'Cancel' : 'Change'}
        </button>
      </div>

      {!editing ? (
        <div>
          {user?.charity ? (
            <div className="flex items-center gap-3">
              {user.charity.imageUrl && (
                <img src={user.charity.imageUrl} alt={user.charity.name} className="w-12 h-12 rounded-xl object-cover" />
              )}
              <div>
                <p className="text-white font-medium">{user.charity.name}</p>
                <p className="text-gray-400 text-sm">{user.donationPercentage}% of winnings donated</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No charity selected</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="label">Select Charity</label>
            <div className="relative">
              <select
                value={charityId}
                onChange={e => setCharityId(e.target.value)}
                className="input appearance-none pr-10"
              >
                <option value="">Choose a charity...</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">Donation % (min 10%)</label>
            <input
              type="number"
              min={10}
              max={100}
              value={donationPct}
              onChange={e => setDonationPct(e.target.value)}
              className="input"
            />
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  )
}
