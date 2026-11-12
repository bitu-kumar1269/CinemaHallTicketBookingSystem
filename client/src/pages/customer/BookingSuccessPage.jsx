import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import TicketCard from '../../components/customer/TicketCard';
import { CheckCircle2, Ticket, Home, Download } from 'lucide-react';

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#E50914', '#F59E0B', '#00E5FF', '#10B981'] });

    const fetchConfirmedTicket = async () => {
      try {
        const res = await api.get(`/tickets/${bookingId}`);
        setTicketData(res.data.data);
      } catch (err) {
        console.error('Failed to load confirmed ticket:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConfirmedTicket();
  }, [bookingId]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`/tickets/${bookingId}/download`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `ticket-${ticketData?.booking?.bookingNumber || 'cinewave'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate PDF ticket: ' + err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      {/* Confirmation Badge */}
      <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 border border-green-200 mb-4 animate-bounce">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Booking Confirmed!</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        Your payment was verified and seats are booked. Your ticket with digital QR code is ready below.
      </p>

      <div className="my-10">
        <TicketCard booking={ticketData?.booking} qrDataUrl={ticketData?.qrDataUrl} onDownloadPDF={handleDownloadPDF} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm transition-all"
        >
          <Ticket className="w-4 h-4 text-red-500" />
          View in My Bookings
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Movies
        </Link>
      </div>
    </div>
  );
}
