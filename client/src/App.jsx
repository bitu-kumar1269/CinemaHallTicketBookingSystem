import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import MoviesPage from './pages/customer/MoviesPage';
import MovieDetailPage from './pages/customer/MovieDetailPage';
import SeatBookingPage from './pages/customer/SeatBookingPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import ManageMovies from './pages/admin/ManageMovies';
import ManageCinemas from './pages/admin/ManageCinemas';
import ManageShows from './pages/admin/ManageShows';
import ManageBookings from './pages/admin/ManageBookings';
import VerifyTicket from './pages/admin/VerifyTicket';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F17] text-slate-100 font-sans">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/booking/:showId" element={<SeatBookingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking-success/:bookingId"
            element={
              <ProtectedRoute>
                <BookingSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="movies" element={<ManageMovies />} />
            <Route path="cinemas" element={<ManageCinemas />} />
            <Route path="shows" element={<ManageShows />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="verify-qr" element={<VerifyTicket />} />
          </Route>

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="max-w-md mx-auto py-24 text-center">
                <h1 className="text-4xl font-black text-white">404</h1>
                <p className="text-sm text-slate-400 mt-2">The requested cinema page was not found.</p>
                <a href="/" className="mt-4 inline-block text-xs font-bold text-red-500 hover:underline">
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
