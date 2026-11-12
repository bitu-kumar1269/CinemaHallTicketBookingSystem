import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-red-500/60 hover:shadow-lg hover:-translate-y-1">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-100">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200/80 flex items-center gap-1 text-xs font-bold text-slate-900 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{movie.rating.toFixed(1)}</span>
        </div>

        {/* Certification Tag */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md border border-slate-200/80 text-[10px] font-extrabold uppercase text-slate-700 shadow-sm">
          {movie.certification}
        </div>

        {/* Format Badge at Bottom of Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-700">
          <span className="px-2 py-0.5 rounded bg-white/95 backdrop-blur-md border border-slate-200/80 font-medium shadow-sm">
            {movie.language}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/95 backdrop-blur-md border border-slate-200/80 font-medium shadow-sm">
            <Clock className="w-3 h-3 text-red-500" />
            {movie.durationMins}m
          </span>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-red-600 transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-1">
            {movie.genre}
          </p>
        </div>

        {/* Book now Button */}
        <div className="pt-4 mt-auto">
          <Link
            to={`/movies/${movie.id}`}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98] transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            Book now
          </Link>
        </div>
      </div>
    </div>
  );
}
