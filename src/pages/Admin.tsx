import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'

const ADMIN_EMAIL = 'sarakahveci3@gmail.com'

type Review = {
  id: string
  uid: string
  userEmail: string
  userName: string
  contentId: string
  rating: number
  text: string
  createdAt: string
}

type Rating = {
  id: string
  uid: string
  seriesId: string
  rating: number
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [tab, setTab] = useState<'reviews' | 'ratings'>('reviews')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.email !== ADMIN_EMAIL) { navigate('/'); return }

    async function loadData() {
      const reviewsSnap = await getDocs(
        query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
      )
      setReviews(reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)))

      const ratingsSnap = await getDocs(collection(db, 'ratings'))
      setRatings(ratingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Rating)))

      setLoading(false)
    }

    loadData()
  }, [user])

  async function deleteReview(id: string) {
    await deleteDoc(doc(db, 'reviews', id))
    setReviews(prev => prev.filter(r => r.id !== id))
  }

  async function deleteRating(id: string) {
    await deleteDoc(doc(db, 'ratings', id))
    setRatings(prev => prev.filter(r => r.id !== id))
  }

  const filteredReviews = reviews.filter(r =>
    search === '' ||
    r.text.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    r.userName.toLowerCase().includes(search.toLowerCase())
  )

  const filteredRatings = ratings.filter(r =>
    search === '' || r.uid.toLowerCase().includes(search.toLowerCase())
  )

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : '—'

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-8">Logged in as {user?.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Total Reviews</p>
          <p className="text-4xl font-bold mt-1">{reviews.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Total Ratings</p>
          <p className="text-4xl font-bold mt-1">{ratings.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Avg Rating</p>
          <p className="text-4xl font-bold mt-1 text-yellow-400">{avgRating}</p>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by user or content..."
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-pink-500 mb-6"
      />

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab('reviews')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'reviews' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          ⭐ Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setTab('ratings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'ratings' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          🌟 Ratings ({ratings.length})
        </button>
      </div>

      {/* Reviews tab */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {filteredReviews.length === 0 && (
            <p className="text-zinc-500 text-sm">No reviews found.</p>
          )}
          {filteredReviews.map(r => (
            <div key={r.id} className="bg-zinc-900 rounded-xl p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-sm font-bold shrink-0">
                    {(r.userName || r.userEmail || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.userName || r.userEmail}</p>
                    <p className="text-xs text-zinc-500">{r.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-yellow-400 text-sm">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="text-red-400 hover:text-red-300 text-xs transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-sm text-zinc-300 mt-3">{r.text}</p>
              <Link
                to={`/series/${r.contentId}`}
                className="text-xs text-pink-400 hover:text-pink-300 mt-2 inline-block"
              >
                View content →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Ratings tab */}
      {tab === 'ratings' && (
        <div className="space-y-3">
          {filteredRatings.length === 0 && (
            <p className="text-zinc-500 text-sm">No ratings found.</p>
          )}
          {filteredRatings.map(r => (
            <div key={r.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-center gap-4">
              <div>
                <p className="text-sm text-white">Content: {r.seriesId}</p>
                <p className="text-xs text-zinc-500 mt-1">User: {r.uid}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-yellow-400 text-sm">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
                <button
                  onClick={() => deleteRating(r.id)}
                  className="text-red-400 hover:text-red-300 text-xs transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}