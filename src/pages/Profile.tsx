import { useAuth } from '../context/AuthContext'
import { useFavourite } from '../context/FavouriteContext'
import { useEffect, useState, useRef } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { signOut, updateProfile } from 'firebase/auth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

type RatingItem = {
  seriesId: string
  rating: number
}

export default function Profile() {
  const { user } = useAuth()
  const { favourites } = useFavourite()
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/profile')
      return
    }
    setDisplayName(user.displayName ?? '')

    async function loadRatings() {
      const q = query(
        collection(db, 'ratings'),
        where('uid', '==', user!.uid)
      )
      const snap = await getDocs(q)
      setRatings(snap.docs.map(doc => ({
        seriesId: doc.data().seriesId,
        rating: doc.data().rating,
      })))
    }

    loadRatings()
  }, [user])

  async function handleSaveName() {
    if (!user || !displayName.trim()) return
    setSaving(true)
    try {
      await updateProfile(user, { displayName: displayName.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const storage = getStorage()
    const storageRef = ref(storage, `avatars/${user.uid}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    await updateProfile(user, { photoURL: url })
    window.location.reload()
  }

  async function handleLogout() {
    await signOut(auth)
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">

      {/* User info */}
      <div className="bg-zinc-900 rounded-2xl p-6 mb-10">
        <div className="flex items-start gap-5">

          {/* Avatar */}
          <div className="relative shrink-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-pink-600 flex items-center justify-center text-3xl font-bold">
                {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-zinc-700 hover:bg-zinc-600 text-xs px-2 py-1 rounded-full transition"
            >
              Edit
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name + email */}
          <div className="flex-1">
            <p className="text-zinc-400 text-sm mb-1">{user.email}</p>
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

      {/* Favorites */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Favorite Series</h2>
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
      </section>

      {/* Ratings */}
      <section>
        <h2 className="text-xl font-bold mb-4">Your Ratings</h2>
        {ratings.length === 0 ? (
          <p className="text-zinc-500 text-sm">You haven't rated any series yet.</p>
        ) : (
          <div className="space-y-2">
            {ratings.map(r => (
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
            ))}
          </div>
        )}
      </section>
    </div>
  )
}