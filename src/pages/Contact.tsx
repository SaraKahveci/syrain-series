import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log(form)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Contact</h1>
          <p className="text-zinc-400 mt-3">
            For questions, feedback, or collaboration inquiries.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-pink-500 resize-none"
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 transition rounded-lg py-3 font-semibold"
            >
              Send Message
            </button>

          </form>
        </div>

        {/* Extra info */}
        <div className="text-center text-zinc-500 text-sm mt-8">
          <p>Or reach out via social platforms.</p>
        </div>

      </div>
    </div>
  )
}
