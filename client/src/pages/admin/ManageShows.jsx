import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { CalendarDays, Plus, Clock, MapPin, Film, IndianRupee } from 'lucide-react';

export default function ManageShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    movieId: '',
    screenId: '',
    startTime: '',
    basePrice: 280,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [showsRes, moviesRes, cinemasRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies?status=NOW_SHOWING'),
        api.get('/cinemas'),
      ]);

      setShows(showsRes.data.data);
      setMovies(moviesRes.data.data);
      setCinemas(cinemasRes.data.data);
    } catch (err) {
      console.error('Failed to load shows:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenSchedule = () => {
    // Default to tomorrow 6:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);

    const firstMovie = movies[0]?.id || '';
    const firstScreen = cinemas[0]?.screens[0]?.id || '';

    setForm({
      movieId: firstMovie,
      screenId: firstScreen,
      startTime: tomorrow.toISOString().slice(0, 16),
      basePrice: 280,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/shows', {
        movieId: form.movieId,
        screenId: form.screenId,
        startTime: new Date(form.startTime).toISOString(),
        basePrice: parseFloat(form.basePrice),
      });
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Scheduling failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Scheduling & Showtimes
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">Show Schedules</h1>
          <p className="text-xs text-slate-400">
            Schedule theatrical slots and initialize seat pricing tiers across screens.
          </p>
        </div>

        <button
          onClick={handleOpenSchedule}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-neon-red flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule New Show
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#121824] border border-[#243047] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0B0F17] border-b border-[#1E293B] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Movie</th>
                  <th className="py-3 px-4 font-semibold">Cinema & Screen</th>
                  <th className="py-3 px-4 font-semibold">Date & Showtime</th>
                  <th className="py-3 px-4 font-semibold">Base Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {shows.map((show) => {
                  const showDate = new Date(show.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  });
                  const showTime = new Date(show.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={show.id} className="hover:bg-[#1A2333]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={show.movie.posterUrl}
                            alt={show.movie.title}
                            className="w-10 h-14 rounded-lg object-cover border border-[#243047] shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-white text-sm">{show.movie.title}</h4>
                            <span className="text-[10px] text-slate-400">
                              {show.movie.durationMins} mins • {show.movie.language}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-semibold text-white">{show.screen.cinemaHall.name}</div>
                        <span className="text-[10px] text-slate-400">
                          {show.screen.screenNumber} • {show.screen.soundSystem}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {showTime}
                        </div>
                        <span className="text-[10px] text-slate-500">{showDate}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        ₹{show.basePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30">
                          {show.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Schedule Movie Showtime"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950 text-red-400 text-xs">{errorMsg}</div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Select Movie Title
            </label>
            <select
              value={form.movieId}
              onChange={(e) => setForm({ ...form, movieId: e.target.value })}
              required
              className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3 py-2 text-xs text-white"
            >
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.language})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Cinema Screen
            </label>
            <select
              value={form.screenId}
              onChange={(e) => setForm({ ...form, screenId: e.target.value })}
              required
              className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3 py-2 text-xs text-white"
            >
              {cinemas.map((c) =>
                c.screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {c.name} - {s.screenNumber} ({s.soundSystem})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
                className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Base Regular Seat Price (₹)
              </label>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                required
                className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1A2333] border border-[#243047] text-xs text-slate-300">
            <span className="font-bold text-white block mb-0.5">Automated Tier Multipliers</span>
            <span>Premium: 1.35x (₹{Math.round(form.basePrice * 1.35)}) • Recliner: 1.8x (₹{Math.round(form.basePrice * 1.8)})</span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1A2333] text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-neon-red"
            >
              {submitting ? 'Initializing...' : 'Confirm Show'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

