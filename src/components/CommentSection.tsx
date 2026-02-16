import { useEffect, useState } from 'react'
import { Comment } from '../types/series'

type Props = {
  seriesId: string
}

const API_BASE = 'http://localhost:4000' // change if your backend runs elsewhere

export default function CommentSection({ seriesId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_BASE}/api/comments?seriesId=${seriesId}`
        )
        if (!res.ok) throw new Error('Failed to fetch comments')
        const data = await res.json()
        setComments(data)
      } catch (err) {
        console.error('LOAD COMMENTS ERROR', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [seriesId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seriesId, text: text.trim() })
      })

      if (!res.ok) throw new Error('Failed to add comment')

      const newComment: Comment = await res.json()

      setComments(prev => [newComment, ...prev])
      setText('')
    } catch (err) {
      console.error('ADD COMMENT ERROR', err)
    }
  }

  return (
    <div className="mt-10 border-t text-white border-zinc-800 pt-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>

      <div className="space-y-3 mb-6">
        {loading && (
          <p className="text-zinc-400 text-sm">Loading...</p>
        )}

        {!loading && comments.length === 0 && (
          <p className="text-zinc-400 text-sm">No comments yet.</p>
        )}

        {comments.map(c => (
          <div
            key={c.id}
            className="bg-zinc-900 rounded-md p-3 text-sm"
          >
            <p>{c.text}</p>
            <span className="text-xs text-zinc-500">
              {new Date(c.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

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
    </div>
  )
}
