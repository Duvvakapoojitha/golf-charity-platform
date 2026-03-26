import { useState, useEffect } from 'react'
import { getCharities } from '../api/charityApi'
import Loader from '../components/common/Loader'
import { Search, Heart, ExternalLink } from 'lucide-react'

export default function Charities() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      getCharities(search || undefined)
        .then(r => setCharities(r.data.data || []))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const categories = [...new Set(charities.map(c => c.category).filter(Boolean))]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Our Charities</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Every subscription contributes to these amazing causes. Choose the one closest to your heart.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="input pl-12"
          placeholder="Search charities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <Loader /> : (
        <>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSearch(cat)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-full transition-colors">
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {charities.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(selected?.id === c.id ? null : c)}
                className="card cursor-pointer hover:border-gray-700 hover:-translate-y-1 transition-all duration-200"
              >
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                ) : (
                  <div className="w-full h-40 bg-gray-800 rounded-xl mb-4 flex items-center justify-center">
                    <Heart size={40} className="text-gray-600" />
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  {c.category && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full ml-2 shrink-0">{c.category}</span>
                  )}
                </div>
                {selected?.id === c.id && (
                  <div className="mt-3 pt-3 border-t border-gray-800 animate-fade-in">
                    <p className="text-gray-400 text-sm mb-3">{c.description}</p>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary-400 text-sm hover:text-primary-300"
                        onClick={e => e.stopPropagation()}>
                        <ExternalLink size={14} /> Visit website
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!charities.length && (
            <div className="text-center py-16 text-gray-500">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p>No charities found</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
