import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-6 text-center">
      <p className="text-8xl font-bold text-pink-600 mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-zinc-400 mb-8">The page you're looking for doesn't exist or was moved.</p>
      <Link
        to="/"
        className="bg-pink-600 hover:bg-pink-700 transition px-6 py-3 rounded-lg font-semibold"
      >
        Back to Home
      </Link>
    </div>
  )
}