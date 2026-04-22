import { useEffect, useState } from 'react'
import { getPopularMovies, getMoviesByFilter } from '../api/tmdb'
import { getMovies } from '../services/movieStore'
import { Movie } from '../types/series'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

type TMDBMovie = {
  id: number
  title: string
  poster_path: string | null
  vote_average: number
  release_date: string
}

type Filter = 'all' | 'top_rated' | 'newest' | 'local'

export default function Movies() {
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [filtered, setFiltered] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [communityRatings, setCommunityRatings] = useState<Record<string, number>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tmdbData, ratingsSnap] = await Promise.all([
          getPopularMovies(),
          getDocs(collection(db, 'ratings')),
        ])

        const ratingsMap: Record<string, number[]> = {}
        ratingsSnap.docs.forEach(d => {
          const { seriesId, rating } = d.data()
          if (!ratingsMap[seriesId]) ratingsMap[seriesId] = []
          ratingsMap[seriesId].push(rating)
        })
        const avgRatings: Record<string, number> = {}
        Object.entries(ratingsMap).forEach(([id, arr]) => {
          avgRatings[id] = arr.reduce((a, b) => a + b, 0) / arr.length
        })
        setCommunityRatings(avgRatings)

        const apiMovies: Movie[] = tmdbData.results.map((item: TMDBMovie): Movie => ({
          id: item.id,
          title: item.title,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: avgRatings[item.id.toString()] ?? item.vote_average / 2,
          type: 'movie',
        }))

        const localMovies = getMovies()
        const combined = [...localMovies, ...apiMovies]
        setAllMovies(combined)
        setFiltered(combined)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (filter === 'all') {
      setFiltered(allMovies)
      return
    }

    if (filter === 'local') {
      setFiltered(allMovies.filter(m => m.id >= 1_000_000_000))
      return
    }

    const sortMap: Record<string, string> = {
      top_rated: 'vote_average.desc',
      newest: 'release_date.desc',
    }

    setLoading(true)
    getMoviesByFilter(sortMap[filter])
      .then(data => {
        const movies: Movie[] = data.results.map((item: TMDBMovie): Movie => ({
          id: item.id,
          title: item.title,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: communityRatings[item.id.toString()] ?? item.vote_average / 2,
          type: 'movie',
        }))
        setFiltered(movies)
      })
      .finally(() => setLoading(false))
  }, [filter, allMovies])

  if (loading) return <p className="p-6 text-white">Loading...</p>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">🎬 Arabic Movies</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { key: 'all', label: '🎬 All' },
          { key: 'top_rated', label: '⭐ Top Rated' },
          { key: 'newest', label: '🆕 Newest' },
          { key: 'local', label: '📁 Added by Us' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as Filter)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === f.key
                ? 'bg-pink-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(movie => (
          <Link to={`/movies/${movie.id}`} key={movie.id}>
            <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-3">
                <p className="text-white font-semibold truncate">{movie.title}</p>
                <p className="text-yellow-400 text-sm mt-1">
                  {'★'.repeat(Math.round(movie.rating))}
                  {'☆'.repeat(5 - Math.round(movie.rating))}
                  <span className="text-zinc-400 ml-1">{movie.rating.toFixed(1)}</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-zinc-500 text-center mt-10">No movies found.</p>
      )}
    </div>
  )
}