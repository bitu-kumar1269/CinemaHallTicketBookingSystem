import React from 'react';
import { Download, Calendar, Clock, MapPin, Film, ShieldCheck } from 'lucide-react';

export default function TicketCard({ booking, qrDataUrl, onDownloadPDF }) {
  if (!booking) return null;

  const show = booking.show || {};
  const movie = show.movie || {};
  const screen = show.screen || {};
  const cinema = screen.cinemaHall || {};
  const seats = booking.seats || [];

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
    <div className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-amber-400 via-amber-300 to-amber-400 text-slate-900 rounded-3xl overflow-hidden shadow-xl p-1 border border-amber-300">
      {/* Outer Card Shell with Perforated Notch Simulation */}
      <div className="bg-white rounded-[22px] overflow-hidden text-slate-900 flex flex-col justify-between">
        {/* Ticket Header & Poster */}
        <div className="relative h-44 overflow-hidden bg-slate-100">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
          
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 font-bold uppercase text-[10px] tracking-wider text-white shadow-sm">
              CineWave Pass
            </span>
            <span className="font-mono text-amber-700 font-bold text-[11px] bg-white/90 px-2 py-0.5 rounded border border-amber-300 shadow-sm">
              {booking.ticket?.ticketCode || 'TCK-CONFIRMED'}
            </span>
          </div>

          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="text-lg font-black text-slate-900 line-clamp-1">
              {movie.title}
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              {movie.language} • {movie.certification} • {screen.soundSystem || 'Dolby Atmos'}
            </p>
          </div>
        </div>

        {/* Perforation Divider Line */}
        <div className="relative flex items-center justify-between px-3 py-2 bg-slate-50 border-y border-dashed border-slate-200">
          <div className="w-5 h-5 rounded-full bg-amber-400 -ml-5 border-r border-slate-200" />
          <div className="flex-1 border-b border-dashed border-slate-300 mx-2" />
          <div className="w-5 h-5 rounded-full bg-amber-400 -mr-5 border-l border-slate-200" />
        </div>

        {/* Ticket Details */}
        <div className="p-5 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                Date
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                {showDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                Time
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {showTime}
              </span>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Cinema & Screen
            </span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {cinema.name}
            </span>
            <span className="text-[11px] text-slate-500">
              {screen.screenNumber} • {cinema.city}
            </span>
          </div>

          {/* Allocated Seats Chips */}
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold mb-1">
              Allocated Seats ({seats.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {seats.map((s, idx) => {
                const seatName = s.name || (s.seat ? `${s.seat.rowIdentifier}${s.seat.seatNumber}` : `Seat #${idx + 1}`);
                return (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-xs"
                  >
                    {seatName}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Amount Paid</span>
            <span className="text-base font-black text-green-600">₹{booking.totalAmount?.toFixed(2)}</span>
          </div>

          {/* QR Code Container */}
          <div className="pt-2 flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                <img src={qrDataUrl} alt="Ticket QR" className="w-28 h-28 object-contain" />
              </div>
            ) : (
              <div className="w-28 h-28 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-mono">
                [ QR Code ]
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-2 font-mono tracking-wider">
              Scan for contactless turnstile entry
            </span>
          </div>

          {/* Download Action Button */}
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
