import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-white mt-16">
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold mb-2">Arabic Series</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your go-to destination for Arabic series and movies. Discover, rate, and review the best Arabic content.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">Navigate</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/" className="hover:text-pink-400 transition-colors">Home</Link></li>
              <li><Link to="/movies" className="hover:text-pink-400 transition-colors">Movies</Link></li>
              <li><Link to="/genres" className="hover:text-pink-400 transition-colors">Genres</Link></li>
              <li><Link to="/favorites" className="hover:text-pink-400 transition-colors">Favorites</Link></li>
              <li><Link to="/profile" className="hover:text-pink-400 transition-colors">Profile</Link></li>
              <li><Link to="/contact" className="hover:text-pink-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-4">Follow Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://instagram.com/thefamoussara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors"
                >
                  <span className="text-lg">📸</span>
                  @thefamoussara
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/sara-kahveci/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors"
                >
                  <span className="text-lg">💼</span>
                  sarakahveci
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/sarakahveci"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-pink-400 transition-colors"
                >
                  <span className="text-lg">🐙</span>
                  sarakahveci
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Arabic Series. All rights reserved.</p>
          <p>Built with ❤️ by Sara Kahveci</p>
        </div>
      </div>
    </footer>
  )
}