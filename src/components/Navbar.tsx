import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${query}`)
    setQuery('')
    setOpen(false)
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
    setOpen(false)
  }

  return (
    <nav className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-xl font-bold">
          <Link to="/">Syrian Series</Link>
        </h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 items-center">

          <li><Link className="hover:text-pink-400" to="/">Home</Link></li>
          <li><Link className="hover:text-pink-400" to="/add-series">Add Series</Link></li>
          <li><Link className="hover:text-pink-400" to="/favorites">Favorites</Link></li>
          <li><Link className="hover:text-pink-400" to="/movies">Movies</Link></li>
          <li><Link className="hover:text-pink-400" to="/contact">Contact</Link></li>

          <li>
            <form onSubmit={handleSubmit}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series..."
                className="bg-zinc-800 px-3 py-1 rounded-md text-sm outline-none focus:ring-2 focus:ring-pink-500"
              />
            </form>
          </li>

          {!user && (
            <>
              <li>
                <Link
                  to="/login"
                  className="bg-pink-600 hover:bg-pink-700 px-3 py-1.5 rounded-md text-sm font-semibold"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="border border-zinc-700 hover:border-pink-500 px-3 py-1.5 rounded-md text-sm"
                >
                  Register
                </Link>
              </li>
            </>
          )}

          {user && (
            <>
              <li className="text-xs text-zinc-400">{user.email}</li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md text-sm"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 space-y-4 border-t border-zinc-800">

          <Link onClick={() => setOpen(false)} className="block" to="/">Home</Link>
          <Link onClick={() => setOpen(false)} className="block" to="/add-series">Add Series</Link>
          <Link onClick={() => setOpen(false)} className="block" to="/favorites">Favorites</Link>
          <Link onClick={() => setOpen(false)} className="block" to="/movies">Movies</Link>
          <Link onClick={() => setOpen(false)} className="block" to="/contact">Contact</Link>

          <form onSubmit={handleSubmit}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search series..."
              className="w-full bg-zinc-800 px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-pink-500"
            />
          </form>

          {!user && (
            <div className="flex gap-3">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center bg-pink-600 py-2 rounded-md text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center border border-zinc-700 py-2 rounded-md text-sm"
              >
                Register
              </Link>
            </div>
          )}

          {user && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-400">{user.email}</div>
              <button
                onClick={handleLogout}
                className="w-full bg-zinc-800 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      )}
    </nav>
  )
}
