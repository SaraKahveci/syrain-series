import { useState } from 'react'
import { auth } from '../firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-pink-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-pink-500"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 transition rounded-lg py-3 font-semibold"
          >
            {loading
              ? 'Processing…'
              : mode === 'login'
              ? 'Login'
              : 'Register'}
          </button>

        </form>

        <button
          onClick={() =>
            setMode(mode === 'login' ? 'register' : 'login')
          }
          className="mt-6 text-sm text-zinc-400 hover:text-white w-full"
        >
          {mode === 'login'
            ? 'Create an account'
            : 'Already have an account? Login'}
        </button>

      </div>
    </div>
  )
}
