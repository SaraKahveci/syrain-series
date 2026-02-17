import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { Comment } from '../types/series'

type Props = {
  seriesId: string
}

const API_BASE = 'http://localhost:4000'
const ADMIN_EMAIL = 'sarakahveci3@gmail.com'

export default function CommentSection({ seriesId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const user = auth.currentUser

  useEffect(() => {
    async function load() {
      const res = await fetch(`${API_BASE}/api/comments?seriesId=${seriesId}`)
      const data = await res.json()
      setComments(data)
      setLoading(false)
    }
    load()
  }, [seriesId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !text.trim()) return

    const res = await fetch(`${API_BASE}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesId,
        text,
        userId: user.uid,
        email: user.email
      })
    })

    const newComment = await res.json()
    setComments(prev => [newComment, ...prev])
    setText('')
  }

  async function handleDelete(id: string) {
    if (!user) return

    await fetch(`${API_BASE}/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    })

    setComments(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="mt-10 border-t border-zinc-800 pt-6 text-white">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      {/* 🚫 NOT LOGGED IN STATE */}
      {!user && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center mb-6">
          <p className="text-zinc-300 mb-3">
            You must have an account to write comments.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="bg-pink-600 hover:bg-pink-700 px-5 py-2 rounded-lg text-sm font-semibold"
          >
            Create Account
          </button>

          <p className="text-xs text-zinc-500 mt-3">
            Already registered? Login to continue.
          </p>
        </div>
      )}

      {/* ✅ COMMENT FORM */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full bg-zinc-800 p-3 rounded-md text-sm"
            placeholder="Write a comment..."
          />

          <button className="bg-pink-600 px-4 py-2 rounded-md text-sm">
            Add Comment
          </button>
        </form>
      )}

      <div className="space-y-3">
        {loading && <p className="text-zinc-400 text-sm">Loading...</p>}

        {comments.map(c => (
          <div key={c.id} className="bg-zinc-900 p-3 rounded-md text-sm">
            <p>{c.text}</p>

            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-zinc-500">
                {c.email} • {new Date(c.createdAt).toLocaleDateString()}
              </span>

              {user?.email === ADMIN_EMAIL && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-400 text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
