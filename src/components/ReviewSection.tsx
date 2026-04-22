import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore'

type Review = {
  id: string
  uid: string
  userEmail: string
  userName: string
  rating: number
  text: string
  createdAt: string
}

type Props = {
  contentId: string
}

const ADMIN_EMAIL = 'sarakahveci3@gmail.com'

export default function ReviewSection({ contentId }: Props) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [text, setText] = useState('')
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('contentId', '==', contentId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Review))
      setReviews(data)
      setLoading(false)

      if (user) {
        const existing = data.find(r => r.uid === user.uid)
        setUserReview(existing ?? null)
        if (existing && !editing) {
          setText(existing.text)
          setRating(existing.rating)
        }
      }
    })

    return unsubscribe
  }, [contentId, user])

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!user || !text.trim() || rating === 0) return

  console.log('Submitting review:', { contentId, uid: user.uid, rating, text })

  try {
    const reviewData = {
      contentId,
      uid: user.uid,
      userEmail: user.email ?? '',
      userName: user.displayName ?? user.email ?? 'Anonymous',
      rating,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }

    if (userReview) {
      await setDoc(doc(db, 'reviews', userReview.id), reviewData)
    } else {
      await addDoc(collection(db, 'reviews'), reviewData)
    }

    console.log('Review submitted successfully')
    setEditing(false)
  } catch (err) {
    console.error('REVIEW SUBMIT ERROR:', err)
  }
}
  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'reviews', id))
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="mt-10 border-t border-zinc-800 pt-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          Reviews ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm">
              {'★'.repeat(Math.round(avgRating))}
              {'☆'.repeat(5 - Math.round(avgRating))}
            </span>
            <span className="text-zinc-400 text-sm">{avgRating.toFixed(1)} avg</span>
          </div>
        )}
      </div>

      {/* Review list */}
      <div className="space-y-4 mb-8">
        {loading && <p className="text-zinc-400 text-sm">Loading...</p>}
        {!loading && reviews.length === 0 && (
          <p className="text-zinc-400 text-sm">No reviews yet. Be the first!</p>
        )}
        {reviews.map(r => (
          <div key={r.id} className="bg-zinc-900 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {r.userName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{r.userName}</p>
                  <p className="text-xs text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
                {(user?.email === ADMIN_EMAIL || user?.uid === r.uid) && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-zinc-500 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete
                  </button>
                )}
                {user?.uid === r.uid && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-zinc-500 hover:text-pink-400 text-xs transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-300 mt-3 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>

      {/* Write review */}
      {user ? (
        !userReview || editing ? (
          <div className="bg-zinc-900 rounded-xl p-4">
            <h4 className="text-sm font-semibold mb-3">
              {userReview ? 'Edit your review' : 'Write a review'}
            </h4>

            {/* Star picker */}
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl cursor-pointer transition-transform hover:scale-125"
                >
                  {rating >= star ? '★' : '☆'}
                </span>
              ))}
              {rating === 0 && (
                <span className="text-xs text-zinc-500 ml-2 self-center">Pick a score</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Share your thoughts about this series..."
                rows={4}
                className="w-full bg-zinc-800 p-3 rounded-md text-sm outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={rating === 0 || !text.trim()}
                  className="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md text-sm transition"
                >
                  {userReview ? 'Update Review' : 'Submit Review'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-md text-sm transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            You already reviewed this.{' '}
            <button onClick={() => setEditing(true)} className="text-pink-400 hover:text-pink-300">
              Edit your review
            </button>
          </p>
        )
      ) : (
        <p className="text-sm text-zinc-400">
          <Link to="/login" className="text-pink-400 hover:text-pink-300 transition-colors">
            Sign in
          </Link>{' '}
          to write a review.
        </p>
      )}
    </div>
  )
}