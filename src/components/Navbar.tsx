import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
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
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  return (
    <nav className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-xl font-bold">
          <Link to="/">Syrian Series</Link>
        </h1>

        <ul className="hidden md:flex gap-6 items-center">

          <li><Link className="hover:text-pink-400" to="/">Home</Link></li>
          <li><Link className="hover:text-pink-400" to="/add-series">Add Series</Link></li>
          <li><Link className="hover:text-pink-400" to="/favorites">Favorites</Link></li>
          <li><Link className="hover:text-pink-400" to="/movies">Movies</Link></li>
          <li><Link className="hover:text-pink-400" to="/contact">Contact</Link></li>

          {/* Search */}
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

          {/* AUTH BUTTONS */}

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
              <li className="text-xs text-zinc-400">
                {user.email}
              </li>

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
      </div>
    </nav>
  )
}
