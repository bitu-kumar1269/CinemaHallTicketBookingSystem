import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Ticket, Search, Filter, Calendar, Clock, MapPin } from 'lucide-react';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/bookings${query}`);
      setBookings(res.data.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Transactions & Reservations
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">Customer Bookings</h1>
          <p className="text-xs text-slate-400">
            Real-time ledger of all ticket bookings, payment statuses, and allocated seats.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              !statusFilter ? 'bg-red-600 text-white' : 'bg-[#121824] text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-[#121824] text-slate-400'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              statusFilter === 'CANCELLED' ? 'bg-red-950 text-red-400' : 'bg-[#121824] text-slate-400'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[#121824] border border-[#243047] rounded-2xl p-12 text-center text-slate-400">
          <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">No bookings found</p>
        </div>
      ) : (
        <div className="bg-[#121824] border border-[#243047] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0B0F17] border-b border-[#1E293B] text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Booking Ref</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Movie & Cinema</th>
                  <th className="py-3 px-4 font-semibold">Showtime</th>
                  <th className="py-3 px-4 font-semibold">Seats</th>
                  <th className="py-3 px-4 font-semibold">Paid Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1A2333]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {b.bookingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{b.user.fullName}</div>
                      <span className="text-[10px] text-slate-500">{b.user.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{b.show.movie.title}</div>
                      <span className="text-[10px] text-slate-400">
                        {b.show.screen.cinemaHall.name} ({b.show.screen.screenNumber})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="font-bold text-amber-400">
                        {new Date(b.show.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(b.show.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">
                      {b.seats.map((s) => `${s.seat.rowIdentifier}${s.seat.seatNumber}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-green-400">
                      ₹{b.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'CONFIRMED'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : b.status === 'CANCELLED'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

