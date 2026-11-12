import React from 'react';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';

export default function SnackSelector({ snacks = [], selectedSnacks = {}, onUpdateQuantity }) {
  if (!snacks || snacks.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-red-500" />
          Add Snacks & Beverages
        </h3>
        <span className="text-xs text-amber-600 font-semibold">Pre-order & skip queue</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {snacks.map((snack) => {
          const qty = selectedSnacks[snack.id] || 0;
          return (
            <div
              key={snack.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                qty > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <img src={snack.imageUrl} alt={snack.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{snack.name}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">{snack.description}</p>
                <span className="text-xs font-extrabold text-red-600 mt-0.5 block">₹{snack.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shrink-0">
                <button type="button" onClick={() => onUpdateQuantity(snack.id, Math.max(0, qty - 1))}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30" disabled={qty === 0}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-4 text-center text-slate-800">{qty}</span>
                <button type="button" onClick={() => onUpdateQuantity(snack.id, qty + 1)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
