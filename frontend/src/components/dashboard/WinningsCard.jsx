import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { MATCH_LABELS, PAYMENT_STATUS_COLORS } from '../../utils/constants'
import { Trophy, Upload, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WinningsCard() {
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(null)
  const fileInputRef = useRef(null)
  const [activeWinnerId, setActiveWinnerId] = useState(null)

  const loadWinnings = () => {
    api.get('/winners/my')
      .then(r => setWinnings(r.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadWinnings() }, [])

  // File upload handler
  const handleFileUpload = async (winnerId, file) => {
    if (!file) return
    setUploading(winnerId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/winners/${winnerId}/proof/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Proof uploaded successfully')
      loadWinnings()
    } catch {
      // Fallback to URL input if file upload fails
      handleUrlUpload(winnerId)
    } finally {
      setUploading(null)
      setActiveWinnerId(null)
    }
  }

  // URL fallback handler
  const handleUrlUpload = async (winnerId) => {
    const url = prompt('Enter proof image URL:')
    if (!url) return
    setUploading(winnerId)
    try {
      await api.post(`/winners/${winnerId}/proof`, { proofUrl: url })
      toast.success('Proof submitted')
      loadWinnings()
    } catch {
      toast.error('Failed to upload proof')
    } finally {
      setUploading(null)
    }
  }

  if (loading) return null

  if (!winnings.length) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-yellow-400" />
          <span className="font-semibold text-white">Winnings</span>
        </div>
        <p className="text-gray-500 text-sm text-center py-4">No winnings yet. Keep playing!</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-yellow-400" />
        <span className="font-semibold text-white">Winnings</span>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => {
          if (activeWinnerId && e.target.files[0]) {
            handleFileUpload(activeWinnerId, e.target.files[0])
          }
        }}
      />

      <div className="space-y-3">
        {winnings.map(w => {
          const matchInfo = MATCH_LABELS[w.matchCount] || {}
          const hasDonation = w.charityDonation && Number(w.charityDonation) > 0

          return (
            <div key={w.id} className="p-4 bg-gray-800 rounded-xl">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${matchInfo.bg} ${matchInfo.color}`}>
                      {matchInfo.label || `${w.matchCount} Match`}
                    </span>
                    <span className={PAYMENT_STATUS_COLORS[w.paymentStatus]}>{w.paymentStatus}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{formatCurrency(w.prizeAmount)}</p>

                  {/* Show donation breakdown when approved/paid */}
                  {hasDonation && (
                    <div className="mt-1 space-y-0.5">
                      <p className="text-xs text-gray-400">
                        Net prize: <span className="text-primary-400 font-medium">{formatCurrency(w.netPrize)}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Charity donation: <span className="text-red-400 font-medium">{formatCurrency(w.charityDonation)}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mt-1">{formatDate(w.createdAt)}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {w.proofUrl && (
                    <a href={w.proofUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                      <ExternalLink size={12} /> View Proof
                    </a>
                  )}
                </div>
              </div>

              {/* Upload proof section */}
              {w.paymentStatus === 'PENDING' && !w.proofUrl && (
                <div className="flex gap-2 mt-3">
                  {/* File upload button */}
                  <button
                    onClick={() => {
                      setActiveWinnerId(w.id)
                      fileInputRef.current?.click()
                    }}
                    disabled={uploading === w.id}
                    className="flex items-center gap-1 text-xs bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 px-3 py-2 rounded-lg transition-colors"
                  >
                    {uploading === w.id
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Upload size={12} />
                    }
                    Upload File
                  </button>

                  {/* URL fallback */}
                  <button
                    onClick={() => handleUrlUpload(w.id)}
                    disabled={uploading === w.id}
                    className="flex items-center gap-1 text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    Use URL
                  </button>
                </div>
              )}

              {w.adminNotes && (
                <p className="text-xs text-gray-500 mt-2 italic">Admin note: {w.adminNotes}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
