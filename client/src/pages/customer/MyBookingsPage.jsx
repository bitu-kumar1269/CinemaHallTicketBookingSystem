import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Ticket, Calendar, Clock, MapPin, Download, XCircle, Film, CheckCircle2, AlertCircle } from 'lucide-react';

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

  useEffect(() => { fetchBookings(); }, []);

  const handleDownloadPDF = async (bookingId, bookingNumber) => {
    try {
      const response = await api.get(`/tickets/${bookingId}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `ticket-${bookingNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('Failed to generate PDF: ' + err.message); }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be initiated.')) return;
    setActionError(''); setActionSuccess('');
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setActionSuccess('Booking cancelled successfully and refund initiated.');
      fetchBookings();
    } catch (err) { setActionError(err.message || 'Cancellation failed. Policy requires at least 2 hours notice.'); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Account Management</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
            <Ticket className="w-7 h-7 text-red-600" />
            My Tickets & Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage your movie tickets, download digital passes, or cancel bookings.</p>
        </div>
        <Link to="/movies" className="self-start sm:self-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition-all">
          Book Another Movie
        </Link>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" /><span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" /><span>{actionError}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
          <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
            You haven't reserved any tickets yet. Explore current theatrical blockbusters!
          </p>
          <Link to="/movies" className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow">Explore Movies</Link>
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

            const showDate = show.startTime ? new Date(show.startTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
            const showTime = show.startTime ? new Date(show.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-colors shadow-sm">
                <div className="flex items-start gap-4">
                  <img src={movie.posterUrl} alt={movie.title} className="w-20 h-28 rounded-xl object-cover shrink-0 border border-slate-200" />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isConfirmed ? 'bg-green-50 text-green-600 border border-green-200'
                          : isCancelled ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>{booking.status}</span>
                      <span className="text-[11px] font-mono text-slate-400">{booking.bookingNumber}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{movie.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />{cinema.name} • {screen.screenNumber}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{showDate}</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-600"><Clock className="w-3.5 h-3.5 text-amber-500" />{showTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Seats:</span>
                      {booking.seats.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                          {s.seat ? `${s.seat.rowIdentifier}${s.seat.seatNumber}` : `Seat #${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Total Paid</span>
                    <span className="text-xl font-black text-slate-900">₹{booking.totalAmount.toFixed(2)}</span>
                  </div>
                  {isConfirmed && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleDownloadPDF(booking.id, booking.bookingNumber)}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all">
                        <Download className="w-3.5 h-3.5" />Ticket PDF
                      </button>
                      <button onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-2 rounded-xl bg-white hover:bg-red-50 border border-slate-200 hover:border-red-400 text-slate-600 hover:text-red-600 font-semibold text-xs flex items-center gap-1.5 transition-all">
                        <XCircle className="w-3.5 h-3.5" />Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
