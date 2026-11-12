import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import SnackSelector from '../../components/customer/SnackSelector';
import TicketCard from '../../components/customer/TicketCard';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const showId = searchParams.get('showId');
  const seatsParam = searchParams.get('seats');
  const seatIds = seatsParam ? seatsParam.split(',') : [];

  const [show, setShow] = useState(null);
  const [allocatedSeats, setAllocatedSeats] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({});
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes countdown

  // 1. Fetch Show and Seats
  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const [showRes, snacksRes] = await Promise.all([
          api.get(`/shows/${showId}/seats`),
          api.get('/bookings/snacks'),
        ]);

        setShow(showRes.data.data.show);
        const filteredSeats = showRes.data.data.allSeats.filter((s) =>
          seatIds.includes(s.seatId)
        );
        setAllocatedSeats(filteredSeats);
        setSnacks(snacksRes.data.data);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to initialize checkout.');
      } finally {
        setLoading(false);
      }
    };

    if (showId && seatIds.length > 0) {
      fetchCheckoutData();
    } else {
      navigate('/');
    }
  }, [showId, seatsParam]);

  // 2. Countdown timer for seat lock expiry
  useEffect(() => {
    if (timeLeft <= 0) {
      setErrorMsg('Your seat reservation has expired. Please select seats again.');
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleUpdateSnackQty = (snackId, qty) => {
    setSelectedSnacks((prev) => ({
      ...prev,
      [snackId]: qty,
    }));
  };

  // Price calculations
  const seatsSubtotal = allocatedSeats.reduce((acc, curr) => acc + curr.price, 0);
  const snacksSubtotal = Object.entries(selectedSnacks).reduce((acc, [snackId, qty]) => {
    const s = snacks.find((item) => item.id === snackId);
    return acc + (s ? s.price * qty : 0);
  }, 0);

  const convenienceFee = 30.0;
  const taxAmount = Math.round(convenienceFee * 0.18 * 100) / 100;
  const totalAmount = Math.round((seatsSubtotal + snacksSubtotal + convenienceFee + taxAmount) * 100) / 100;

  // Format countdown minutes:seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Process Payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Prepare snack payload
      const snackItems = Object.entries(selectedSnacks)
        .filter(([_, qty]) => qty > 0)
        .map(([snackId, quantity]) => ({ snackId, quantity }));

      // 2. Call backend create-order
      const orderRes = await api.post('/payments/create-order', {
        showId,
        seatIds,
        snackItems,
      });

      const orderData = orderRes.data.data;
      const { bookingId, razorpayOrderId, keyId, amountInPaise } = orderData;

      // 3. Trigger Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'CineWave Entertainment',
        description: `Booking for ${show.movie.title}`,
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100',
        order_id: razorpayOrderId.startsWith('order_') ? razorpayOrderId : undefined,
        handler: async function (response) {
          try {
            // 4. Verify payment on backend
            const verifyRes = await api.post('/payments/verify', {
              bookingId,
              razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id || `pay_mock_${Date.now()}`,
              razorpaySignature: response.razorpay_signature || 'mock_verified_signature',
            });

            // 5. Navigate to booking celebration success page!
            navigate(`/booking-success/${bookingId}`);
          } catch (verifyErr) {
            setErrorMsg(verifyErr.message || 'Payment signature verification failed.');
            setSubmitting(false);
          }
        },
        prefill: {
          name: 'Demo Customer',
          email: 'customer@cinema.com',
          contact: '+919123456780',
        },
        theme: {
          color: '#E50914',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      // Check if Razorpay JS SDK loaded, else run simulated test checkout
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failureRes) {
          setErrorMsg(failureRes.error?.description || 'Payment was declined.');
          setSubmitting(false);
        });
        rzp.open();
      } else {
        // Fallback test mode verification
        const verifyRes = await api.post('/payments/verify', {
          bookingId,
          razorpayOrderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: 'mock_verified_signature',
        });
        navigate(`/booking-success/${bookingId}`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Payment checkout initialization failed.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock booking object for Ticket Preview
  const previewBooking = {
    bookingNumber: 'BKG-PREVIEW',
    totalAmount,
    show,
    seats: allocatedSeats.map((s) => ({
      name: `${s.row}${s.number}`,
      price: s.price,
    })),
    ticket: {
      ticketCode: 'TCK-PREVIEW',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to={`/movies/${show.movie.id}`} className="hover:text-white">{show.movie.title}</Link>
        <span>/</span>
        <span className="text-red-500 font-semibold">Make Payment</span>
      </div>

      {/* Expiry Banner */}
      <div className="mb-8 p-3.5 rounded-xl bg-[#121824] border border-amber-600/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-400">
          <Clock className="w-4 h-4 animate-spin" />
          <span>Seats held for you. Complete payment before the timer expires.</span>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-sm">
          {formattedTimer}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-600 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Order Breakdown & Snacks Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Summary */}
          <div className="bg-[#121824] border border-[#243047] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Payment Summary
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                Verified Lock
              </span>
            </div>

            {/* Seat price breakdown */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between text-slate-300">
                <span>Tickets ({allocatedSeats.length} seats)</span>
                <span className="font-semibold text-white">₹{seatsSubtotal.toFixed(2)}</span>
              </div>
              {snacksSubtotal > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Snacks & Concessions</span>
                  <span className="font-semibold text-white">₹{snacksSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Convenience Fee</span>
                <span>₹{convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integrated GST (18%)</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
              <span className="text-sm font-bold text-white">Total Amount</span>
              <span className="text-2xl font-black text-red-500">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Concessions / Snacks Add-on Selector */}
          <SnackSelector
            snacks={snacks}
            selectedSnacks={selectedSnacks}
            onUpdateQuantity={handleUpdateSnackQty}
          />
        </div>

        {/* Column 2: Payment Gateway Selection & Form (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#121824] border border-[#243047] rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Select Payment Method
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Processed securely via Razorpay Test Gateway.
              </p>
            </div>

            {/* Payment Method Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedMethod('razorpay')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  selectedMethod === 'razorpay'
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'bg-[#1A2333] border-[#243047] text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Razorpay
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                  selectedMethod === 'upi'
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'bg-[#1A2333] border-[#243047] text-slate-400'
                }`}
              >
                UPI / GPay / PhonePe
              </button>
            </div>

            {/* Simulated Checkout Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  defaultValue="John Doe"
                  className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Card / Account Number
                </label>
                <input
                  type="text"
                  defaultValue="4111 •••• •••• 1111"
                  className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-600 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    defaultValue="12/28"
                    className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-600 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    defaultValue="842"
                    className="w-full bg-[#1A2333] border border-[#243047] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-600 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || timeLeft <= 0}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-neon-red transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                {submitting ? 'Verifying Transaction...' : `Pay ₹${totalAmount.toFixed(2)}`}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                <span>End-to-End Cryptographic HMAC Signature Verification</span>
              </div>
            </form>
          </div>
        </div>

        {/* Column 3: Live Golden Ticket Preview Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Your Digital Pass Preview
            </span>
            <TicketCard booking={previewBooking} />
          </div>
        </div>
      </div>
    </div>
  );
}
