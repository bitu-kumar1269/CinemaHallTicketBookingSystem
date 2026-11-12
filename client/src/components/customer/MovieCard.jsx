import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  return (
    <div className="group bg-[#121824] border border-[#243047] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-red-600/60 hover:shadow-neon-red hover:-translate-y-1">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-black/30" />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 flex items-center gap-1 text-xs font-bold text-amber-400">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Certification Tag */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-extrabold uppercase text-slate-300">
          {movie.certification}
        </div>

        {/* Format Badge at Bottom of Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-slate-700/50">
            {movie.language}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-slate-700/50">
            <Clock className="w-3 h-3 text-red-500" />
            {movie.durationMins}m
          </span>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-red-500 transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-1">
            {movie.genre}
          </p>
        </div>

        {/* Book now Button */}
        <div className="pt-4 mt-auto">
          <Link
            to={`/movies/${movie.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            Book now
          </Link>
        </div>
      </div>
    </div>
  );
}

