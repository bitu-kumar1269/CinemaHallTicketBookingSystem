import React from 'react';
import { Calendar } from 'lucide-react';

export default function DateFilterBar({ selectedDate, onSelectDate }) {
  // Generate next 7 days starting from today
  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    let dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (i === 0) dayLabel = 'Today';
    else if (i === 1) dayLabel = 'Tomorrow';

    const dateNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const isoDate = d.toISOString().slice(0, 10);

    days.push({
      isoDate,
      dayLabel,
      dateNum,
      monthName,
    });
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-500" />
          Select Showtime Date
        </h3>
        <span className="text-xs text-slate-400">Instant seat availability</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {days.map((item) => {
          const isSelected = selectedDate === item.isoDate;
          return (
            <button
              key={item.isoDate}
              onClick={() => onSelectDate(item.isoDate)}
              className={`flex flex-col items-center justify-center min-w-[90px] py-3 px-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-red-600 border-red-500 text-white shadow-md scale-105'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
              }`}
            >
              <span className={`text-[11px] font-medium uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                {item.dayLabel}
              </span>
              <span className="text-xl font-black mt-0.5 leading-tight">{item.dateNum}</span>
              <span className={`text-[10px] ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                {item.monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

