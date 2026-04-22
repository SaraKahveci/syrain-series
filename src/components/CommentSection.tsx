import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'

type Comment = {
  id: string
  seriesId: string
  text: string
  uid: string
  userEmail: string
  createdAt: string
}

type Props = {
  seriesId: string
}

const ADMIN_EMAIL = 'sarakahveci3@gmail.com'

export default function CommentSection({ seriesId }: Props) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('seriesId', '==', seriesId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Comment))
      setComments(data)
      setLoading(false)
    })

    return unsubscribe
  }, [seriesId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user) return

    await addDoc(collection(db, 'comments'), {
      seriesId,
      text: text.trim(),
      uid: user.uid,
      userEmail: user.email ?? '',
      createdAt: new Date().toISOString(),
    })

    setText('')
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'comments', id))
  }

  return (
    <div className="mt-10 border-t text-white border-zinc-800 pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      <div className="space-y-3 mb-6">
        {loading && <p className="text-zinc-400 text-sm">Loading...</p>}

        {!loading && comments.length === 0 && (
          <p className="text-zinc-400 text-sm">No comments yet.</p>
        )}

        {comments.map(c => (
          <div key={c.id} className="bg-zinc-900 rounded-md p-3 text-sm flex justify-between items-start gap-3">
            <div>
              <p className="text-xs text-pink-400 mb-1">{c.userEmail}</p>
              <p>{c.text}</p>
              <span className="text-xs text-zinc-500">
                {new Date(c.createdAt).toLocaleDateString()}
              </span>
            </div>
            {user?.email === ADMIN_EMAIL && (
              <button
                onClick={() => handleDelete(c.id)}
                className="text-zinc-500 hover:text-red-400 transition-colors text-xs shrink-0"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-zinc-800 p-3 rounded-md text-sm outline-none"
          />
          <button
            type="submit"
            className="bg-pink-600 px-4 py-2 rounded-md text-sm"
          >
            Add Comment
          </button>
        </form>
      ) : (
        <p className="text-sm text-zinc-400">
          <Link to="/login" className="text-pink-400 hover:text-pink-300 transition-colors">
            Sign in
          </Link>
          {' '}to leave a comment.
        </p>
      )}
    </div>
  )
}