const BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = '255227246862979880faf00116fac593'

export async function getPopularSeries() {
  const res = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=ar&with_original_language=ar`)
  if (!res.ok) throw new Error('Failed to fetch series')
  return res.json()
}

export async function searchSeries(query: string) {
  const res = await fetch(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ar&with_original_language=ar`
  )
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export async function getSeriesDetails(id: string) {
  const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=ar`)
  if (!res.ok) throw new Error('Failed to fetch series details')
  return res.json()
}

export async function getSeriesCast(id: string) {
  const res = await fetch(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}&language=ar`)
  if (!res.ok) throw new Error('Failed to fetch cast')
  return res.json()
}

export async function getSeriesEpisodes(id: string, seasonNumber: number) {
  const res = await fetch(
    `${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=ar`
  )
  if (!res.ok) throw new Error('Failed to fetch episodes')
  return res.json()
}

export async function getSeriesByFilter(sortBy: string) {
  const res = await fetch(
    `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ar&sort_by=${sortBy}&with_original_language=ar&page=1`
  )
  if (!res.ok) throw new Error('Failed to fetch filtered series')
  return res.json()
}

export async function getActorDetails(personId: string) {
  const res = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=ar`)
  if (!res.ok) throw new Error('Failed to fetch actor details')
  return res.json()
}

export async function getActorCredits(personId: string) {
  const res = await fetch(
    `${BASE_URL}/person/${personId}/tv_credits?api_key=${API_KEY}&language=ar`
  )
  if (!res.ok) throw new Error('Failed to fetch actor credits')
  return res.json()
}

export interface TMDBSeries {
  id: number
  name: string
  poster_path: string | null
  vote_average: number
}