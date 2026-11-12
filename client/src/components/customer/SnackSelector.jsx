import React from 'react';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';

export default function SnackSelector({ snacks = [], selectedSnacks = {}, onUpdateQuantity }) {
  if (!snacks || snacks.length === 0) return null;

  return (
    <div className="bg-[#121824] border border-[#243047] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-red-500" />
          Add Snacks & Beverages
        </h3>
        <span className="text-xs text-amber-400 font-semibold">Pre-order & skip cinema queue</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {snacks.map((snack) => {
          const qty = selectedSnacks[snack.id] || 0;
          return (
            <div
              key={snack.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                qty > 0 ? 'bg-red-950/20 border-red-600/50' : 'bg-[#1A2333]/70 border-[#243047]'
              }`}
            >
              <img
                src={snack.imageUrl}
                alt={snack.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{snack.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{snack.description}</p>
                <span className="text-xs font-extrabold text-red-400 mt-0.5 block">
                  ₹{snack.price.toFixed(2)}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-[#0B0F17] border border-[#243047] rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(snack.id, Math.max(0, qty - 1))}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E293B] disabled:opacity-30"
                  disabled={qty === 0}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-4 text-center text-white">{qty}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(snack.id, qty + 1)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E293B]"
                >
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
