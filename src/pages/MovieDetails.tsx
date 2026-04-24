import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieDetails, getMovieCast, getMovieVideos, getSimilarMovies } from "../api/tmdb";
import RatingStars from "../components/RatingStars";
import { useAuth } from "../context/AuthContext";
import { useFavourite } from "../context/FavouriteContext";
import { db } from "../firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { getMovies } from "../services/movieStore";
import { Movie } from "../types/series";
import ReviewSection from "../components/ReviewSection";
import { SkeletonDetail } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'
import ShareButton from "../components/ShareButton";

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toggleFavourite, isFavourite } = useFavourite();
  const { showToast } = useToast()
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [cast, setCast] = useState<any[]>([]);
  const [isLocal, setIsLocal] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (!id) return;

    const localMovies: Movie[] = getMovies();
    const foundLocal = localMovies.find((m) => m.id.toString() === id);

    if (foundLocal) {
      setMovie(foundLocal);
      setIsLocal(true);
      setLoading(false);
      return;
    }

    getMovieDetails(id).then((data) => {
      setMovie(data);
      setLoading(false);
    });

    getMovieCast(id).then((data) => {
      setCast(data.cast?.slice(0, 12) ?? []);
    });

    getMovieVideos(id).then((data) => {
      const trailer = data.results?.find(
        (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
      ) ?? data.results?.[0]
      if (trailer) setTrailerKey(trailer.key)
    });

    getSimilarMovies(id).then((data) => {
      setSimilarMovies(data.results?.slice(0, 6) ?? []);
    });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    async function load() {
      const ratingRef = doc(db, "ratings", `${user!.uid}_movie_${id}`);
      const snap = await getDoc(ratingRef);
      if (snap.exists()) setUserRating(snap.data().rating);

      const watchlistRef = doc(db, 'watchlist', `${user!.uid}_movie_${id}`)
      const wSnap = await getDoc(watchlistRef)
      setInWatchlist(wSnap.exists())
    }
    load();
  }, [user, id]);

  async function handleRate(rating: number) {
    if (!user || !id) return;
    const ref = doc(db, "ratings", `${user.uid}_movie_${id}`);
    await setDoc(ref, {
      uid: user.uid,
      seriesId: `movie_${id}`,
      rating,
      createdAt: new Date().toISOString(),
    });
    setUserRating(rating);
    showToast(`Rated ${rating} stars ⭐`)
  }

  function handleToggle() {
    if (!user || !id || !movie) return;
    const favorited = isFavourite(Number(id))
    toggleFavourite({
      id: Number(id),
      title: movie.title,
      image: movie.image || `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      rating: movie.rating ?? movie.vote_average / 2,
    });
    showToast(favorited ? 'Removed from favorites' : 'Added to favorites ❤️')
  }

  async function handleWatchlist() {
    if (!user || !id || !movie) return;
    const ref = doc(db, 'watchlist', `${user.uid}_movie_${id}`)
    if (inWatchlist) {
      await deleteDoc(ref)
      setInWatchlist(false)
      showToast('Removed from watchlist')
    } else {
      await setDoc(ref, {
        uid: user.uid,
        contentId: id,
        type: 'movie',
        title: movie.title,
        image: movie.image || `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        addedAt: new Date().toISOString(),
      })
      setInWatchlist(true)
      showToast('Added to watchlist 🕐')
    }
  }

  if (loading) return <SkeletonDetail />
  if (!movie) return <p className="text-center mt-10 text-white">Movie not found</p>;

  const favorited = isFavourite(Number(id));

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <img
        src={movie.image || `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        className="rounded-xl mb-6 w-full max-h-[500px] object-cover"
      />

      {/* Title + Favorite + Watchlist */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
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

<ShareButton title={movie.title || movie.name} />
            <button
              onClick={handleToggle}
              className={`text-2xl transition-transform hover:scale-110 ${
                favorited ? "text-pink-500" : "text-zinc-500"
              }`}
            >
              {favorited ? "♥" : "♡"}
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
          <RatingStars rating={movie.rating || movie.vote_average / 2} />
          <p className="text-xs text-zinc-500 mt-1">Sign in to rate this movie.</p>
        </div>
      )}

      <p className="mt-4 text-gray-400">
        {movie.overview || "No description available."}
      </p>

      {/* Movie Info */}
      {!isLocal && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {movie.release_date && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Release Date</p>
              <p className="text-sm text-white mt-1">{movie.release_date}</p>
            </div>
          )}
          {movie.runtime && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Runtime</p>
              <p className="text-sm text-white mt-1">{movie.runtime} min</p>
            </div>
          )}
          {movie.status && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="text-sm text-white mt-1">{movie.status}</p>
            </div>
          )}
          {movie.genres?.length > 0 && (
            <div className="bg-zinc-900 rounded-lg p-3 col-span-2">
              <p className="text-xs text-zinc-500">Genres</p>
              <p className="text-sm text-white mt-1">
                {movie.genres.map((g: any) => g.name).join(", ")}
              </p>
            </div>
          )}
          {movie.budget > 0 && (
            <div className="bg-zinc-900 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Budget</p>
              <p className="text-sm text-white mt-1">${movie.budget.toLocaleString()}</p>
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
                        : "/placeholder.jpg"
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

      {/* Similar Movies */}
      {!isLocal && similarMovies.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {similarMovies.map((m: any) => (
              <Link to={`/movies/${m.id}`} key={m.id}>
                <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                  <img
                    src={
                      m.poster_path
                        ? `https://image.tmdb.org/t/p/w300${m.poster_path}`
                        : '/placeholder.jpg'
                    }
                    alt={m.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{m.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ReviewSection contentId={`movie_${id}`} />
    </div>
  )
}