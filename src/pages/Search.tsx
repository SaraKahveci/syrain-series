import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchSeries } from '../api/tmdb'
import { getSeries } from '../services/seriesStore'
import { getMovies } from '../services/movieStore'
import SeriesCard from '../components/SeriesCard'
import { Series, Movie } from '../types/series'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = '255227246862979880faf00116fac593'

type Filter = 'all' | 'series' | 'movies'
type SortBy = 'relevance' | 'rating_high' | 'rating_low'

type Result = {
  id: number
  title: string
  image: string
  rating: number
  type: 'series' | 'movie'
}

export default function Search() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')

  useEffect(() => {
    if (!query) return

    async function load() {
      setLoading(true)

      const localSeries = getSeries().filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase())
      ).map((s: Series): Result => ({ ...s, type: 'series' }))

      const localMovies = getMovies().filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
      ).map((m: Movie): Result => ({ ...m, type: 'movie' }))

      try {
        const [seriesData, moviesData] = await Promise.all([
          searchSeries(query),
          fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ar&with_original_language=ar`).then(r => r.json())
        ])

        const apiSeries: Result[] = seriesData.results.map((item: any) => ({
          id: item.id,
          title: item.name,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: item.vote_average / 2,
          type: 'series' as const,
        }))

        const apiMovies: Result[] = (moviesData.results ?? []).map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: item.vote_average / 2,
          type: 'movie' as const,
        }))

        setResults([...localSeries, ...localMovies, ...apiSeries, ...apiMovies])
      } catch {
        setResults([...localSeries, ...localMovies])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [query])

  const filtered = results
    .filter(r => filter === 'all' || (filter === 'series' ? r.type === 'series' : r.type === 'movie'))
    .sort((a, b) => {
      if (sortBy === 'rating_high') return b.rating - a.rating
      if (sortBy === 'rating_low') return a.rating - b.rating
      return 0
    })

  const seriesCount = results.filter(r => r.type === 'series').length
  const moviesCount = results.filter(r => r.type === 'movie').length

  if (loading) return <p className="p-6 text-white">Searching...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">
        Results for: <span className="text-pink-400">{query}</span>
        <span className="text-zinc-500 text-sm font-normal ml-2">({results.length} found)</span>
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex gap-2">
          {[
            { key: 'all', label: `All (${results.length})` },
            { key: 'series', label: `Series (${seriesCount})` },
            { key: 'movies', label: `Movies (${moviesCount})` },
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

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="bg-zinc-800 text-white text-sm px-3 py-2 rounded-lg outline-none ml-auto"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="rating_high">Sort: Highest Rated</option>
          <option value="rating_low">Sort: Lowest Rated</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-zinc-500">No results found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(result => (
          result.type === 'series' ? (
            <SeriesCard key={`series-${result.id}`} id={result.id} title={result.title} image={result.image} rating={result.rating} />
          ) : (
            <Link to={`/movies/${result.id}`} key={`movie-${result.id}`}>
              <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                <img
                  src={result.image}
                  alt={result.title}
                  className="h-72 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-white text-lg truncate">{result.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">🎬 Movie</p>
                  <p className="text-yellow-400 text-sm mt-1">
                    {'★'.repeat(Math.round(result.rating))}
                    {'☆'.repeat(5 - Math.round(result.rating))}
                    <span className="text-zinc-400 ml-1">{result.rating.toFixed(1)}</span>
                  </p>
                </div>
              </div>
            </Link>
          )
        ))}
      </div>
    </div>
  )
}