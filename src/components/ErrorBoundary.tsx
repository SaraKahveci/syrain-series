import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-6 text-center">
          <p className="text-6xl mb-4">😵</p>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-zinc-400 mb-8">An unexpected error occurred. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-600 hover:bg-pink-700 transition px-6 py-3 rounded-lg font-semibold"
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}