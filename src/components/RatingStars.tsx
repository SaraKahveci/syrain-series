type Props = {
  rating: number
  onRate?: (rating: number) => void
}

export default function RatingStars({ rating, onRate }: Props) {
  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          onClick={() => onRate?.(i + 1)}
          className={onRate ? 'cursor-pointer hover:scale-125 transition-transform' : ''}
        >
          {rating >= i + 1 ? '★' : '☆'}
        </span>
      ))}
      <span className="text-sm text-gray-400 ml-2">
        {rating.toFixed(1)}
      </span>
    </div>
  )
}