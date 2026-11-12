import React from 'react';
import { Film, Heart, Shield, Award, HelpCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080B10] border-t border-[#1A2333] pt-16 pb-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand statement */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Film className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-wider text-white">
              CINE<span className="text-red-600">WAVE</span>
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Next-generation cinema ticketing with real-time seat locks, 4K Dolby Atmos screens, contactless QR check-in, and instant digital delivery.
          </p>
          <div className="flex items-center gap-3 pt-2 text-slate-500">
            <span className="inline-flex items-center gap-1 text-[11px] bg-[#121824] px-2.5 py-1 rounded-md border border-[#243047]">
              <Shield className="w-3.5 h-3.5 text-green-400" /> 256-Bit SSL Encrypted
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-[#121824] px-2.5 py-1 rounded-md border border-[#243047]">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Authorized Partner
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Navigation</h4>
          <ul className="space-y-2.5">
            <li><a href="/" className="hover:text-red-500 transition-colors">Now Showing</a></li>
            <li><a href="/movies?status=COMING_SOON" className="hover:text-red-500 transition-colors">Coming Soon</a></li>
            <li><a href="/movies?genre=Action" className="hover:text-red-500 transition-colors">IMAX Experience</a></li>
            <li><a href="/my-bookings" className="hover:text-red-500 transition-colors">Track Booking</a></li>
            <li><a href="/admin" className="hover:text-red-500 transition-colors">Cinema Partner Portal</a></li>
          </ul>
        </div>

        {/* Theatres & Experience */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">CineWave Theatres</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>PVR INOX Phoenix Palladium, Mumbai</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Director's Cut Forum Rex, Bengaluru</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Cinepolis VIP DLF Avenue, Delhi</span>
            </li>
            <li className="pt-2 text-[11px] text-slate-500">
              Featuring Dolby Atmos 7.1.4, IMAX Laser, & Luxury Recliners.
            </li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Help & Support</h4>
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Toll Free: 1800-419-WAVE (9 AM - 11 PM)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>support@cinewave.com</span>
            </li>
            <li><a href="#" className="hover:text-red-500 transition-colors">Cancellation & Refund Policy</a></li>
            <li><a href="#" className="hover:text-red-500 transition-colors">Terms of Service & Privacy</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#161F2E] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026 CineWave Entertainment Technologies Ltd. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3 h-3 text-red-600 fill-current" /> for cinematic excellence.
        </p>
      </div>
    </footer>
  );
}

