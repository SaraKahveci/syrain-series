import { useAuth } from '../context/AuthContext'
import { useFavourite } from '../context/FavouriteContext'
import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'

type RatingItem = {
  seriesId: string
  rating: number
}

type CommentItem = {
  id: string
  seriesId: string
  text: string
  createdAt: string
}

export default function Profile() {
  const { user, refreshUser, loading } = useAuth()
  const { favourites } = useFavourite()
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [comments, setComments] = useState<CommentItem[]>([])
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'favorites' | 'ratings' | 'comments'>('favorites')
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }

    setDisplayName(user.displayName ?? '')

    async function loadData() {
      const ratingsSnap = await getDocs(
        query(collection(db, 'ratings'), where('uid', '==', user!.uid))
      )
      setRatings(ratingsSnap.docs.map(d => ({
        seriesId: d.data().seriesId,
        rating: d.data().rating,
      })))

      const commentsSnap = await getDocs(
        query(
          collection(db, 'comments'),
          where('uid', '==', user!.uid),
          orderBy('createdAt', 'desc')
        )
      )
      setComments(commentsSnap.docs.map(d => ({
        id: d.id,
        seriesId: d.data().seriesId,
        text: d.data().text,
        createdAt: d.data().createdAt,
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
              <span>{ratings.length} ratings</span>
              <span>{comments.length} comments</span>
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
      <div className="flex gap-3 mb-6">
        {(['favorites', 'ratings', 'comments'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${
              tab === t ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            {t === 'favorites' && `❤️ Favorites (${favourites.length})`}
            {t === 'ratings' && `⭐ Ratings (${ratings.length})`}
            {t === 'comments' && `💬 Comments (${comments.length})`}
          </button>
        ))}
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

      {/* Ratings tab */}
      {tab === 'ratings' && (
        <div className="space-y-2">
          {ratings.length === 0 ? (
            <p className="text-zinc-500 text-sm">No ratings yet.</p>
          ) : (
            ratings.map(r => (
              <Link
                to={`/series/${r.seriesId}`}
                key={r.seriesId}
                className="flex items-center justify-between bg-zinc-900 rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
              >
                <span className="text-sm text-zinc-300">Series #{r.seriesId}</span>
                <span className="text-yellow-400 text-sm">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Comments tab */}
      {tab === 'comments' && (
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-zinc-500 text-sm">No comments yet.</p>
          ) : (
            comments.map(c => (
              <Link
                to={`/series/${c.seriesId}`}
                key={c.id}
                className="block bg-zinc-900 rounded-lg px-4 py-3 hover:bg-zinc-800 transition"
              >
                <p className="text-sm text-white">{c.text}</p>
                <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                  <span>Series #{c.seriesId}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}