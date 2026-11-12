import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({ movies = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If only one movie or empty, handle safely
  const activeMovies = movies.length > 0 ? movies : [];

  // Auto-slide every 5 seconds (5000 ms)
  useEffect(() => {
    if (activeMovies.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeMovies.length, isPaused, currentIndex]);

  if (activeMovies.length === 0) return null;

  const currentMovie = activeMovies[currentIndex] || activeMovies[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeMovies.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeMovies.length);
  };

  return (
    <div
      className="relative w-full mb-12 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Outer Banner Card Container with Ambient Blur */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-100 via-slate-200/80 to-slate-100 dark:from-[#111722] dark:via-[#161F2E] dark:to-[#111722] border border-slate-200 dark:border-[#223047] shadow-xl transition-all duration-700">
        {/* Soft Background Glow matching movie poster */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
          <img
            src={currentMovie.backdropUrl || currentMovie.posterUrl}
            alt=""
            className="w-full h-full object-cover filter blur-3xl scale-125 transform transition-all duration-1000"
          />
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-10 md:py-14 min-h-[440px] md:min-h-[480px] flex items-center justify-between gap-8 md:gap-12">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous movie"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Left Column: Movie Info & ONLY ONE "Book now" Button */}
          <div className="flex-1 max-w-2xl pl-6 sm:pl-8 space-y-4 md:space-y-5 animate-fadeIn">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {currentMovie.title}
            </h1>

            {/* Tagline / Certificate | Genre */}
            <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              {currentMovie.certification} | {currentMovie.genre}
            </p>

            {/* Synopsis Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed font-normal">
              {currentMovie.description}
            </p>

            {/* ONLY ONE BUTTON: Book now */}
            <div className="pt-2">
              <Link
                to={`/movies/${currentMovie.id}`}
                className="inline-flex items-center justify-center px-9 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-bold text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                Book now
              </Link>
            </div>
          </div>

          {/* Right Column: Big Movie Poster Card */}
          <div className="pr-6 sm:pr-8 shrink-0 flex items-center justify-center">
            <div className="relative group">
              <div className="w-60 sm:w-72 md:w-80 lg:w-[340px] aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200/60 dark:border-slate-700/60 bg-black transition-all duration-500 transform group-hover:scale-[1.02]">
                <img
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  key={currentMovie.id}
                  className="w-full h-full object-cover object-center animate-fadeIn"
                />
              </div>
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            aria-label="Next movie"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Center Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {activeMovies.map((m, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={m.id || index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-7 h-2 bg-slate-900 dark:bg-white shadow'
                    : 'w-2 h-2 bg-slate-400/60 dark:bg-slate-600 hover:bg-slate-500'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
