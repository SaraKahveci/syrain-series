import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'
import { useFavourite } from '../context/FavouriteContext'
import { Series } from '../types/series'

type Props = Series

export default function SeriesCard(props: Props) {
  const { id, title, image, rating } = props
  const { toggleFavourite, isFavourite } = useFavourite()

  const imgSrc = image && image !== '' ? image : '/placeholder.jpg'

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition">
      <Link to={`/series/${id}`}>
        <img
          src={imgSrc}
          alt={title}
          className="h-72 w-full object-cover"
        />
      </Link>

      <div className="p-4">
        <h3 className="font-bold text-white first-letter:uppercase text-lg">
          {title}
        </h3>

        <RatingStars rating={rating} />

        <button
          onClick={() => toggleFavourite(props)}
          className="mt-2 text-pink-400"
        >
          {isFavourite(id) ? '♥ Remove' : '♡ Add to favorites'}
        </button>
      </div>
    </div>
  )
}