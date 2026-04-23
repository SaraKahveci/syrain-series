import { useEffect, useState } from "react";
import { getPopularSeries, getSeriesByFilter } from "../api/tmdb";
import SeriesCard from "../components/SeriesCard";
import { getSeries } from "../services/seriesStore";
import { Series } from "../types/series";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { SkeletonCard } from "../components/Skeleton";

type TMDBItem = {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date: string;
};

type Filter = "all" | "top_rated" | "newest" | "local";

export default function Home() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [filtered, setFiltered] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [communityRatings, setCommunityRatings] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tmdbData, ratingsSnap] = await Promise.all([
          getPopularSeries(),
          getDocs(collection(db, "ratings")),
        ]);

        const ratingsMap: Record<string, number[]> = {};
        ratingsSnap.docs.forEach((d) => {
          const { seriesId, rating } = d.data();
          if (!ratingsMap[seriesId]) ratingsMap[seriesId] = [];
          ratingsMap[seriesId].push(rating);
        });
        const avgRatings: Record<string, number> = {};
        Object.entries(ratingsMap).forEach(([id, arr]) => {
          avgRatings[id] = arr.reduce((a, b) => a + b, 0) / arr.length;
        });
        setCommunityRatings(avgRatings);

        const apiSeries = tmdbData.results.map(
          (item: TMDBItem): Series & { releaseDate?: string } => ({
            id: item.id,
            title: item.name,
            image: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/placeholder.jpg",
            rating: avgRatings[item.id.toString()] ?? item.vote_average / 2,
            releaseDate: item.first_air_date,
          })
        );

        const localSeries = getSeries();
        const combined = [...localSeries, ...apiSeries];
        setAllSeries(combined);
        setFiltered(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const onStorage = () => loadData();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFiltered(allSeries);
      return;
    }

    if (filter === "local") {
      setFiltered(allSeries.filter((s: any) => s.id >= 1_000_000_000));
      return;
    }

    const sortMap: Record<string, string> = {
      top_rated: "vote_average.desc",
      newest: "first_air_date.desc",
    };

    setLoading(true);
    getSeriesByFilter(sortMap[filter])
      .then((data) => {
        const series = data.results.map(
          (item: TMDBItem): Series => ({
            id: item.id,
            title: item.name,
            image: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/placeholder.jpg",
            rating:
              communityRatings[item.id.toString()] ?? item.vote_average / 2,
          })
        );
        setFiltered(series);
      })
      .finally(() => setLoading(false));
  }, [filter, allSeries]);

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  return (
    <div className="p-6">
      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { key: "all", label: "🎬 All" },
          { key: "top_rated", label: "⭐ Top Rated" },
          { key: "newest", label: "🆕 Newest" },
          { key: "local", label: "📁 Added by Us" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as Filter)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === f.key
                ? "bg-pink-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Community ratings notice */}
      {Object.keys(communityRatings).length > 0 && (
        <p className="text-xs text-zinc-500 mb-4">
          ⭐ Ratings shown include community scores where available
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((series) => (
          <SeriesCard key={series.id} {...series} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-zinc-500 text-center mt-10">No series found.</p>
      )}
    </div>
  );
}
