import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Film, Building2, CalendarDays, Ticket, QrCode, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Movies', path: '/admin/movies', icon: Film },
    { name: 'Cinemas & Screens', path: '/admin/cinemas', icon: Building2 },
    { name: 'Show Schedules', path: '/admin/shows', icon: CalendarDays },
    { name: 'Bookings & Sales', path: '/admin/bookings', icon: Ticket },
    { name: 'QR Gate Scanner', path: '/admin/verify-qr', icon: QrCode },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] p-4 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Cinema Management</span>
          <h2 className="text-base font-extrabold text-slate-900 mt-0.5">Admin Console</h2>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Site</span>
        </Link>
      </div>
    </aside>
  );
}
