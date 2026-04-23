import { useAuth } from '../context/AuthContext'
import { useFavourite } from '../context/FavouriteContext'
import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'

type ReviewItem = {
  id: string
  contentId: string
  text: string
  rating: number
  createdAt: string
}

type WatchlistItem = {
  id: string
  contentId: string
  type: 'series' | 'movie'
  title: string
  image: string
  addedAt: string
}

export default function Profile() {
  const { user, refreshUser, loading } = useAuth()
  const { favourites } = useFavourite()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'favorites' | 'reviews' | 'watchlist'>('favorites')
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }

    setDisplayName(user.displayName ?? '')

    async function loadData() {
      const reviewsSnap = await getDocs(
        query(
          collection(db, 'reviews'),
          where('uid', '==', user!.uid),
          orderBy('createdAt', 'desc')
        )
      )
      setReviews(reviewsSnap.docs.map(d => ({
        id: d.id,
        contentId: d.data().contentId,
        text: d.data().text,
        rating: d.data().rating,
        createdAt: d.data().createdAt,
      })))

      const watchlistSnap = await getDocs(
        query(
          collection(db, 'watchlist'),
          where('uid', '==', user!.uid),
          orderBy('addedAt', 'desc')
        )
      )
      setWatchlist(watchlistSnap.docs.map(d => ({
        id: d.id,
        contentId: d.data().contentId,
        type: d.data().type,
        title: d.data().title,
        image: d.data().image,
        addedAt: d.data().addedAt,
      })))
    }

    loadData()
  }, [user, loading])

  async function handleSaveName() {
    if (!user || !displayName.trim()) return
    setSaving(true)
    try {
      await updateProfile(user, { displayName: displayName.trim() })
      refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveWatchlist(id: string) {
    await deleteDoc(doc(db, 'watchlist', id))
    setWatchlist(prev => prev.filter(w => w.id !== id))
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>
  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">

      {/* User info */}
      <div className="bg-zinc-900 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-5">
          <div className="shrink-0">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-pink-600 flex items-center justify-center text-3xl font-bold">
                {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-zinc-400 text-sm mb-2">{user.email}</p>
            <div className="flex gap-2 items-center">
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Add your name..."
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-pink-500 w-56"
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="bg-pink-600 hover:bg-pink-700 transition text-sm px-4 py-2 rounded-lg"
              >
                {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-zinc-500">
              <span>{favourites.length} favorites</span>
              <span>{reviews.length} reviews</span>
              <span>{watchlist.length} watchlist</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-pink-400 hover:text-pink-300 transition-colors shrink-0"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setTab('favorites')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'favorites' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          ❤️ Favorites ({favourites.length})
        </button>
        <button
          onClick={() => setTab('watchlist')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'watchlist' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          🕐 Watchlist ({watchlist.length})
        </button>
        <button
          onClick={() => setTab('reviews')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'reviews' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          ⭐ Reviews ({reviews.length})
        </button>
      </div>

      {/* Favorites tab */}
      {tab === 'favorites' && (
        <div>
          {favourites.length === 0 ? (
            <p className="text-zinc-500 text-sm">No favorites yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favourites.map(s => (
                <Link to={`/series/${s.id}`} key={s.id}>
                  <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                    <img
                      src={s.image || '/placeholder.jpg'}
                      alt={s.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{s.title}</p>
                      <p className="text-xs text-yellow-400">
                        {'★'.repeat(Math.round(s.rating))}
                        {'☆'.repeat(5 - Math.round(s.rating))}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist tab */}
      {tab === 'watchlist' && (
        <div>
          {watchlist.length === 0 ? (
            <p className="text-zinc-500 text-sm">Your watchlist is empty.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {watchlist.map(w => (
                <div key={w.id} className="relative">
                  <Link to={w.type === 'movie' ? `/movies/${w.contentId}` : `/series/${w.contentId}`}>
                    <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                      <img
                        src={w.image || '/placeholder.jpg'}
                        alt={w.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">{w.title}</p>
                        <p className="text-xs text-zinc-500 capitalize">{w.type}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveWatchlist(w.id)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full hover:bg-red-600 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-zinc-500 text-sm">No reviews yet.</p>
          ) : (
            reviews.map(r => (
              <Link
                to={`/series/${r.contentId}`}
                key={r.id}
                className="block bg-zinc-900 rounded-xl px-4 py-4 hover:bg-zinc-800 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 text-sm">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-300">{r.text}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}