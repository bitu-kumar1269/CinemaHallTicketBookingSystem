import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import HeroBanner from '../../components/customer/HeroBanner';
import DateFilterBar from '../../components/customer/DateFilterBar';
import MovieCard from '../../components/customer/MovieCard';
import { Sparkles, Clapperboard, Baby, Flame, Film, Compass, Film as FilmIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [featuredData, setFeaturedData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/movies/featured');
        setFeaturedData(res.data.data);
      } catch (err) {
        console.error('Failed to load featured movies:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const featuredList = featuredData?.featuredList || [];
  const nowShowing = featuredData?.nowShowing || [];
  const comingSoon = featuredData?.comingSoon || [];
  const kidsMovies = nowShowing.filter((m) => m.genre.toLowerCase().includes('animation') || m.certification === 'U');

  const genres = [
    { name: 'Action', count: '18+ Movies', icon: Flame },
    { name: 'Sci-Fi', count: '12+ Movies', icon: Sparkles },
    { name: 'Adventure', count: '15+ Movies', icon: Compass },
    { name: 'Comedy', count: '9+ Movies', icon: Clapperboard },
    { name: 'Horror', count: '6+ Movies', icon: Film },
    { name: 'Animation', count: '8+ Movies', icon: Baby },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. Big Movie Poster Carousel - Rotates Every 5 Seconds with ONLY ONE "Book now" button */}
      <HeroBanner movies={featuredList} />

      {/* 2. All Movies Section Heading matching screenshot */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          All movies
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore movies running across all cinema locations
        </p>
      </div>

      {/* 3. Interactive Date Selector Bar */}
      <DateFilterBar
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      {/* 4. Movie Grid & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Movie Cards Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">
              Now Showing in Theatres
            </span>
            <Link
              to="/movies"
              className="text-xs font-semibold text-red-500 hover:text-red-400 hover:underline"
            >
              View All ({nowShowing.length})
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {nowShowing.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>

        {/* Browse by Genre Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Curated Collections
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">Browse by Genre</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {genres.map((g) => {
              const Icon = g.icon;
              return (
                <Link
                  key={g.name}
                  to={`/movies?genre=${g.name}`}
                  className="p-4 rounded-2xl bg-[#121824] border border-[#243047] hover:border-red-600/60 hover:shadow-neon-red flex flex-col justify-between h-28 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-red-500 transition-colors">
                      {g.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">{g.count}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Special Cinema Experience Promo Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-[#121824] to-[#121824] border border-red-900/50 space-y-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-600 text-white">
              Dolby Atmos & IMAX
            </span>
            <h4 className="text-sm font-bold text-white leading-snug">
              Immerse yourself in 3D Audio and Crystal-Clear 4K Laser Projection
            </h4>
            <p className="text-xs text-slate-400">
              Enjoy luxury recliners, gourmet food delivery at your seat, and seamless mobile check-in.
            </p>
          </div>
        </div>
      </div>

      {/* 5. For Kids & Family Section */}
      {kidsMovies.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Family & Children
              </span>
              <h3 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                <Baby className="w-6 h-6 text-amber-400" />
                For Kids & Families
              </h3>
            </div>
            <Link
              to="/movies?genre=Animation"
              className="text-xs font-semibold text-amber-400 hover:underline"
            >
              See More Animated
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {kidsMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* 6. Coming Soon Section */}
      {comingSoon.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Anticipated Releases
              </span>
              <h3 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                <Sparkles className="w-6 h-6 text-red-500" />
                Coming Soon
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {comingSoon.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
