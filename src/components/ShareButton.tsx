import { useToast } from '../context/ToastContext'

type Props = {
  title: string
}

export default function ShareButton({ title }: Props) {
  const { showToast } = useToast()

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      await navigator.share({ title, url })
    } else {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard 🔗')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="text-sm px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-400 hover:border-zinc-400 transition"
    >
      🔗 Share
    </button>
  )
}