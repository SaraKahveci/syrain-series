import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchSeries } from '../api/tmdb'
import { getSeries } from '../services/seriesStore'
import SeriesCard from '../components/SeriesCard'
import { Series } from '../types/series'

export default function Search() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const [results, setResults] = useState<Series[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
  
    async function load() {
      setLoading(true)
  
      const localSeries = getSeries().filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase())
      )
  
      try {
        const tmdbData = await searchSeries(query)
  
        const apiSeries: Series[] = tmdbData.results.map((item: any) => ({
          id: item.id,
          title: item.name,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : '/placeholder.jpg',
          rating: item.vote_average / 2,
        }))
  
        setResults([...localSeries, ...apiSeries])
      } catch {
        setResults(localSeries)
      } finally {
        setLoading(false)
      }
    }
  
    load()
  }, [query])
  
  if (loading) return <p className="p-6 text-white">Searching...</p>

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Results for: <span className="text-pink-400">{query}</span>
      </h1>

      {results.length === 0 && <p>No results found.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {results.map(series => (
          <SeriesCard key={series.id} {...series} />
        ))}
      </div>
    </div>
  )
}
