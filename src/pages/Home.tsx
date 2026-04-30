import { useEffect, useState, useMemo } from "react";
import {
  getNowPlayingSeries,
  getSeriesByFilter,
} from "../api/tmdb";
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
  original_language: string;
};

type Filter = "all" | "top_rated" | "newest" | "local" | "now_playing";

const isArabic = (item: TMDBItem) =>
  item.original_language === "ar" ||
  /[\u0600-\u06FF]/.test(item.name);

export default function Home() {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [filtered, setFiltered] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("now_playing");
  const [communityRatings, setCommunityRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tmdbData, ratingsSnap] = await Promise.all([
          getNowPlayingSeries(),
          getDocs(collection(db, "ratings")),
        ]);

        const ratingsMap: Record<string, number[]> = {};

        ratingsSnap.docs.forEach((d) => {
          const data = d.data() as {
            seriesId: string;
            rating: number;
          };

          if (!ratingsMap[data.seriesId]) {
            ratingsMap[data.seriesId] = [];
          }

          ratingsMap[data.seriesId].push(data.rating);
        });

        const avgRatings: Record<string, number> = {};

        Object.entries(ratingsMap).forEach(([id, arr]) => {
          avgRatings[id] = arr.reduce((a, b) => a + b, 0) / arr.length;
        });

        setCommunityRatings(avgRatings);

        const apiSeries = tmdbData.results
          .filter(isArabic)
          .map((item: TMDBItem): Series => ({
            id: item.id,
            title: item.name,
            image: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/placeholder.jpg",
            rating:
              avgRatings[item.id.toString()] ?? item.vote_average / 2,
          }));

        const localSeries = getSeries();
        const combined = [...localSeries, ...apiSeries];

        setAllSeries(combined);
        setFiltered(apiSeries);
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
    const sortMap: Record<string, string> = {
      top_rated: "vote_average.desc",
      newest: "first_air_date.desc",
    };

    const loadFiltered = async () => {
      if (filter === "all") {
        setFiltered(allSeries);
        return;
      }

      if (filter === "local") {
        setFiltered(allSeries.filter((s) => s.id >= 1_000_000_000));
        return;
      }

      if (filter === "now_playing") {
        setLoading(true);
        const data = await getNowPlayingSeries();

        const series = data.results
          .filter(isArabic)
          .map((item: TMDBItem): Series => ({
            id: item.id,
            title: item.name,
            image: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "/placeholder.jpg",
            rating:
              communityRatings[item.id.toString()] ??
              item.vote_average / 2,
          }));

        setFiltered(series);
        setLoading(false);
        return;
      }

      setLoading(true);

      const data = await getSeriesByFilter(sortMap[filter]);

      const series = data.results
        .filter(isArabic)
        .map((item: TMDBItem): Series => ({
          id: item.id,
          title: item.name,
          image: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "/placeholder.jpg",
          rating:
            communityRatings[item.id.toString()] ??
            item.vote_average / 2,
        }));

      setFiltered(series);
      setLoading(false);
    };

    loadFiltered();
  }, [filter, allSeries, communityRatings]);

  const displayedSeries = useMemo(() => {
    if (filter === "all") return allSeries;

    if (filter === "local") {
      return allSeries.filter((s) => s.id >= 1_000_000_000);
    }

    return filtered;
  }, [filter, allSeries, filtered]);

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
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { key: "now_playing", label: "📺 Now Playing" },
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

      {Object.keys(communityRatings).length > 0 && (
        <p className="text-sm text-zinc-200 mb-4 bg-zinc-600 px-2 py-1 rounded-md inline-block">
          ⭐ Ratings shown include community scores where available
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedSeries.map((series) => (
          <SeriesCard key={series.id} {...series} />
        ))}
      </div>

      {displayedSeries.length === 0 && (
        <p className="text-zinc-500 text-center mt-10">
          No series found.
        </p>
      )}
    </div>
  );
}