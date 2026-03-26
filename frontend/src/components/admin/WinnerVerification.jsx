import { updateWinnerStatus } from '../../api/adminApi'
import { formatCurrency, formatDate, extractError } from '../../utils/helpers'
import { MATCH_LABELS, PAYMENT_STATUS_COLORS } from '../../utils/constants'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, DollarSign, ExternalLink } from 'lucide-react'

export default function WinnerVerification({ winners, onRefresh }) {
  const handleStatus = async (id, status) => {
    const notes = status === 'APPROVED' ? '' : prompt('Rejection reason (optional):') || ''
    try {
      await updateWinnerStatus(id, { status, notes })
      toast.success(`Winner ${status.toLowerCase()}`)
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  if (!winners.length) {
    return <p className="text-gray-500 text-sm text-center py-6">No pending verifications</p>
  }

  return (
    <div className="space-y-3">
      {winners.map(w => {
        const matchInfo = MATCH_LABELS[w.matchCount] || {}
        return (
          <div key={w.id} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${matchInfo.bg} ${matchInfo.color}`}>
                    {matchInfo.label || `${w.matchCount} Match`}
                  </span>
                  <span className={PAYMENT_STATUS_COLORS[w.paymentStatus]}>{w.paymentStatus}</span>
                </div>
                <p className="text-white font-semibold">{formatCurrency(w.prizeAmount)}</p>
                <p className="text-gray-400 text-sm">{w.user?.fullName} · {w.user?.email}</p>
                <p className="text-gray-500 text-xs">{formatDate(w.createdAt)}</p>
              </div>
              {w.proofUrl && (
                <a href={w.proofUrl} target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300">
                  <ExternalLink size={12} /> View Proof
                </a>
              )}
            </div>
            {w.paymentStatus === 'PENDING' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatus(w.id, 'APPROVED')}
                  className="flex items-center gap-1 text-xs bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 px-3 py-2 rounded-lg transition-colors"
                >
                  <CheckCircle size={12} /> Approve
                </button>
                <button
                  onClick={() => handleStatus(w.id, 'PAID')}
                  className="flex items-center gap-1 text-xs bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 px-3 py-2 rounded-lg transition-colors"
                >
                  <DollarSign size={12} /> Mark Paid
                </button>
              </div>
            )}
            {w.adminNotes && <p className="text-xs text-gray-500 mt-2">Note: {w.adminNotes}</p>}
          </div>
        )
      })}
    </div>
  )
}
