import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ScreenOccupancyMini from '../../components/admin/ScreenOccupancyMini';
import {
  Users,
  Film,
  Ticket,
  IndianRupee,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [screenOccupancy, setScreenOccupancy] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [mRes, rRes, sRes, bRes] = await Promise.all([
          api.get('/admin/metrics'),
          api.get('/admin/revenue-chart'),
          api.get('/admin/screen-occupancy'),
          api.get('/admin/bookings?limit=5'),
        ]);

        setMetrics(mRes.data.data);
        setRevenueChart(rRes.data.data);
        setScreenOccupancy(sRes.data.data);
        setRecentBookings(bRes.data.data.bookings || []);
      } catch (err) {
        console.error('Error loading admin overview:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Viewers",
      value: metrics ? `${metrics.activeViewersToday} Viewers` : '0',
      subtitle: `${metrics?.todayBookings || 0} bookings today`,
      icon: Users,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 border-cyan-200',
    },
    {
      title: 'Total Revenue',
      value: metrics ? `₹${metrics.totalRevenue.toLocaleString()}` : '₹0',
      subtitle: `+₹${metrics?.todayRevenue || 0} today`,
      icon: IndianRupee,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
    },
    {
      title: 'Hall Occupancy',
      value: metrics ? `${metrics.occupancyRate}%` : '0%',
      subtitle: 'Average seat utilization',
      icon: Percent,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      title: 'Active Blockbusters',
      value: metrics ? `${metrics.totalMovies} Movies` : '0',
      subtitle: `Across ${metrics?.totalCinemas || 0} cinemas`,
      icon: Film,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
            Real-Time Analytics
          </span>
          <h1 className="text-2xl font-black text-white mt-0.5">Dashboard Overview</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200">
          <Calendar className="w-4 h-4 text-red-500" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${card.bg} flex items-center justify-between transition-all hover:scale-[1.02]`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {card.title}
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {card.value}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{card.subtitle}</span>
              </div>
              <div className={`p-3 rounded-xl bg-white/80 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Center 2-Column: Revenue Bars & Miniature Screen Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Revenue Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Sales Trajectory
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">Past 7 Days Revenue</h3>
            </div>
            <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" /> High Demand
            </span>
          </div>

          {/* Simple Visual CSS Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-2">
            {revenueChart.map((item, idx) => {
              const maxVal = Math.max(...revenueChart.map((r) => r.revenue), 1000);
              const heightPct = Math.max(15, Math.round((item.revenue / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{item.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg shadow-neon-red group-hover:from-red-500 group-hover:to-red-400 transition-all"
                  />
                  <span className="text-[10px] text-slate-500 font-medium">{item.date.split(',')[0]}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Aggregated confirmed ticket & snack revenue</span>
            <span className="text-white font-bold">₹{metrics?.totalRevenue || 0} Lifetime</span>
          </div>
        </div>

        {/* Right: Screen Occupancy Visualizer (5 cols) */}
        <div className="lg:col-span-5">
          <ScreenOccupancyMini data={screenOccupancy} />
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent System Bookings
          </h3>
          <span className="text-xs text-slate-400">Showing last 5 reservations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Booking Ref</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Movie</th>
                <th className="pb-3 font-semibold">Seats</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-100/50 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">{b.bookingNumber}</td>
                  <td className="py-3 text-slate-600">{b.user.fullName}</td>
                  <td className="py-3 text-slate-700 font-semibold">{b.show.movie.title}</td>
                  <td className="py-3 font-mono text-cyan-600">
                    {b.seats.map((s) => `${s.seat.rowIdentifier}${s.seat.seatNumber}`).join(', ')}
                  </td>
                  <td className="py-3 text-green-600 font-bold">₹{b.totalAmount.toFixed(2)}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-500/20 text-green-600 border border-green-500/30">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

