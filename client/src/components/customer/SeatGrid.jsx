import React from 'react';
import { Clock } from 'lucide-react';

export default function SeatGrid({ rows = [], selectedSeats = [], onToggleSeat, onProceedToCheckout, showDetails, lockTimer }) {
  const getSeatColorClass = (seat) => {
    const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
    if (isSelected) return 'bg-red-600 text-white border-red-500 shadow-md font-bold scale-110 z-10';
    if (seat.status === 'BOOKED') return 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-60';
    if (seat.status === 'LOCKED') {
      if (seat.isLockedByMe) return 'bg-amber-400 text-black border-amber-300 animate-pulse font-bold';
      return 'bg-amber-100 text-amber-600 border-amber-200 cursor-not-allowed';
    }
    switch (seat.category) {
      case 'RECLINER': return 'bg-amber-50 text-amber-700 border-amber-300 hover:border-amber-500 hover:bg-amber-100';
      case 'PREMIUM':  return 'bg-purple-50 text-purple-700 border-purple-300 hover:border-purple-500 hover:bg-purple-100';
      case 'REGULAR':
      default:         return 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100';
    }
  };

  const totalPrice = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Cinema Screen Graphic */}
      <div className="w-full mb-12 flex flex-col items-center">
        <div className="w-4/5 sm:w-3/4 max-w-xl screen-curve relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase text-red-500 font-extrabold">
            Cinema Screen
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 font-medium">All eyes this way</p>
      </div>

      {/* Seating Grid */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[500px] flex flex-col items-center gap-3">
          {rows.map((rowGroup) => (
            <div key={rowGroup.row} className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-bold text-slate-400">{rowGroup.row}</span>
              <div className="flex items-center gap-2 sm:gap-2.5">
                {rowGroup.seats.map((seat) => {
                  const isClickable = seat.status === 'AVAILABLE' || selectedSeats.some((s) => s.seatId === seat.seatId);
                  return (
                    <button
                      key={seat.seatId}
                      disabled={!isClickable}
                      onClick={() => onToggleSeat(seat)}
                      title={`Seat ${seat.row}${seat.number} (${seat.category}) - ₹${seat.price}`}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-xs flex items-center justify-center transition-all ${getSeatColorClass(seat)}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
              <span className="w-6 text-center text-xs font-bold text-slate-400">{rowGroup.row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full mt-6 py-4 px-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-slate-200 bg-slate-50" /><span>Available</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-600 border border-red-500" /><span>Selected</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-100 border border-amber-300" /><span>Temporarily Held</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-100 border border-slate-200 opacity-60" /><span>Booked</span></div>
        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
        <div className="flex items-center gap-3 text-[11px]">
          <span>Recliner: <strong className="text-amber-600">₹504</strong></span>
          <span>Premium: <strong className="text-purple-600">₹378</strong></span>
          <span>Regular: <strong className="text-slate-700">₹280</strong></span>
        </div>
      </div>

      {/* Floating Dock */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Selected Seats ({selectedSeats.length})</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {selectedSeats.map((s) => (
                  <span key={s.seatId} className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-xs">
                    {s.row}{s.number}
                  </span>
                ))}
              </div>
            </div>
            {lockTimer && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" /><span>{lockTimer}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Subtotal</span>
              <span className="text-xl font-black text-slate-900">₹{totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={onProceedToCheckout}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow transition-all active:scale-[0.98]">
              Proceed to Pay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
