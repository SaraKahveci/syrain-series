import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getSeriesDetails,
  getSeriesCast,
  getSeriesEpisodes,
  getSeriesVideos,
  getSimilarSeries,
} from '../api/tmdb'
import RatingStars from '../components/RatingStars'
import { Series } from '../types/series'
import ReviewSection from '../components/ReviewSection'
import { useAuth } from '../context/AuthContext'
import { useFavourite } from '../context/FavouriteContext'
import { db } from '../firebase'
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore'
import { SkeletonDetail } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'

export default function SeriesDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toggleFavourite, isFavourite } = useFavourite()
  const { showToast } = useToast()
  const [series, setSeries] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [cast, setCast] = useState<any[]>([])
  const [episodes, setEpisodes] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [isLocal, setIsLocal] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [similarSeries, setSimilarSeries] = useState<any[]>([])
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    if (!id) return

    const localSeries: Series[] = JSON.parse(
      localStorage.getItem('custom-series') || '[]'
    )
    const foundLocal = localSeries.find(s => s.id.toString() === id)

    if (foundLocal) {
      setSeries(foundLocal)
      setIsLocal(true)
      setLoading(false)
      return
    }

    getSeriesDetails(id).then(data => {
      setSeries(data)
      setLoading(false)
    })

    getSeriesCast(id).then(data => {
      setCast(data.cast?.slice(0, 12) ?? [])
    })

    getSeriesEpisodes(id, 1).then(data => {
      setEpisodes(data.episodes ?? [])
    })

    getSeriesVideos(id).then(data => {
      const trailer = data.results?.find(
        (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
      ) ?? data.results?.[0]
      if (trailer) setTrailerKey(trailer.key)
    })

    getSimilarSeries(id).then(data => {
      setSimilarSeries(data.results?.slice(0, 6) ?? [])
    })
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    async function load() {
      const ratingRef = doc(db, 'ratings', `${user!.uid}_${id}`)
      const snap = await getDoc(ratingRef)
      if (snap.exists()) setUserRating(snap.data().rating)

      const watchlistRef = doc(db, 'watchlist', `${user!.uid}_series_${id}`)
      const wSnap = await getDoc(watchlistRef)
      setInWatchlist(wSnap.exists())
    }
    load()
  }, [user, id])

  async function handleRate(rating: number) {
    if (!user || !id) return
    const ref = doc(db, 'ratings', `${user.uid}_${id}`)
    await setDoc(ref, {
      uid: user.uid,
      seriesId: id,
      rating,
      createdAt: new Date().toISOString(),
    })
    setUserRating(rating)
    showToast(`Rated ${rating} stars ⭐`)
  }

  async function handleSeasonChange(season: number) {
    if (!id) return
    setSelectedSeason(season)
    const data = await getSeriesEpisodes(id, season)
    setEpisodes(data.episodes ?? [])
  }

  function handleToggle() {
    if (!user || !id || !series) return
    const favorited = isFavourite(Number(id))
    toggleFavourite({
      id: Number(id),
      title: series.title || series.name,
      image: series.image || `https://image.tmdb.org/t/p/w500${series.poster_path}`,
      rating: series.rating ?? series.vote_average / 2,
    })
    showToast(favorited ? 'Removed from favorites' : 'Added to favorites ❤️')
  }

  async function handleWatchlist() {
    if (!user || !id || !series) return
    const ref = doc(db, 'watchlist', `${user.uid}_series_${id}`)
    if (inWatchlist) {
      await deleteDoc(ref)
      setInWatchlist(false)
      showToast('Removed from watchlist')
    } else {
      await setDoc(ref, {
        uid: user.uid,
        contentId: id,
        type: 'series',
        title: series.title || series.name,
        image: series.image || `https://image.tmdb.org/t/p/w500${series.poster_path}`,
        addedAt: new Date().toISOString(),
      })
      setInWatchlist(true)
      showToast('Added to watchlist 🕐')
    }
  }

  if (loading) return <SkeletonDetail />
  if (!series) return <p className="text-center mt-10">Series not found</p>

  const favorited = isFavourite(Number(id))
  const totalSeasons = series.number_of_seasons ?? 1

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <img
        src={series.image || `https://image.tmdb.org/t/p/w500${series.poster_path}`}
        className="rounded-xl mb-6 w-full max-h-[500px] object-cover"
      />

      {/* Title + Favorite + Watchlist */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl first-letter:capitalize font-bold mb-2">
          {series.title || series.name}
        </h1>
        {user && (
          <div className="flex gap-3 items-center shrink-0">
            <button
              onClick={handleWatchlist}
              className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                inWatchlist
                  ? 'border-pink-500 text-pink-400'
                  : 'border-zinc-600 text-zinc-400 hover:border-zinc-400'
              }`}
            >
              {inWatchlist ? '🕐 Watchlist ✓' : '🕐 Add to Watchlist'}
            </button>
            <button
              onClick={handleToggle}
              className={`text-2xl transition-transform hover:scale-110 ${
                favorited ? 'text-pink-500' : 'text-zinc-500'
              }`}
            >
              {favorited ? '♥' : '♡'}
            </button>
          </div>
        )}
      </div>

      {/* Rating */}
      {user ? (
        <div>
          <p className="text-sm text-zinc-400 mb-1">Your rating:</p>
          <RatingStars rating={userRating} onRate={handleRate} />
        </div>
      ) : (
        <div>
          <RatingStars rating={series.rating || series.vote_average / 2} />
          <p className="text-xs text-zinc-500 mt-1">Sign in to rate this series.</p>
        </div>
      )}

      <p className="mt-4 text-gray-400">
        {series.overview || 'No description available.'}
      </p>

      {/* Series Info */}
      {!isLocal && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {series.first_air_date && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">First Aired</p>
              <p className="text-sm text-white mt-1">{series.first_air_date}</p>
            </div>
          )}
          {series.number_of_seasons && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Seasons</p>
              <p className="text-sm text-white mt-1">{series.number_of_seasons}</p>
            </div>
          )}
          {series.number_of_episodes && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Episodes</p>
              <p className="text-sm text-white mt-1">{series.number_of_episodes}</p>
            </div>
          )}
          {series.status && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="text-sm text-white mt-1">{series.status}</p>
            </div>
          )}
          {series.genres?.length > 0 && (
            <div className="bg-zinc-900 rounded-lg p-3 col-span-2">
              <p className="text-xs text-zinc-500">Genres</p>
              <p className="text-sm text-white mt-1">
                {series.genres.map((g: any) => g.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trailer */}
      {!isLocal && trailerKey && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Trailer</h2>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-xl"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="Trailer"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cast */}
      {!isLocal && cast.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Cast</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {cast.map((member: any) => (
              <Link to={`/actor/${member.id}`} key={member.id}>
                <div className="text-center hover:scale-105 transition cursor-pointer">
                  <img
                    src={
                      member.profile_path
                        ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                        : '/placeholder.jpg'
                    }
                    alt={member.name}
                    className="w-full h-28 object-cover rounded-lg mb-1"
                  />
                  <p className="text-xs text-white font-medium truncate">{member.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{member.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Episodes */}
      {!isLocal && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Episodes</h2>
            {totalSeasons > 1 && (
              <select
                value={selectedSeason}
                onChange={e => handleSeasonChange(Number(e.target.value))}
                className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-md outline-none"
              >
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                  <option key={s} value={s}>Season {s}</option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-3">
            {episodes.map((ep: any) => (
              <div key={ep.id} className="flex gap-4 bg-zinc-900 rounded-lg p-3">
                {ep.still_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                    alt={ep.name}
                    className="w-32 h-20 object-cover rounded-md shrink-0"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {ep.episode_number}. {ep.name.replace(/\d+/, '').trim()}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{ep.overview}</p>
                  {ep.air_date && (
                    <p className="text-xs text-zinc-600 mt-1">{ep.air_date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Series */}
      {!isLocal && similarSeries.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {similarSeries.map((s: any) => (
              <Link to={`/series/${s.id}`} key={s.id}>
                <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                  <img
                    src={
                      s.poster_path
                        ? `https://image.tmdb.org/t/p/w300${s.poster_path}`
                        : '/placeholder.jpg'
                    }
                    alt={s.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{s.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ReviewSection contentId={id!} />
    </div>
  )
}