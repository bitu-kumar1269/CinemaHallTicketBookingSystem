import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroBanner({ movies = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeMovies = movies.length > 0 ? movies : [];

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (activeMovies.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeMovies.length, isPaused, currentIndex]);

  if (activeMovies.length === 0) return null;

  const currentMovie = activeMovies[currentIndex] || activeMovies[0];

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? activeMovies.length - 1 : prev - 1));

  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % activeMovies.length);

  return (
    /*
     * Full-width wrapper — NO rounded corners, NO border, NO card background.
     * Inherits the page background (white in light mode, dark in dark mode).
     * Stretches edge-to-edge like District by Zomato.
     */
    <div
      className="relative w-full select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Very subtle full-bleed backdrop glow — low opacity, no visible box boundary */}
      <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20 transition-all duration-1000">
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt=""
          className="w-full h-full object-cover filter blur-3xl scale-110"
        />
      </div>

      {/* Inner layout — constrained width for readability, same as rest of page */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 md:py-16 min-h-[440px] md:min-h-[500px] flex items-center justify-between gap-8 md:gap-16">

        {/* Left edge arrow — positioned relative to the full-width banner */}
        <button
          onClick={handlePrev}
          aria-label="Previous movie"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Left column: Title, Cert | Genre, Description, ONE Book now button */}
        <div className="flex-1 max-w-xl pl-4 sm:pl-6 space-y-4 md:space-y-5">
          {/* Movie Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {currentMovie.title}
          </h1>

          {/* Certificate | Genre */}
          <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            {currentMovie.certification} | {currentMovie.genre}
          </p>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-5 leading-relaxed">
            {currentMovie.description}
          </p>

          {/* ONLY ONE BUTTON — full width */}
          <div className="pt-1">
            <Link
              to={`/movies/${currentMovie.id}`}
              className="flex items-center justify-center w-full px-6 py-4 rounded-xl bg-black text-white font-bold text-sm tracking-wide shadow hover:bg-slate-800 active:scale-95 transition-all"
            >
              Book now
            </Link>
          </div>
        </div>

        {/* Right column: Big poster card (card itself keeps rounded corners) */}
        <div className="shrink-0 pr-4 sm:pr-6 flex items-center justify-center">
          <div
            key={currentMovie.id}
            className="w-56 sm:w-64 md:w-72 lg:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-black"
          >
            <img
              src={currentMovie.posterUrl}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center transition-opacity duration-500"
            />
          </div>
        </div>

        {/* Right edge arrow */}
        <button
          onClick={handleNext}
          aria-label="Next movie"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white flex items-center justify-center shadow hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom center dot indicators */}
      <div className="relative z-10 pb-5 flex items-center justify-center gap-2">
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
                  : 'w-2 h-2 bg-slate-400/50 dark:bg-slate-600 hover:bg-slate-500'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
