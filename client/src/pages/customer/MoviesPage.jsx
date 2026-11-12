import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import MovieCard from '../../components/customer/MovieCard';
import { Search, Filter, Film } from 'lucide-react';

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const currentGenre = searchParams.get('genre') || '';
  const currentStatus = searchParams.get('status') || '';

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        const res = await api.get(`/movies?${queryParams.toString()}`);
        setMovies(res.data.data);
      } catch (err) {
        console.error('Error fetching movies:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleGenreClick = (genre) => {
    const newParams = new URLSearchParams(searchParams);
    if (currentGenre === genre) {
      newParams.delete('genre');
    } else {
      newParams.set('genre', genre);
    }
    setSearchParams(newParams);
  };

  const handleStatusClick = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (currentStatus === status) {
      newParams.delete('status');
    } else {
      newParams.set('status', status);
    }
    setSearchParams(newParams);
  };

  const genres = ['Action', 'Sci-Fi', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Animation', 'Fantasy'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            CineWave Catalog
          </span>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 mt-0.5">
            <Film className="w-7 h-7 text-red-600" />
            Explore Movies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse through latest theatrical blockbusters, regional cinema, and upcoming releases.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title, actor, director..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-[#121824] border border-[#243047] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </form>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-[#121824] border border-[#243047] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusClick('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !currentStatus
                ? 'bg-red-600 text-white shadow-neon-red'
                : 'bg-[#1A2333] text-slate-400 hover:text-white'
            }`}
          >
            All Movies
          </button>
          <button
            onClick={() => handleStatusClick('NOW_SHOWING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentStatus === 'NOW_SHOWING'
                ? 'bg-red-600 text-white shadow-neon-red'
                : 'bg-[#1A2333] text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => handleStatusClick('COMING_SOON')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentStatus === 'COMING_SOON'
                ? 'bg-red-600 text-white shadow-neon-red'
                : 'bg-[#1A2333] text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>

        {/* Genre Badges */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Genres:
          </span>
          {genres.map((g) => {
            const isSelected = currentGenre === g;
            return (
              <button
                key={g}
                onClick={() => handleGenreClick(g)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-[#1A2333] text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-20 text-center bg-[#121824] border border-[#243047] rounded-2xl p-10">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No movies match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, removing genre filters, or browsing other available dates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
