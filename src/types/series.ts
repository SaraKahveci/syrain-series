export type Comment = {
  id: string
  email: string
  seriesID: string
  text: string
  createdAt: string
}

export interface Series {
  id: number
  title: string
  image: string
  rating: number
}

export interface Movie {
  id: number
  title: string
  image: string
  rating: number
  type: 'movie'
}

export type TmdbItem = {
  id: number
  name: string
  poster_path: string | null
  vote_average: number
}