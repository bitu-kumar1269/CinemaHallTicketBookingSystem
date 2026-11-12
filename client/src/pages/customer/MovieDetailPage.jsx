import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TrailerModal from '../../components/customer/TrailerModal';
import {
  Star,
  Clock,
  Calendar,
  Play,
  MapPin,
  Film,
  Sparkles,
  Ticket,
  ChevronRight,
} from 'lucide-react';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      setLoading(true);
      try {
        const [movieRes, showsRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/shows?movieId=${id}&date=${selectedDate}`),
        ]);
        setMovie(movieRes.data.data);
        setShows(showsRes.data.data);
      } catch (err) {
        console.error('Failed to load movie details:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieAndShows();
  }, [id, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Movie not found</h2>
        <Link to="/" className="text-red-500 text-sm mt-3 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  // Group shows by Cinema Hall
  const cinemasMap = {};
  for (const s of shows) {
    const cinemaId = s.screen.cinemaHall.id;
    if (!cinemasMap[cinemaId]) {
      cinemasMap[cinemaId] = {
        cinema: s.screen.cinemaHall,
        shows: [],
      };
    }
    cinemasMap[cinemaId].shows.push(s);
  }
  const groupedCinemas = Object.values(cinemasMap);

  // 7-day pill generation
  const dateTabs = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dateTabs.push({
      iso: d.toISOString().slice(0, 10),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    });
  }

  return (
    <div>
      {/* 1. Backdrop Hero Section */}
      <div className="relative min-h-[420px] bg-slate-900 overflow-hidden flex items-end">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/70 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          {/* Movie Poster */}
          <div className="w-44 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#243047] shadow-2xl shrink-0 -mb-16 md:mb-0 z-20 bg-black">
            <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
              <span className="px-3 py-0.5 rounded-full bg-red-600 text-white font-bold uppercase shadow-neon-red">
                {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-black/60 border border-amber-500/40 text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> {movie.rating.toFixed(1)} / 10
              </span>
              <span className="px-3 py-0.5 rounded-full bg-black/60 border border-slate-700 text-slate-300 font-semibold">
                {movie.certification}
              </span>
              <span className="px-3 py-0.5 rounded-full bg-black/60 border border-slate-700 text-slate-300 font-semibold">
                {movie.language}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-red-500" /> {movie.durationMins} minutes
              </span>
              <span>•</span>
              <span>{movie.genre}</span>
              <span>•</span>
              <span>Director: <strong className="text-white">{movie.director}</strong></span>
            </p>

            {/* Play Trailer CTA */}
            <div className="pt-2 flex justify-center md:justify-start">
              <button
                onClick={() => setTrailerOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A2333] hover:bg-[#243047] text-white text-xs font-bold border border-[#243047] transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 text-red-500 fill-current" />
                Play Official Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Body: Synopsis, Cast & Showtimes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Synopsis & Cast (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121824] border border-[#243047] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {movie.description}
              </p>

              <div className="pt-4 border-t border-[#1E293B] space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Starring Cast</span>
                  <span className="text-slate-200 font-medium">{movie.cast}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Theatrical Release</span>
                  <span className="text-slate-200 font-medium">
                    {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Date Selector & Scheduled Shows (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                Book Tickets
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">Select Date & Showtime</h2>
            </div>

            {/* Date Pill Selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {dateTabs.map((tab) => {
                const isSelected = selectedDate === tab.iso;
                return (
                  <button
                    key={tab.iso}
                    onClick={() => setSelectedDate(tab.iso)}
                    className={`flex flex-col items-center justify-center min-w-[80px] py-2.5 px-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-red-600 border-red-500 text-white shadow-neon-red'
                        : 'bg-[#121824] border-[#243047] text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">{tab.label}</span>
                    <span className="text-lg font-black leading-tight mt-0.5">{tab.dateNum}</span>
                    <span className="text-[10px] opacity-80">{tab.month}</span>
                  </button>
                );
              })}
            </div>

            {/* Cinema Theatres & Shows List */}
            {groupedCinemas.length === 0 ? (
              <div className="bg-[#121824] border border-[#243047] rounded-2xl p-8 text-center text-slate-400">
                <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  No shows scheduled for {new Date(selectedDate).toDateString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Please select another date above or check back shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedCinemas.map(({ cinema, shows: cinemaShows }) => (
                  <div
                    key={cinema.id}
                    className="bg-[#121824] border border-[#243047] rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-[#1E293B]">
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">{cinema.name}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {cinema.address}, {cinema.city}
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-500">Contactless QR Entry</span>
                    </div>

                    {/* Showtime Pills */}
                    <div className="flex flex-wrap items-center gap-3">
                      {cinemaShows.map((show) => {
                        const timeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <button
                            key={show.id}
                            onClick={() => navigate(`/booking/${show.id}`)}
                            className="group p-3 rounded-xl bg-[#1A2333] border border-[#243047] hover:border-red-500 hover:bg-red-950/20 text-left transition-all hover:scale-105 active:scale-95"
                          >
                            <span className="text-sm font-bold text-white group-hover:text-red-400 block">
                              {timeStr}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {show.screen.screenNumber}
                            </span>
                            <span className="text-[10px] text-amber-400 font-semibold block mt-1">
                              From ₹{show.basePrice.toFixed(0)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        movieTitle={movie.title}
      />
    </div>
  );
}
