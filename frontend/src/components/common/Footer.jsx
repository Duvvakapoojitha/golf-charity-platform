import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">G</span>
          </div>
          <span className="text-gray-400 text-sm">GolfCharity — Play. Win. Give.</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link to="/charities" className="hover:text-gray-300 transition-colors">Charities</Link>
          <Link to="/draws" className="hover:text-gray-300 transition-colors">Draws</Link>
          <span className="flex items-center gap-1">Made with <Heart size={12} className="text-red-500" /> for good</span>
        </div>
      </div>
    </footer>
  )
}
