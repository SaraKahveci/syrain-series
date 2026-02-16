import { BrowserRouter, Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import Home from "./pages/Home";
// import Movies from "./pages/Movies";
import Contact from './pages/Contact'
import SeriesDetails from "./pages/SeriesDetails";
import Navbar from "./components/Navbar";
import Favorites from "./pages/Favorites";
import AddSeries from "./pages/AddSeries";
import Search from "./pages/Search";
import { FavouriteProvider } from "./context/FavouriteContext";
export default function App() {
  return (
    <FavouriteProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
           {/* Pages */}
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/add-series" element={<AddSeries />} />
          <Route path="/series" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/seriesdetails" element={<SeriesDetails />} />
          {/* Details */}
          <Route path="/series/:id" element={<SeriesDetails />} />
        </Routes>
      </BrowserRouter>
    </FavouriteProvider>
  );
}
