import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${query}`);
    setQuery("");
    setOpen(false);
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <nav className="w-full bg-black text-white">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-lg sm:text-xl font-bold">
            Arabic Series
          </Link>

          {/* Desktop menu */}
          <ul className="hidden md:flex gap-6 items-center">
            <li>
              <Link to="/" className="transition-colors hover:text-pink-400">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/add-series"
                className="transition-colors hover:text-pink-400"
              >
                Add Series
              </Link>
            </li>
<li>
  <Link to="/movies" className="transition-colors hover:text-pink-400">Movies</Link>
</li>
<li>
  <Link to="/add-movie" className="transition-colors hover:text-pink-400">Add Movie</Link>
</li>
            <li>
              <Link
                to="/favorites"
                className="transition-colors hover:text-pink-400"
              >
                Favorites
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="transition-colors hover:text-pink-400"
              >
                Contact
              </Link>
            </li>
            <li>
              <form onSubmit={handleSubmit}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search series..."
                  className="bg-zinc-800 px-3 py-1.5 rounded-md text-sm w-40 lg:w-56 outline-none focus:ring-2 focus:ring-pink-500"
                />
              </form>
            </li>

            {user?.email === "sarakahveci3@gmail.com" && (
              <li>
                <Link
                  to="/admin"
                  className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Admin
                </Link>
              </li>
            )}
            {user ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="text-sm text-zinc-400 hover:text-white transition-colors truncate max-w-[160px]"
                  >
                    {user.displayName ?? user.email}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="bg-pink-600 hover:bg-pink-700 transition text-sm px-4 py-2 rounded-lg font-semibold"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>

          {/* Mobile button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-sm px-3 py-2 border border-zinc-700 rounded"
          >
            Menu
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 space-y-4">
            <Link to="/" className="block">
              Home
            </Link>
            <Link to="/add-series" className="block">
              Add Series
            </Link>
            <Link to="/" className="block">
              Series
            </Link>
            <Link to="/favorites" className="block">
              Favorites
            </Link>
            <Link to="/contact" className="block">
              Contact
            </Link>

            <form onSubmit={handleSubmit}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search series..."
                className="bg-zinc-800 px-3 py-2 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-pink-500"
              />
            </form>

            {user ? (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <Link to="/profile" className="text-sm text-zinc-400 truncate">
                  {user.displayName ?? user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="block bg-pink-600 hover:bg-pink-700 transition text-sm px-4 py-2 rounded-lg font-semibold text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
