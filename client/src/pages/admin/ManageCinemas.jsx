import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import { Building2, Plus, MapPin, Tv, Shield } from 'lucide-react';

export default function ManageCinemas() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cinemaModalOpen, setCinemaModalOpen] = useState(false);
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');

  const [cinemaForm, setCinemaForm] = useState({
    name: '',
    city: '',
    address: '',
    state: '',
    pinCode: '',
  });

  const [screenForm, setScreenForm] = useState({
    screenNumber: 'Screen 1',
    soundSystem: 'Dolby Atmos 7.1.4',
  });

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cinemas');
      setCinemas(res.data.data);
    } catch (err) {
      console.error('Failed to load cinemas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleCreateCinema = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cinemas', cinemaForm);
      setCinemaModalOpen(false);
      fetchCinemas();
    } catch (err) {
      alert('Failed to add cinema: ' + err.message);
    }
  };

  const handleCreateScreen = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cinemas/screens', {
        cinemaHallId: selectedCinemaId,
        screenNumber: screenForm.screenNumber,
        soundSystem: screenForm.soundSystem,
      });
      setScreenModalOpen(false);
      fetchCinemas();
    } catch (err) {
      alert('Failed to add screen: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Locations & Screens
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Cinema Theatres & Screens</h1>
          <p className="text-xs text-slate-400">
            Configure multiplex complexes, screen projection formats, and seat layouts.
          </p>
        </div>

        <button
          onClick={() => {
            setCinemaForm({ name: '', city: '', address: '', state: '', pinCode: '' });
            setCinemaModalOpen(true);
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-neon-red flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Cinema Branch
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cinemas.map((cinema) => (
            <div
              key={cinema.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-red-950/60 border border-red-800/40 text-red-600 font-bold text-[10px] uppercase">
                    {cinema.city}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {cinema.screens.length} Screens
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{cinema.name}</h3>

                <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{cinema.address}, {cinema.state} - {cinema.pinCode}</span>
                </p>

                {/* Screens List */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Configured Screens
                  </span>
                  <div className="space-y-1.5">
                    {cinema.screens.map((screen) => (
                      <div
                        key={screen.id}
                        className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Tv className="w-3.5 h-3.5 text-cyan-600" />
                          <span className="font-bold text-slate-700">{screen.screenNumber}</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-medium">
                          {screen.soundSystem}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Screen Trigger */}
              <button
                onClick={() => {
                  setSelectedCinemaId(cinema.id);
                  setScreenForm({ screenNumber: `Screen ${cinema.screens.length + 1}`, soundSystem: 'Dolby Atmos 7.1' });
                  setScreenModalOpen(true);
                }}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Screen to this Cinema
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Cinema Modal */}
      <Modal
        isOpen={cinemaModalOpen}
        onClose={() => setCinemaModalOpen(false)}
        title="Add Cinema Hall Location"
      >
        <form onSubmit={handleCreateCinema} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Cinema Name
            </label>
            <input
              type="text"
              placeholder="PVR INOX Palladium"
              value={cinemaForm.name}
              onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
              required
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">City</label>
              <input
                type="text"
                placeholder="Mumbai"
                value={cinemaForm.city}
                onChange={(e) => setCinemaForm({ ...cinemaForm, city: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">State</label>
              <input
                type="text"
                placeholder="Maharashtra"
                value={cinemaForm.state}
                onChange={(e) => setCinemaForm({ ...cinemaForm, state: e.target.value })}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Street Address</label>
            <input
              type="text"
              placeholder="Senapati Bapat Marg, Lower Parel"
              value={cinemaForm.address}
              onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })}
              required
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Pin Code</label>
            <input
              type="text"
              placeholder="400013"
              value={cinemaForm.pinCode}
              onChange={(e) => setCinemaForm({ ...cinemaForm, pinCode: e.target.value })}
              required
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCinemaModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-neon-red"
            >
              Save Cinema
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Screen Modal */}
      <Modal
        isOpen={screenModalOpen}
        onClose={() => setScreenModalOpen(false)}
        title="Add Screen & Generate Layout"
      >
        <form onSubmit={handleCreateScreen} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Screen Number / Audi Name
            </label>
            <input
              type="text"
              placeholder="Audi 3 (IMAX)"
              value={screenForm.screenNumber}
              onChange={(e) => setScreenForm({ ...screenForm, screenNumber: e.target.value })}
              required
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Sound System & Visual Format
            </label>
            <select
              value={screenForm.soundSystem}
              onChange={(e) => setScreenForm({ ...screenForm, soundSystem: e.target.value })}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
            >
              <option value="Dolby Atmos 7.1.4">Dolby Atmos 7.1.4</option>
              <option value="IMAX 12-Channel Laser">IMAX 12-Channel Laser</option>
              <option value="4DX Motion Dynamics">4DX Motion Dynamics</option>
              <option value="Dolby 7.1 Surround">Dolby 7.1 Surround</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-1">Automated Seat Layout</span>
            <span>
              Generates 64 seats (Rows A-B: Recliner luxury tiers, Rows C-E: Premium mid-tiers, Rows F-H: Regular tiers).
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScreenModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-neon-red"
            >
              Generate Screen & Seats
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

