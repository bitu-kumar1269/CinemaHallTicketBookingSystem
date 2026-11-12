import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import HeroBanner from '../../components/customer/HeroBanner';
import DateFilterBar from '../../components/customer/DateFilterBar';
import MovieCard from '../../components/customer/MovieCard';
import TrailerModal from '../../components/customer/TrailerModal';
import { Sparkles, Clapperboard, Baby, Flame, Film, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [featuredData, setFeaturedData] = useState(null);
  const [currentHero, setCurrentHero] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [trailerState, setTrailerState] = useState({ isOpen: false, url: '', title: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/movies/featured');
        setFeaturedData(res.data.data);
        setCurrentHero(res.data.data.hero);
      } catch (err) {
        console.error('Failed to load featured movies:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handlePlayTrailer = (url, title) => {
    setTrailerState({ isOpen: true, url, title });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Cinematic Hero Banner */}
      {currentHero && (
        <HeroBanner
          movie={currentHero}
          onPlayTrailer={(url) => handlePlayTrailer(url, currentHero.title)}
          trendingMovies={featuredData?.featuredList || []}
          onSelectMovie={(movie) => setCurrentHero(movie)}
        />
      )}

      {/* 2. Interactive Date Selector Bar */}
      <DateFilterBar
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      {/* 3. Main Grid: Now Showing & Browse by Genre */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Now Showing Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                In Theatres Now
              </span>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                <Clapperboard className="w-6 h-6 text-red-600" />
                Now Showing
              </h2>
            </div>
            <Link
              to="/movies"
              className="text-xs font-semibold text-red-500 hover:text-red-400 hover:underline"
            >
              View All ({nowShowing.length})
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {nowShowing.slice(0, 6).map((movie) => (
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
            <h2 className="text-xl font-bold text-white mt-0.5">Browse by Genre</h2>
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
            <h3 className="text-sm font-bold text-white leading-snug">
              Immerse yourself in 3D Audio and Crystal-Clear 4K Laser Projection
            </h3>
            <p className="text-xs text-slate-400">
              Enjoy luxury recliners, gourmet food delivery at your seat, and seamless mobile check-in.
            </p>
          </div>
        </div>
      </div>

      {/* 4. For Kids & Family Section */}
      {kidsMovies.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Family & Children
              </span>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                <Baby className="w-6 h-6 text-amber-400" />
                For Kids & Families
              </h2>
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

      {/* 5. Coming Soon Section */}
      {comingSoon.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Anticipated Releases
              </span>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
                <Sparkles className="w-6 h-6 text-red-500" />
                Coming Soon to CineWave
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {comingSoon.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerState.isOpen}
        onClose={() => setTrailerState({ isOpen: false, url: '', title: '' })}
        trailerUrl={trailerState.url}
        movieTitle={trailerState.title}
      />
    </div>
  );
}
