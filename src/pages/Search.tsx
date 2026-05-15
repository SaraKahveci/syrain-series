import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchSeries, getGenres, searchActors } from '../api/tmdb'
import { getSeries } from '../services/seriesStore'
import { getMovies } from '../services/movieStore'
import SeriesCard from '../components/SeriesCard'
import { Series, Movie } from '../types/series'

const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = '255227246862979880faf00116fac593'

type Filter = 'all' | 'series' | 'movies' | 'actors'
type SortBy = 'relevance' | 'rating_high' | 'rating_low'

type Result = {
  id: number
  title: string
  image: string
  rating: number
  type: 'series' | 'movie' | 'actor'
  genreIds: number[]
  known_for?: string
}

type Genre = {
  id: number
  name: string
}

export default function Search() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('relevance')
  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null)

  useEffect(() => {
    getGenres().then(data => setGenres(data))
  }, [])

  useEffect(() => {
    if (!query) return

    async function load() {
      setLoading(true)

      const localSeries = getSeries().filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase())
      ).map((s: Series): Result => ({ ...s, type: 'series', genreIds: [] }))

      const localMovies = getMovies().filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
      ).map((m: Movie): Result => ({ ...m, type: 'movie', genreIds: [] }))

      try {
        const [seriesData, moviesData, actorsData] = await Promise.all([
          searchSeries(query),
          fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ar&with_original_language=ar`).then(r => r.json()),
          searchActors(query)
        ])

        const apiSeries: Result[] = seriesData.results.map((item: any) => ({
          id: item.id,
          title: item.name,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: item.vote_average / 2,
          type: 'series' as const,
          genreIds: item.genre_ids ?? [],
        }))

        const apiMovies: Result[] = (moviesData.results ?? []).map((item: any) => ({
          id: item.id,
          title: item.title,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: item.vote_average / 2,
          type: 'movie' as const,
          genreIds: item.genre_ids ?? [],
        }))

        const apiActors: Result[] = (actorsData.results ?? []).map((item: any) => ({
          id: item.id,
          title: item.name,
          image: item.profile_path
            ? `https://image.tmdb.org/t/p/w185${item.profile_path}`
            : '/placeholder.jpg',
          rating: item.popularity / 10,
          type: 'actor' as const,
          genreIds: [],
          known_for: item.known_for?.map((k: any) => k.name || k.title).join(', ') || ''
        }))

        setResults([...localSeries, ...localMovies, ...apiSeries, ...apiMovies, ...apiActors])
      } catch {
        setResults([...localSeries, ...localMovies])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [query])

  const filtered = results
    .filter(r => filter === 'all' || r.type === filter || (filter === 'actors' && r.type === 'actor'))
    .filter(r => selectedGenre === null || r.genreIds.includes(selectedGenre))
    .sort((a, b) => {
      if (sortBy === 'rating_high') return b.rating - a.rating
      if (sortBy === 'rating_low') return a.rating - b.rating
      return 0
    })

  const activeGenreIds = new Set(results.flatMap(r => r.genreIds))
  const visibleGenres = genres.filter(g => activeGenreIds.has(g.id))

  const seriesCount = results.filter(r => r.type === 'series').length
  const moviesCount = results.filter(r => r.type === 'movie').length
  const actorsCount = results.filter(r => r.type === 'actor').length

  if (loading) return <p className="p-6 text-white">Searching...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">
        Results for: <span className="text-pink-400">{query}</span>
        <span className="text-zinc-500 text-sm font-normal ml-2">({filtered.length} found)</span>
      </h1>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-2">
          {[
            { key: 'all', label: `All (${results.length})` },
            { key: 'series', label: `Series (${seriesCount})` },
            { key: 'movies', label: `Movies (${moviesCount})` },
            { key: 'actors', label: `Actors (${actorsCount})` },
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

      {visibleGenres.length > 0 && filter !== 'actors' && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              selectedGenre === null
                ? 'bg-pink-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            All Genres
          </button>
          {visibleGenres.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedGenre === g.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-zinc-500">No results found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map(result => {
          if (result.type === 'series') {
            return (
              <SeriesCard
                key={`series-${result.id}`}
                id={result.id}
                title={result.title}
                image={result.image}
                rating={result.rating}
              />
            )
          } else if (result.type === 'actor') {
            return (
              <Link to={`/actor/${result.id}`} key={`actor-${result.id}`}>
                <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                  <img
                    src={result.image}
                    alt={result.title}
                    className="h-72 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-white text-lg truncate">{result.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">🎭 Actor</p>
                    {result.known_for && (
                      <p className="text-xs text-zinc-600 mt-2 line-clamp-2">
                        Known for: {result.known_for}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          } else {
            return (
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
          }
        })}
      </div>
    </div>
  )
}