import React from 'react';
import { Play, Ticket, Star, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroBanner({ movie, onPlayTrailer, trendingMovies = [], onSelectMovie }) {
  if (!movie) return null;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#121824] border border-[#243047] shadow-2xl mb-12">
      {/* Background Backdrop with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-top filter brightness-[0.38] scale-105 transform hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Movie Info & CTAs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="px-3 py-1 rounded-full font-bold uppercase tracking-wider bg-red-600 text-white shadow-neon-red">
              Now Showing
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1A2333]/90 text-amber-400 font-semibold border border-amber-500/30 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> {movie.rating.toFixed(1)} Rating
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1A2333]/90 text-slate-300 font-medium border border-slate-700">
              {movie.certification} Certificate
            </span>
            <span className="px-3 py-1 rounded-full bg-[#1A2333]/90 text-slate-300 font-medium border border-slate-700">
              {movie.language} • IMAX & 4K
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-md">
              {movie.title}
            </h1>
            <p className="text-sm sm:text-base text-red-500 font-semibold uppercase tracking-wider">
              Watch your favorite movie on the big screen
            </p>
          </div>

          {/* Synopsis */}
          <p className="text-slate-300 text-sm sm:text-base line-clamp-3 max-w-2xl leading-relaxed">
            {movie.description}
          </p>

          {/* Meta line */}
          <div className="flex items-center gap-6 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-500" /> {movie.durationMins} mins
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-500" /> Released {new Date(movie.releaseDate).getFullYear()}
            </span>
            <span>Genre: <strong className="text-slate-200">{movie.genre}</strong></span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              to={`/movies/${movie.id}`}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wide shadow-neon-red hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Ticket className="w-5 h-5" />
              Buy Ticket
            </Link>
            <button
              onClick={() => onPlayTrailer(movie.trailerUrl)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1A2333]/90 hover:bg-[#243047] text-slate-200 hover:text-white font-semibold text-sm border border-[#243047] transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 text-red-500 fill-current" />
              Play Trailer
            </button>
          </div>
        </div>

        {/* Right Column: Trending Thumbnails Carousel Preview */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="bg-[#0B0F17]/80 backdrop-blur-md border border-[#243047] rounded-2xl p-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Trending Cinema</span>
              <span className="text-[10px] text-red-500">Fast Filling</span>
            </h3>
            <div className="space-y-3">
              {trendingMovies.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectMovie(item)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all ${
                    item.id === movie.id
                      ? 'bg-red-950/40 border-red-600/60 shadow-neon-red'
                      : 'bg-[#121824] border-[#243047] hover:border-slate-500'
                  }`}
                >
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-12 h-16 rounded-lg object-cover shrink-0 shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{item.genre}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> {item.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{item.durationMins}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
