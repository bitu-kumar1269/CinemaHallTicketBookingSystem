import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import HeroBanner from '../../components/customer/HeroBanner';
import MovieCard from '../../components/customer/MovieCard';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';

export default function HomePage() {
  const [featuredData, setFeaturedData] = useState(null);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active filter state
  const [activeFilterPill, setActiveFilterPill] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, allMoviesRes] = await Promise.all([
          api.get('/movies/featured'),
          api.get('/movies'),
        ]);
        setFeaturedData(featuredRes.data.data);
        setAllMovies(allMoviesRes.data.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const featuredList = featuredData?.featuredList || [];

  // Filter options matching Screenshot 1
  const filterPills = [
    { id: 'Hindi', label: 'Hindi' },
    { id: 'English', label: 'English' },
    { id: 'New Releases', label: 'New Releases' },
    { id: 'Re-Releases', label: 'Re-Releases' },
    { id: '3D', label: '3D' },
    { id: '3D SCREEN X', label: '3D SCREEN X' },
  ];

  const handlePillClick = (pillId) => {
    if (activeFilterPill === pillId) {
      setActiveFilterPill(null);
    } else {
      setActiveFilterPill(pillId);
    }
  };

  // Filtered movies calculation
  const displayedMovies = useMemo(() => {
    let result = [...allMovies];

    // Pill filters
    if (activeFilterPill === 'Hindi') {
      result = result.filter((m) => m.language === 'Hindi');
    } else if (activeFilterPill === 'English') {
      result = result.filter((m) => m.language === 'English');
    } else if (activeFilterPill === 'New Releases') {
      result = result.filter((m) => m.status === 'NOW_SHOWING');
    } else if (activeFilterPill === 'Re-Releases') {
      result = result.filter((m) => m.status === 'COMING_SOON' || m.certification === 'A');
    } else if (activeFilterPill === '3D') {
      result = result.filter((m) => m.genre.includes('Action') || m.genre.includes('Sci-Fi') || m.genre.includes('Animation'));
    } else if (activeFilterPill === '3D SCREEN X') {
      result = result.filter((m) => m.genre.includes('Action') || m.genre.includes('Epic') || m.genre.includes('Adventure'));
    }

    // Modal/advanced filters if applied
    if (selectedLanguage) {
      result = result.filter((m) => m.language === selectedLanguage);
    }
    if (selectedGenre) {
      result = result.filter((m) => m.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    }

    return result;
  }, [allMovies, activeFilterPill, selectedLanguage, selectedGenre]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const allLanguages = ['Hindi', 'English', 'Tamil'];
  const allGenres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Fantasy', 'Animation', 'Crime', 'Horror'];

  return (
    <div className="bg-white min-h-screen text-slate-900">
      {/* 1. Full-width Hero Carousel */}
      <HeroBanner movies={featuredList} />

      {/* 2. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">
        {/* Section Heading: "All movies" */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            All movies
          </h2>
        </div>

        {/* Filter Pills Bar matching Screenshot 1 */}
        <div className="relative mb-8">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {/* Filter Dropdown Toggle Button */}
            <button
              onClick={() => setFilterModalOpen(!filterModalOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                filterModalOpen || selectedLanguage || selectedGenre
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {/* Filter Pills */}
            {filterPills.map((pill) => {
              const isActive = activeFilterPill === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handlePillClick(pill.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all shrink-0 border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-sm'
                      : 'bg-white text-slate-800 border-slate-300 font-normal hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}

            {/* Clear Filters Button if any filter is active */}
            {(activeFilterPill || selectedLanguage || selectedGenre) && (
              <button
                onClick={() => {
                  setActiveFilterPill(null);
                  setSelectedLanguage('');
                  setSelectedGenre('');
                }}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium underline ml-2 shrink-0"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filters Dropdown Card */}
          {filterModalOpen && (
            <div className="absolute left-0 top-12 z-30 w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Filter By</span>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Language selection */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">Language</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedLanguage('')}
                    className={`px-3 py-1 rounded-lg text-xs border ${
                      selectedLanguage === ''
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  {allLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang === selectedLanguage ? '' : lang)}
                      className={`px-3 py-1 rounded-lg text-xs border ${
                        selectedLanguage === lang
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre selection */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-2">Genre</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGenre('')}
                    className={`px-3 py-1 rounded-lg text-xs border ${
                      selectedGenre === ''
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </button>
                  {allGenres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(g === selectedGenre ? '' : g)}
                      className={`px-3 py-1 rounded-lg text-xs border ${
                        selectedGenre === g
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedLanguage('');
                    setSelectedGenre('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 underline"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Movie Grid matching 6-column layout in Screenshot 1 */}
        {displayedMovies.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 border border-slate-200 rounded-2xl p-10">
            <h3 className="text-base font-bold text-slate-800">No movies match this filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try selecting another language or clear the active filter to view all titles.
            </p>
            <button
              onClick={() => {
                setActiveFilterPill(null);
                setSelectedLanguage('');
                setSelectedGenre('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {displayedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
