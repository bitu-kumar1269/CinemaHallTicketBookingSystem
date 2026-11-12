import React from 'react';
import { Armchair, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export default function SeatGrid({
  rows = [],
  selectedSeats = [],
  onToggleSeat,
  onProceedToCheckout,
  showDetails,
  lockTimer,
}) {
  const getSeatColorClass = (seat) => {
    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);

    if (isSelected) {
      return 'bg-cyan-400 text-black border-cyan-300 shadow-neon-cyan font-bold scale-110 z-10';
    }

    if (seat.status === 'BOOKED') {
      return 'bg-[#18202F] text-slate-600 border-[#1E293B] cursor-not-allowed opacity-50';
    }

    if (seat.status === 'LOCKED') {
      if (seat.isLockedByMe) {
        return 'bg-amber-500 text-black border-amber-400 animate-pulse font-bold';
      }
      return 'bg-amber-950/60 text-amber-500 border-amber-800/80 cursor-not-allowed';
    }

    // Available seat styles by category
    switch (seat.category) {
      case 'RECLINER':
        return 'bg-[#131B29] text-amber-300 border-amber-600/40 hover:border-amber-400 hover:bg-[#1E293B]';
      case 'PREMIUM':
        return 'bg-[#131B29] text-purple-300 border-purple-600/40 hover:border-purple-400 hover:bg-[#1E293B]';
      case 'REGULAR':
      default:
        return 'bg-[#131B29] text-slate-300 border-[#243047] hover:border-slate-400 hover:bg-[#1E293B]';
    }
  };

  const totalPrice = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Curved Cinema Screen Graphic */}
      <div className="w-full mb-12 flex flex-col items-center">
        <div className="w-4/5 sm:w-3/4 max-w-xl screen-curve relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-red-500 font-extrabold">
            Cinema Screen
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 font-medium">All eyes this way</p>
      </div>

      {/* Seating Grid */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[500px] flex flex-col items-center gap-3">
          {rows.map((rowGroup) => (
            <div key={rowGroup.row} className="flex items-center gap-3">
              {/* Left Row Identifier */}
              <span className="w-6 text-center text-xs font-bold text-slate-500">
                {rowGroup.row}
              </span>

              {/* Seat Buttons in this Row */}
              <div className="flex items-center gap-2 sm:gap-2.5">
                {rowGroup.seats.map((seat) => {
                  const isClickable = seat.status === 'AVAILABLE' || selectedSeats.some((s) => s.seatId === seat.seatId);
                  return (
                    <button
                      key={seat.seatId}
                      disabled={!isClickable}
                      onClick={() => onToggleSeat(seat)}
                      title={`Seat ${seat.row}${seat.number} (${seat.category}) - ₹${seat.price}`}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-xs flex items-center justify-center transition-all ${getSeatColorClass(
                        seat
                      )}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              {/* Right Row Identifier */}
              <span className="w-6 text-center text-xs font-bold text-slate-500">
                {rowGroup.row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Category & Status Legend */}
      <div className="w-full mt-6 py-4 px-6 rounded-2xl bg-[#121824] border border-[#243047] flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-[#243047] bg-[#131B29]" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-cyan-400 border border-cyan-300 shadow-neon-cyan" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/60 border border-amber-600 text-amber-400" />
          <span>Temporarily Held</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#18202F] border border-[#1E293B] opacity-50" />
          <span>Booked</span>
        </div>
        <div className="h-4 w-px bg-slate-700 hidden sm:block" />
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Recliner: <strong className="text-amber-400">₹504</strong></span>
          <span>Premium: <strong className="text-purple-400">₹378</strong></span>
          <span>Regular: <strong className="text-slate-200">₹280</strong></span>
        </div>
      </div>

      {/* Floating Bottom Dock for Selected Seats & Action */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-[#121824]/95 backdrop-blur-xl border border-red-600/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Selected Seats ({selectedSeats.length})
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {selectedSeats.map((s) => (
                  <span
                    key={s.seatId}
                    className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold text-xs"
                  >
                    {s.row}{s.number}
                  </span>
                ))}
              </div>
            </div>

            {lockTimer && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/50 border border-amber-600/40 text-amber-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{lockTimer}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Subtotal</span>
              <span className="text-xl font-black text-white">₹{totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-neon-red transition-all active:scale-[0.98]"
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

