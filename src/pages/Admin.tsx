import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
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

type Comment = {
  id: string
  seriesId: string
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
  const [comments, setComments] = useState<Comment[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [tab, setTab] = useState<'comments' | 'ratings'>('comments')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.email !== ADMIN_EMAIL) { navigate('/'); return }

    async function loadData() {
      const commentsSnap = await getDocs(
        query(collection(db, 'comments'), orderBy('createdAt', 'desc'))
      )
      setComments(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Comment)))

      const ratingsSnap = await getDocs(collection(db, 'ratings'))
      setRatings(ratingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Rating)))

      setLoading(false)
    }

    loadData()
  }, [user])

  async function deleteComment(id: string) {
    await deleteDoc(doc(db, 'comments', id))
    setComments(prev => prev.filter(c => c.id !== id))
  }

  async function deleteRating(id: string) {
    await deleteDoc(doc(db, 'ratings', id))
    setRatings(prev => prev.filter(r => r.id !== id))
  }

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-8">Logged in as {user?.email}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Total Comments</p>
          <p className="text-4xl font-bold mt-1">{comments.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Total Ratings</p>
          <p className="text-4xl font-bold mt-1">{ratings.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab('comments')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'comments' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          Comments ({comments.length})
        </button>
        <button
          onClick={() => setTab('ratings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === 'ratings' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          Ratings ({ratings.length})
        </button>
      </div>

      {/* Comments tab */}
      {tab === 'comments' && (
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-zinc-500 text-sm">No comments yet.</p>
          )}
          {comments.map(c => (
            <div key={c.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-start gap-4">
              <div>
                <p className="text-sm text-white">{c.text}</p>
                <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                  <span>Series: {c.seriesId}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={() => deleteComment(c.id)}
                className="text-red-400 hover:text-red-300 text-xs shrink-0 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ratings tab */}
      {tab === 'ratings' && (
        <div className="space-y-3">
          {ratings.length === 0 && (
            <p className="text-zinc-500 text-sm">No ratings yet.</p>
          )}
          {ratings.map(r => (
            <div key={r.id} className="bg-zinc-900 rounded-xl p-4 flex justify-between items-center gap-4">
              <div>
                <p className="text-sm text-white">Series: {r.seriesId}</p>
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