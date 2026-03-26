import { useState } from 'react'
import { createCharity, updateCharity, deleteCharity } from '../../api/charityApi'
import { extractError } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'

const emptyForm = { name: '', description: '', imageUrl: '', website: '', category: '', isActive: true }

export default function CharityManager({ charities, onRefresh }) {
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editing) {
        await updateCharity(editing, form)
        toast.success('Charity updated')
      } else {
        await createCharity(form)
        toast.success('Charity created')
      }
      setForm(emptyForm)
      setEditing(null)
      setShowForm(false)
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (c) => {
    setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', website: c.website || '', category: c.category || '', isActive: c.isActive })
    setEditing(c.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity?')) return
    try {
      await deleteCharity(id)
      toast.success('Charity deleted')
      onRefresh()
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Charity Management</h3>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm) }} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Add Charity'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><label className="label">Category</label><input className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
            <div><label className="label">Image URL</label><input className="input" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
            <div><label className="label">Website</label><input className="input" value={form.website} onChange={e => setForm({...form, website: e.target.value})} /></div>
          </div>
          <div><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save size={15} /> {editing ? 'Update' : 'Create'} Charity
          </button>
        </form>
      )}

      <div className="space-y-2">
        {charities.map(c => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-3">
              {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />}
              <div>
                <p className="text-white font-medium">{c.name}</p>
                <p className="text-gray-500 text-xs">{c.category} · {c.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(c)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
