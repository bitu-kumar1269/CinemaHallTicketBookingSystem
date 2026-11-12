import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  XCircle,
  Film,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.data);
    } catch (err) {
      console.error('Failed to load bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDownloadPDF = async (bookingId, bookingNumber) => {
    try {
      const response = await api.get(`/tickets/${bookingId}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `ticket-${bookingNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be initiated.')) {
      return;
    }
    setActionError('');
    setActionSuccess('');
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setActionSuccess('Booking cancelled successfully and refund initiated.');
      fetchBookings();
    } catch (err) {
      setActionError(err.message || 'Cancellation failed. Policy requires at least 2 hours notice.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Account Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 mt-0.5">
            <Ticket className="w-7 h-7 text-red-600" />
            My Tickets & Bookings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your movie tickets, download digital passes, or cancel bookings.
          </p>
        </div>

        <Link
          to="/movies"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-neon-red transition-all"
        >
          Book Another Movie
        </Link>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-950/60 border border-green-600/60 text-green-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-600/60 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{actionError}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="py-20 text-center bg-[#121824] border border-[#243047] rounded-3xl p-10">
          <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No bookings found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
            You haven't reserved any tickets yet. Explore current theatrical blockbusters!
          </p>
          <Link
            to="/movies"
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-neon-red"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const show = booking.show || {};
            const movie = show.movie || {};
            const screen = show.screen || {};
            const cinema = screen.cinemaHall || {};
            const isConfirmed = booking.status === 'CONFIRMED';
            const isCancelled = booking.status === 'CANCELLED';

            const showDate = show.startTime ? new Date(show.startTime).toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) : '';

            const showTime = show.startTime ? new Date(show.startTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }) : '';

            return (
              <div
                key={booking.id}
                className="bg-[#121824] border border-[#243047] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-600 transition-colors"
              >
                {/* Left: Movie poster & details */}
                <div className="flex items-start gap-4">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-20 h-28 rounded-xl object-cover shrink-0 border border-[#243047]"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : isCancelled
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {booking.bookingNumber}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{movie.title}</h3>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {cinema.name} • {screen.screenNumber}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {showDate}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-400">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {showTime}
                      </span>
                    </div>

                    {/* Seat list */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500 font-medium">Seats:</span>
                      {booking.seats.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#1A2333] border border-[#243047] text-white text-[10px] font-mono font-bold"
                        >
                          {s.seat ? `${s.seat.rowIdentifier}${s.seat.seatNumber}` : `Seat #${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Price & Action buttons */}
                <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#1E293B]">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Total Paid</span>
                    <span className="text-xl font-black text-white">₹{booking.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => handleDownloadPDF(booking.id, booking.bookingNumber)}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Ticket PDF
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-3 py-2 rounded-xl bg-[#1A2333] hover:bg-red-950/60 border border-[#243047] hover:border-red-600 text-slate-300 hover:text-red-400 font-semibold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

