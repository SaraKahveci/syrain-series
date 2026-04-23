import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGenres } from '../api/tmdb'

const GENRE_EMOJIS: Record<string, string> = {
  'أكشن': '💥',
  'مغامرة': '🗺️',
  'رسوم متحركة': '🎨',
  'كوميديا': '😂',
  'جريمة': '🔪',
  'وثائقي': '🎥',
  'دراما': '🎭',
  'عائلي': '👨‍👩‍👧',
  'خيال': '🧙',
  'تاريخي': '📜',
  'رعب': '👻',
  'موسيقى': '🎵',
  'غموض': '🔍',
  'رومانسي': '❤️',
  'خيال علمي': '🚀',
  'إثارة': '😱',
  'حرب': '⚔️',
  'غربي': '🤠',
}

export default function Genres() {
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    getGenres().then(data => setGenres(data))
  }, [])

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-8">Browse by Genre</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map(g => (
          <Link
            to={`/genre/${g.id}/${encodeURIComponent(g.name)}`}
            key={g.id}
          >
            <div className="bg-zinc-900 hover:bg-zinc-800 transition rounded-xl p-5 text-center">
              <p className="text-3xl mb-2">{GENRE_EMOJIS[g.name] ?? '🎬'}</p>
              <p className="text-sm font-semibold">{g.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}