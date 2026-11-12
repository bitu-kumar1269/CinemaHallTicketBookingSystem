import React from 'react';

export default function ScreenOccupancyMini({ data }) {
  if (!data) return null;

  const { movieTitle, screenName, summary, seats = [] } = data;

  const getSeatDotColor = (status) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-red-500 shadow-sm';
      case 'LOCKED':
        return 'bg-amber-400 animate-pulse';
      case 'AVAILABLE':
      default:
        return 'bg-slate-700/60 hover:bg-slate-500';
    }
  };

  return (
    <div className="bg-[#121824] border border-[#243047] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Live Hall Visualizer
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">{screenName}</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {summary.occupancyRate}% Full
          </span>
        </div>

        {/* Curved Orange Screen Graphic */}
        <div className="w-full my-6 flex flex-col items-center">
          <div className="w-3/4 max-w-xs h-6 bg-gradient-to-b from-amber-500/40 to-transparent border-t-2 border-amber-500 rounded-t-[100%] shadow-[0_-4px_15px_rgba(245,158,11,0.3)] flex items-center justify-center">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-400 -mt-2">
              Screen
            </span>
          </div>
        </div>

        {/* Seat Matrix Grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-8 gap-2 p-3 bg-[#0B0F17]/80 rounded-xl border border-[#1E293B]">
            {seats.slice(0, 64).map((seat) => (
              <div
                key={seat.id}
                title={`Seat ${seat.row}${seat.number} (${seat.status})`}
                className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-pointer ${getSeatDotColor(
                  seat.status
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="mt-6 pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
          <span>Avail ({summary.available})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span>Pending ({summary.pending})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          <span>Booked ({summary.booked})</span>
        </div>
      </div>
    </div>
  );
}
