import { useState, useEffect, useCallback } from 'react'
import { getAdminUsers, deleteAdminUser, getAnalytics, getPendingWinners, getWinners } from '../api/adminApi'
import { getDraws } from '../api/drawApi'
import { getCharities } from '../api/charityApi'
import UserTable from '../components/admin/UserTable'
import DrawManager from '../components/admin/DrawManager'
import CharityManager from '../components/admin/CharityManager'
import WinnerVerification from '../components/admin/WinnerVerification'
import Loader from '../components/common/Loader'
import { formatCurrency } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Users, Trophy, Heart, DollarSign, BarChart3, Shield, CheckSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [draws, setDraws] = useState([])
  const [charities, setCharities] = useState([])
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [analyticsRes, usersRes, drawsRes, charitiesRes] = await Promise.all([
        getAnalytics(), getAdminUsers(), getDraws(), getCharities()
      ])
      setAnalytics(analyticsRes.data.data)
      setUsers(usersRes.data.data || [])
      setDraws(drawsRes.data.data || [])
      setCharities(charitiesRes.data.data || [])
    } catch (e) {
      console.error('Failed to load admin data', e)
    }
    // Load winners separately so a failure doesn't block everything
    try {
      const winnersRes = await getWinners()
      setWinners(winnersRes.data.data || [])
    } catch (e) {
      console.error('Failed to load winners', e)
      setWinners([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try {
      await deleteAdminUser(id)
      toast.success('User deleted')
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch {
      toast.error('Failed to delete user')
    }
  }

  if (loading) return <Loader />

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'draws', label: 'Draws', icon: Trophy },
    { id: 'charities', label: 'Charities', icon: Heart },
    { id: 'winners', label: 'Verification', icon: CheckSquare },
  ]

  const analyticsData = analytics ? [
    { name: 'Users', value: analytics.totalUsers },
    { name: 'Active Subs', value: analytics.activeSubscriptions },
    { name: 'Prize Pool', value: Number(analytics.prizePool) },
    { name: 'Paid Out', value: Number(analytics.totalPaidOut) },
  ] : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-accent-500/20 rounded-2xl flex items-center justify-center">
          <Shield size={22} className="text-accent-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage the platform</p>
        </div>
      </div>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Active Subs', value: analytics.activeSubscriptions, icon: DollarSign, color: 'text-primary-400', bg: 'bg-primary-500/10' },
            { label: 'Prize Pool', value: formatCurrency(analytics.prizePool), icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Paid Out', value: formatCurrency(analytics.totalPaidOut), icon: CheckSquare, color: 'text-accent-400', bg: 'bg-accent-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-gray-500 text-sm">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === id ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card animate-slide-up">
        {activeTab === 'analytics' && (
          <div>
            <h3 className="font-semibold text-white mb-6">Platform Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData}>
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#f9fafb' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analyticsData.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6', '#22c55e', '#eab308', '#8b5cf6'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {activeTab === 'users' && <UserTable users={users} onDelete={handleDeleteUser} />}
        {activeTab === 'draws' && <DrawManager draws={draws} onRefresh={loadAll} />}
        {activeTab === 'charities' && <CharityManager charities={charities} onRefresh={loadAll} />}
        {activeTab === 'winners' && <WinnerVerification winners={winners} onRefresh={loadAll} />}
      </div>
    </div>
  )
}
