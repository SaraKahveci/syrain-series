import { useState } from 'react'
import emailjs from '@emailjs/browser'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    try {
      await emailjs.send(
        'service_sa4m2em',
        'template_90luone',
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        'AoYdN8wbPnhHyLvBl'
      )

      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Contact</h1>
          <p className="text-zinc-400 mt-3">
            Send a message directly.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-60 transition rounded-lg py-3 font-semibold"
            >
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>

            {status === 'sent' && (
              <p className="text-green-400 text-sm">Message sent successfully.</p>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-sm">Failed to send. Check configuration.</p>
            )}

          </form>
        </div>

      </div>
    </div>
  )
}
