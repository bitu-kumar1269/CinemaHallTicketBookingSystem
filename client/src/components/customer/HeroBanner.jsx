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
    <div
      className="relative w-full select-none overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle backdrop glow */}
      <div className="absolute inset-0 pointer-events-none opacity-10 transition-all duration-1000">
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt=""
          className="w-full h-full object-cover filter blur-3xl scale-110"
        />
      </div>

      {/* Main hero inner container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-8 md:py-12 min-h-[440px] md:min-h-[480px] flex items-center justify-between gap-8 md:gap-16">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous movie"
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Left column: Title, Cert | Genre, Description, 100% Book now button */}
        <div className="flex-1 max-w-xl pl-4 sm:pl-6 space-y-4 md:space-y-5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {currentMovie.title}
          </h1>

          <p className="text-base sm:text-lg font-bold text-slate-700">
            {currentMovie.certification} | {currentMovie.genre}
          </p>

          <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed">
            {currentMovie.description}
          </p>

          {/* 100% full width Book now button */}
          <div className="pt-2">
            <Link
              to={`/movies/${currentMovie.id}`}
              className="flex items-center justify-center w-full px-6 py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
            >
              Book now
            </Link>
          </div>
        </div>

        {/* Right column: Big movie poster card */}
        <div className="shrink-0 pr-4 sm:pr-6 flex items-center justify-center">
          <div
            key={currentMovie.id}
            className="w-56 sm:w-64 md:w-72 lg:w-[310px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100"
          >
            <img
              src={currentMovie.posterUrl}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center transition-opacity duration-500"
            />
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          aria-label="Next movie"
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom center dots */}
      <div className="relative z-10 pb-2 flex items-center justify-center gap-2">
        {activeMovies.map((m, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={m.id || index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? 'w-7 h-2 bg-slate-900 shadow-sm'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
