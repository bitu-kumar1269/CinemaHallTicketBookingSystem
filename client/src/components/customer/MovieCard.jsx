import React from 'react';
import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  if (!movie) return null;

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group flex flex-col cursor-pointer transition-all"
    >
      {/* Poster Image with clean rounded corners */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200/60 group-hover:shadow-md transition-all duration-300">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Movie Details below poster matching District / screenshot 1 */}
      <div className="pt-2 px-0.5">
        <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-black">
          {movie.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {movie.certification || 'U'} | {movie.language || 'Hindi'}
        </p>

        {/* Clean Book now action button */}
        <button
          type="button"
          className="mt-2 w-full py-1.5 px-3 rounded-xl bg-slate-900 group-hover:bg-black text-white text-xs font-semibold shadow-sm active:scale-95 transition-all flex items-center justify-center"
        >
          Book now
        </button>
      </div>
    </Link>
  );
}
