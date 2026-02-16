import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${query}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <nav className="w-full bg-black text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg sm:text-xl font-bold">
            Syrian Series
          </Link>

          {/* Desktop menu */}
          <ul className="hidden md:flex items-center gap-6">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/add-series">Add Series</Link></li>
            <li><Link to="/">Series</Link></li>
            <li><Link to="/favorites">Favorites</Link></li>
            <li><Link to="/contact">Contact</Link></li>

            <li>
              <form onSubmit={handleSubmit}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series..."
                  className="bg-zinc-800 px-3 py-1.5 rounded-md text-sm w-40 lg:w-56 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </form>
            </li>
          </ul>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-sm px-3 py-2 border border-zinc-700 rounded"
          >
            Menu
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 space-y-4">
            <Link to="/" className="block">Home</Link>
            <Link to="/add-series" className="block">Add Series</Link>
            <Link to="/" className="block">Series</Link>
            <Link to="/favorites" className="block">Favorites</Link>
            <Link to="/contact" className="block">Contact</Link>

            <form onSubmit={handleSubmit}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series..."
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-pink-500"
              />
            </form>
          </div>
        )}

      </div>
    </nav>
  )
}
