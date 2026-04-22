import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getActorDetails, getActorCredits } from '../api/tmdb'

export default function Actor() {
  const { id } = useParams()
  const [actor, setActor] = useState<any>(null)
  const [credits, setCredits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function load() {
      const [actorData, creditsData] = await Promise.all([
        getActorDetails(id!),
        getActorCredits(id!)
      ])
      setActor(actorData)
      const sorted = (creditsData.cast ?? [])
        .filter((c: any) => c.poster_path)
        .sort((a: any, b: any) => b.vote_average - a.vote_average)
        .slice(0, 20)
      setCredits(sorted)
      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>
  if (!actor) return <p className="text-center mt-10 text-white">Actor not found</p>

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      {/* Actor info */}
      <div className="flex gap-6 mb-10 bg-zinc-900 rounded-2xl p-6">
        <img
          src={
            actor.profile_path
              ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
              : '/placeholder.jpg'
          }
          alt={actor.name}
          className="w-40 h-52 object-cover rounded-xl shrink-0"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{actor.name}</h1>

          {actor.birthday && (
            <p className="text-sm text-zinc-400 mb-1">
              Born: {new Date(actor.birthday).toLocaleDateString()}
              {actor.place_of_birth && ` — ${actor.place_of_birth}`}
            </p>
          )}

          {actor.deathday && (
            <p className="text-sm text-zinc-400 mb-1">
              Died: {new Date(actor.deathday).toLocaleDateString()}
            </p>
          )}

          {actor.known_for_department && (
            <p className="text-sm text-zinc-400 mb-3">
              Known for: {actor.known_for_department}
            </p>
          )}

          {actor.biography && (
            <p className="text-sm text-zinc-300 leading-relaxed line-clamp-6">
              {actor.biography || 'No biography available.'}
            </p>
          )}
        </div>
      </div>

      {/* Known works */}
      <h2 className="text-xl font-bold mb-4">Known Works</h2>
      {credits.length === 0 ? (
        <p className="text-zinc-500 text-sm">No works found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {credits.map((c: any) => (
            <Link to={`/series/${c.id}`} key={c.id}>
              <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
                <img
                  src={`https://image.tmdb.org/t/p/w300${c.poster_path}`}
                  alt={c.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{c.name}</p>
                  {c.character && (
                    <p className="text-xs text-zinc-500 truncate">as {c.character}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}