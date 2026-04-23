export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden animate-pulse">
      <div className="h-72 w-full bg-zinc-800" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-zinc-800 rounded w-3/4" />
        <div className="h-3 bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="w-full h-96 bg-zinc-800 rounded-xl mb-6" />
      <div className="h-8 bg-zinc-800 rounded w-1/2 mb-4" />
      <div className="h-4 bg-zinc-800 rounded w-full mb-2" />
      <div className="h-4 bg-zinc-800 rounded w-5/6 mb-2" />
      <div className="h-4 bg-zinc-800 rounded w-4/6" />
    </div>
  )
}