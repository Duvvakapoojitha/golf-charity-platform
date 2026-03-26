import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/authApi'
import { getCharities } from '../api/charityApi'
import { useAuth } from '../hooks/useAuth'
import { extractError } from '../utils/helpers'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus, ChevronDown } from 'lucide-react'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', charityId: '', donationPercentage: 10 })
  const [charities, setCharities] = useState([])
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getCharities()
      .then(r => setCharities(r.data.data || []))
      .catch(() => setCharities([]))  // silently fail — charity is optional
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        donationPercentage: Number(form.donationPercentage),
      }
      // Only include charityId if one was selected
      if (form.charityId) payload.charityId = form.charityId

      const res = await registerApi(payload)
      const { token, ...userData } = res.data.data
      login(token, userData)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 mt-2">Join the community</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="John Doe" value={form.fullName}
                onChange={e => setForm({...form, fullName: e.target.value})} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-12" placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Choose a Charity (optional)</label>
              <div className="relative">
                <select className="input appearance-none pr-10" value={form.charityId}
                  onChange={e => setForm({...form, charityId: e.target.value})}>
                  <option value="">Select a charity...</option>
                  {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label">Donation % (min 10%)</label>
              <input type="number" min={10} max={100} className="input" value={form.donationPercentage}
                onChange={e => setForm({...form, donationPercentage: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              <UserPlus size={18} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
