import { Movie } from '../types/series'

export function getMovies(): Movie[] {
  return JSON.parse(localStorage.getItem('custom-movies') || '[]')
}

export function addMovie(movie: Movie) {
  const existing = getMovies()
  localStorage.setItem('custom-movies', JSON.stringify([...existing, movie]))
}