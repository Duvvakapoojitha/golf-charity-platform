import { formatDate } from '../../utils/helpers'
import { Trash2, Shield, User } from 'lucide-react'
import UserScoreEditor from './UserScoreEditor'

export default function UserTable({ users, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Charity</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Donation %</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Joined</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
              <td className="py-3 px-4">
                <div>
                  <p className="text-white font-medium">{u.fullName}</p>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                  {/* Score editor inline */}
                  <UserScoreEditor user={u} />
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`flex items-center gap-1 w-fit text-xs px-2 py-1 rounded-full ${
                  u.role === 'ADMIN' ? 'bg-accent-500/20 text-accent-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  {u.role === 'ADMIN' ? <Shield size={10} /> : <User size={10} />}
                  {u.role}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-400 text-xs">{u.charity?.name || '—'}</td>
              <td className="py-3 px-4 text-gray-400 text-xs">{u.donationPercentage}%</td>
              <td className="py-3 px-4 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => onDelete(u.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!users.length && (
        <p className="text-gray-500 text-sm text-center py-8">No users found</p>
      )}
    </div>
  )
}
