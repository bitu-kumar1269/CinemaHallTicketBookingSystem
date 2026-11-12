import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  Ticket,
  User,
  LogOut,
  ShieldCheck,
  Search,
  Menu,
  X,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Gurugram, Haryana');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  const cities = ['Gurugram, Haryana', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'New Delhi, Delhi'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navTabs = [
    { name: 'For you', path: '/' },
    { name: 'Dining', path: '/#dining' },
    { name: 'Movies', path: '/', isSpecial: true },
    { name: 'Events', path: '/#events' },
    { name: 'Comedy', path: '/#comedy' },
    { name: 'Stores', path: '/#stores' },
    { name: 'Activities', path: '/#activities' },
    { name: 'Play', path: '/#play' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Brand Logo + Location Indicator */}
        <div className="flex items-center gap-6 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black shadow transition-transform group-hover:scale-105">
              <Film className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                district
              </span>
              <span className="block text-[8px] font-bold tracking-widest uppercase text-slate-400 -mt-1">
                by cinewave
              </span>
            </div>
          </Link>

          {/* Location Picker Pill */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#161F2E] transition-colors"
            >
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <div className="text-left leading-tight">
                <span className="block font-bold text-slate-900 dark:text-white text-xs">
                  {selectedCity.split(',')[0]}
                </span>
                <span className="block text-[10px] text-slate-400 font-normal">
                  {selectedCity.split(',')[1]}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {cityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#121824] border border-slate-200 dark:border-[#243047] rounded-xl shadow-2xl py-1 z-50">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-[#1A2333] transition-colors ${
                      selectedCity === city ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: District Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
          {navTabs.map((tab) => {
            const isMovies = tab.name === 'Movies';
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  isMovies
                    ? 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121824]'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Tickets & User Profile */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-64 animate-fadeIn">
              <input
                type="text"
                autoFocus
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => !searchQuery && setSearchOpen(false)}
                className="w-full bg-slate-100 dark:bg-[#121824] border border-slate-300 dark:border-[#243047] rounded-full py-1.5 pl-8 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#121824] text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Admin link if Admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-900/40"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {/* My Tickets if Authenticated */}
          {isAuthenticated && (
            <Link
              to="/my-bookings"
              title="My Bookings"
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#121824] text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Ticket className="w-4 h-4 text-red-500" />
            </Link>
          )}

          {/* User Profile Avatar / Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/my-bookings"
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#1A2333] border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white hover:scale-105 transition-transform"
                title={user.fullName}
              >
                {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title="Sign In"
            >
              <User className="w-4 h-4" />
            </Link>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#121824]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0B0F17] border-b border-slate-200 dark:border-[#1E293B] px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#121824] border border-slate-300 dark:border-[#243047] rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-slate-100"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2">
            {navTabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-[#121824] text-slate-700 dark:text-slate-300 text-center"
              >
                {tab.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
            <span className="text-slate-400">{selectedCity}</span>
            {isAuthenticated ? (
              <button onClick={logout} className="text-red-500 font-bold">
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="text-red-500 font-bold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
