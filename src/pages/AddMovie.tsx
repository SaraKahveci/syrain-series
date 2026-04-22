import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../firebase'
import { onAuthStateChanged, User } from 'firebase/auth'
import { addMovie } from '../services/movieStore'

export default function AddMovie() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState(0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoadingAuth(false)
    })
    return () => unsub()
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    addMovie({
      id: Date.now(),
      title,
      image,
      rating,
      type: 'movie',
    })

    navigate('/movies')
  }

  if (loadingAuth) return <div className="p-6 text-white">Checking session...</div>

  if (!user) {
    return (
      <div className="max-w-xl mx-auto p-6 text-white text-center space-y-4">
        <h2 className="text-2xl font-bold">You must have an account to add a movie.</h2>
        <Link to="/register" className="inline-block bg-pink-500 px-6 py-3 rounded font-bold">
          Create Account
        </Link>
        <p className="text-zinc-400">
          Already registered?{' '}
          <Link to="/login" className="underline">Login to continue.</Link>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">🎬 Add New Movie</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          required
          placeholder="Movie title"
          className="w-full p-3 rounded bg-zinc-800"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          placeholder="Movie description"
          className="w-full p-3 rounded bg-zinc-800"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          required
          placeholder="Image URL"
          className="w-full p-3 rounded bg-zinc-800"
          value={image}
          onChange={e => setImage(e.target.value)}
        />
        <input
          type="number"
          min={1}
          max={5}
          step={0.1}
          className="w-full p-3 rounded bg-zinc-800"
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
        />
        <button className="w-full bg-pink-500 py-3 rounded font-bold">
          Add Movie
        </button>
      </form>
    </div>
  )
}