import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import SeatGrid from '../../components/customer/SeatGrid';
import { Film, MapPin, Calendar, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function SeatBookingPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, joinShowRoom, leaveShowRoom } = useSocket();

  const [showData, setShowData] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockTimerSeconds, setLockTimerSeconds] = useState(null);

  // 1. Fetch initial seating layout
  const fetchSeatingLayout = async () => {
    try {
      const res = await api.get(`/shows/${showId}/seats`);
      const data = res.data.data;
      setShowData(data.show);
      setRows(data.rows);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load show seating.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatingLayout();
  }, [showId]);

  // 2. Real-Time Socket.IO Synchronization
  useEffect(() => {
    if (!showId) return;

    joinShowRoom(showId);

    if (socket) {
      // Someone locked seats
      socket.on('seat_locked', ({ seatIds, lockedUntil, lockedByUserId }) => {
        setRows((prevRows) =>
          prevRows.map((r) => ({
            ...r,
            seats: r.seats.map((s) => {
              if (seatIds.includes(s.seatId)) {
                return {
                  ...s,
                  status: 'LOCKED',
                  isLockedByMe: user && lockedByUserId === user.id,
                };
              }
              return s;
            }),
          }))
        );
      });

      // Someone released or lock expired
      socket.on('seat_released', ({ seatIds }) => {
        setRows((prevRows) =>
          prevRows.map((r) => ({
            ...r,
            seats: r.seats.map((s) => {
              if (seatIds.includes(s.seatId)) {
                return {
                  ...s,
                  status: 'AVAILABLE',
                  isLockedByMe: false,
                };
              }
              return s;
            }),
          }))
        );
      });

      // Someone confirmed booking
      socket.on('seat_booked', ({ seatIds }) => {
        setRows((prevRows) =>
          prevRows.map((r) => ({
            ...r,
            seats: r.seats.map((s) => {
              if (seatIds.includes(s.seatId)) {
                return {
                  ...s,
                  status: 'BOOKED',
                  isLockedByMe: false,
                };
              }
              return s;
            }),
          }))
        );
        // Remove from local selection if someone else booked it
        setSelectedSeats((prev) => prev.filter((s) => !seatIds.includes(s.seatId)));
      });
    }

    return () => {
      leaveShowRoom(showId);
      if (socket) {
        socket.off('seat_locked');
        socket.off('seat_released');
        socket.off('seat_booked');
      }
    };
  }, [showId, socket, user]);

  // Handle seat selection toggle
  const handleToggleSeat = (seat) => {
    setErrorMsg('');
    const exists = selectedSeats.find((s) => s.seatId === seat.seatId);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatId !== seat.seatId));
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMsg('Maximum 8 seats allowed per booking order.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Lock seats and navigate to Checkout
  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${showId}` } });
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least one seat to proceed.');
      return;
    }

    try {
      setErrorMsg('');
      const seatIds = selectedSeats.map((s) => s.seatId);

      // Lock seats on backend transaction
      await api.post('/bookings/lock-seats', {
        showId,
        seatIds,
      });

      // Navigate to checkout with showId and seatIds
      navigate(`/checkout?showId=${showId}&seats=${seatIds.join(',')}`);
    } catch (err) {
      setErrorMsg(err.message || 'Seat locking failed. The seat may have just been taken.');
      fetchSeatingLayout(); // Refresh layout to sync state
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Show information unavailable</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const showDateStr = new Date(showData.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const showTimeStr = new Date(showData.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Movie Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E293B] mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Showtimes
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{showData.movie.title}</h1>
          <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-slate-300 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {showData.screen.cinemaHall.name} ({showData.screen.screenNumber})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              {showDateStr}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {showTimeStr}
            </span>
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-950/60 text-red-400 border border-red-800/60">
            {showData.screen.soundSystem}
          </span>
        </div>
      </div>

      {/* Error notification banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-600/60 text-red-300 text-xs flex items-center gap-2 animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Interactive Seating Layout Component */}
      <SeatGrid
        rows={rows}
        selectedSeats={selectedSeats}
        onToggleSeat={handleToggleSeat}
        onProceedToCheckout={handleProceedToCheckout}
        showDetails={showData}
      />
    </div>
  );
}
