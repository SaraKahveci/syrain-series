import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSeriesDetails } from '../services/tmdb'
import RatingStars from '../components/RatingStars'
import { Series } from '../types/series'
import CommentSection from '../components/CommentSection'


export default function SeriesDetails() {
  const { id } = useParams()
  const [series, setSeries] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
  
    const localSeries: Series[] = JSON.parse(
      localStorage.getItem('custom-series') || '[]'
    )
  
    const foundLocal = localSeries.find(
      s => s.id.toString() === id
    )
  
    if (foundLocal) {
      setSeries(foundLocal)
      setLoading(false)
      return
    }
  
    getSeriesDetails(id)
      .then(data => setSeries(data))
      .catch(() => setSeries(null))
      .finally(() => setLoading(false))
  
  }, [id])
  
  if (loading) return <p className="text-center mt-10">Loading...</p>

  if (!series) return <p className="text-center mt-10">Series not found</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <img
        src={
          series.image
            ? series.image
            : `https://image.tmdb.org/t/p/w500${series.poster_path}`
        }
        className="rounded-xl mb-6 w-full max-h-[500px] object-cover"
      />

      <h1 className="text-3xl first-letter:capitalize font-bold mb-2">
        {series.title || series.name}
      </h1>

      <RatingStars
        rating={
          series.rating
            ? series.rating
            : series.vote_average / 2
        }
      />

      <p className="mt-4 text-gray-600">
        {series.overview || 'No description available.'}
      </p>
      <CommentSection seriesId={series.id} />


    </div>
  )
}
