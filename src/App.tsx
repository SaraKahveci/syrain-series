import { BrowserRouter, Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import Home from "./pages/Home";
// import Movies from "./pages/Movies";
import Contact from "./pages/Contact";
import SeriesDetails from "./pages/SeriesDetails";
import Navbar from "./components/Navbar";
import Favorites from "./pages/Favorites";
import AddSeries from "./pages/AddSeries";
import Search from "./pages/Search";
import { FavouriteProvider } from "./context/FavouriteContext";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Actor from "./pages/Actor";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Movies from "./pages/Movies";
import AddMovie from "./pages/AddMovie";
import MovieDetails from "./pages/MovieDetails";
import Genre from "./pages/Genre";
import Genres from "./pages/Genres";

export default function App() {
  return (
    <FavouriteProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Pages */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/add-series" element={<AddSeries />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/add-movie" element={<AddMovie />} />
          <Route path="/series" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/seriesdetails" element={<SeriesDetails />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/genre/:id/:name" element={<Genre />} />
          <Route path="/genres" element={<Genres />} />
          {/* Details */}
          <Route path="/series/:id" element={<SeriesDetails />} />
          <Route path="/actor/:id" element={<Actor />} />
        </Routes>
      </BrowserRouter>
    </FavouriteProvider>
  );
}
