import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Film, Plus, Edit2, Trash2, Star, Clock } from 'lucide-react';

export default function ManageMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action / Sci-Fi',
    language: 'English',
    durationMins: 120,
    releaseDate: new Date().toISOString().slice(0, 10),
    director: '',
    cast: '',
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    certification: 'UA',
    status: 'NOW_SHOWING',
    isFeatured: false,
  });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movies');
      setMovies(res.data.data);
    } catch (err) {
      console.error('Failed to load movies:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      genre: 'Action / Sci-Fi',
      language: 'English',
      durationMins: 120,
      releaseDate: new Date().toISOString().slice(0, 10),
      director: '',
      cast: '',
      rating: 8.5,
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      certification: 'UA',
      status: 'NOW_SHOWING',
      isFeatured: false,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      language: movie.language,
      durationMins: movie.durationMins,
      releaseDate: movie.releaseDate.slice(0, 10),
      director: movie.director,
      cast: movie.cast,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl,
      certification: movie.certification,
      status: movie.status,
      isFeatured: movie.isFeatured,
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await api.delete(`/movies/${id}`);
      fetchMovies();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie.id}`, formData);
      } else {
        await api.post('/movies', formData);
      }
      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Catalog Management
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">Manage Movies</h1>
          <p className="text-xs text-slate-400">
            Add theatrical titles, update movie posters, synopses, and trailer links.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-neon-red flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Movie</th>
                  <th className="py-3 px-4 font-semibold">Genre & Lang</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movies.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-100/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-10 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{m.title}</h4>
                          <span className="text-[10px] text-slate-400">Director: {m.director}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{m.genre}</div>
                      <span className="text-[10px] text-slate-500">{m.language}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        {m.durationMins}m
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {m.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'NOW_SHOWING'
                            ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                            : 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#243047] text-slate-600 hover:text-slate-900"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMovie ? 'Edit Movie Details' : 'Add New Movie Title'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950 text-red-600 text-xs">{errorMsg}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Movie Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Director
              </label>
              <input
                type="text"
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Description / Synopsis
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Genre
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Language
              </label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Duration (Mins)
              </label>
              <input
                type="number"
                value={formData.durationMins}
                onChange={(e) => setFormData({ ...formData, durationMins: parseInt(e.target.value, 10) })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Poster Image URL
              </label>
              <input
                type="url"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Trailer URL (YouTube)
              </label>
              <input
                type="url"
                value={formData.trailerUrl}
                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="NOW_SHOWING">NOW SHOWING</option>
                <option value="COMING_SOON">COMING SOON</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Certificate
              </label>
              <select
                value={formData.certification}
                onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="U">U (Universal)</option>
                <option value="UA">UA (Parental Guidance)</option>
                <option value="A">A (Adults Only)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Featured Banner
              </label>
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 bg-slate-100 border-slate-200"
                  />
                  <span>Hero Spotlight</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-neon-red"
            >
              {submitting ? 'Saving...' : editingMovie ? 'Update Movie' : 'Create Movie'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

