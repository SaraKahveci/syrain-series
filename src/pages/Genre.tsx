import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getByGenre } from '../api/tmdb'
import SeriesCard from '../components/SeriesCard'

type Filter = 'series' | 'movies'

export default function Genre() {
  const { id, name } = useParams()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('series')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getByGenre(Number(id), filter === 'series' ? 'tv' : 'movie').then(data => {
      setResults(data.results ?? [])
      setLoading(false)
    })
  }, [id, filter])

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        {decodeURIComponent(name ?? '')}
      </h1>

      {/* Filter */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('series')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === 'series' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          📺 Series
        </button>
        <button
          onClick={() => setFilter('movies')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            filter === 'movies' ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          🎬 Movies
        </button>
      </div>

      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : results.length === 0 ? (
        <p className="text-zinc-500">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filter === 'series' ? (
            results.map((item: any) => (
              <SeriesCard
                key={item.id}
                id={item.id}
                title={item.name}
                image={item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : '/placeholder.jpg'}
                rating={item.vote_average / 2}
              />
            ))
          ) : (
            results.map((item: any) => (
              <Link to={`/movies/${item.id}`} key={item.id}>
                <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                  <img
                    src={item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : '/placeholder.jpg'}
                    alt={item.title}
                    className="h-72 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-white text-lg truncate">{item.title}</h3>
                    <p className="text-yellow-400 text-sm mt-1">
                      {'★'.repeat(Math.round(item.vote_average / 2))}
                      {'☆'.repeat(5 - Math.round(item.vote_average / 2))}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}