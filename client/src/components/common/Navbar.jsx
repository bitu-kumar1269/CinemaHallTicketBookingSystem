import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Ticket, User, LogOut, ShieldCheck, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F17]/90 backdrop-blur-md border-b border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-neon-red group-hover:scale-105 transition-transform">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider text-white">
              CINE<span className="text-red-600">WAVE</span>
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-slate-400 font-medium">
              Cinema Experience
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors hover:text-red-500 ${
              isActive('/') ? 'text-red-500 font-semibold' : 'text-slate-300'
            }`}
          >
            Home
          </Link>
          <Link
            to="/movies"
            className={`transition-colors hover:text-red-500 ${
              isActive('/movies') ? 'text-red-500 font-semibold' : 'text-slate-300'
            }`}
          >
            Movies
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-bookings"
              className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${
                isActive('/my-bookings') ? 'text-red-500 font-semibold' : 'text-slate-300'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Tickets
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-800/60 hover:bg-red-900/60 transition-all ${
                location.pathname.startsWith('/admin') ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-64">
          <input
            type="text"
            placeholder="Search movies, cast..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121824] border border-[#243047] rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        </form>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/my-bookings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121824] border border-[#243047] hover:border-slate-600 text-xs text-slate-200 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg bg-[#121824] border border-[#243047] text-slate-400 hover:text-red-500 hover:border-red-500/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-200 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-neon-red transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#121824]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0F17] border-b border-[#1E293B] px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movies, cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121824] border border-[#243047] rounded-lg py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-red-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <nav className="flex flex-col gap-3 text-sm">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-300 hover:text-red-500"
            >
              Home
            </Link>
            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-300 hover:text-red-500"
            >
              Movies
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-slate-300 hover:text-red-500"
              >
                My Tickets & Bookings
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-red-400 font-semibold"
              >
                Admin Management Console
              </Link>
            )}
          </nav>

          <div className="pt-4 border-t border-[#1E293B] flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Signed in as {user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold rounded-lg bg-[#121824] text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold rounded-lg bg-red-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
