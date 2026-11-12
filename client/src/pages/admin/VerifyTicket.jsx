import React, { useState } from 'react';
import api from '../../services/api';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Film,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';

export default function VerifyTicket() {
  const [payloadInput, setPayloadInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!payloadInput.trim()) return;

    setVerifying(true);
    setResult(null);
    setErrorMsg('');

    try {
      const res = await api.post('/tickets/verify-qr', {
        qrPayload: payloadInput.trim(),
      });
      setResult(res.data.data);
    } catch (err) {
      setErrorMsg(err.message || 'Ticket verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleFillSample = () => {
    // Fill the sample confirmed ticket seeded in the database
    const samplePayload = {
      data: {
        ticketCode: 'TCK-9841-B8X',
        bookingNumber: 'BKG-20261112-9841',
        movie: 'Spider-Man: Across the Multiverse',
        seats: ['C3', 'C4'],
      },
      signature: 'demo_initial_seed_signature',
    };
    setPayloadInput(JSON.stringify(samplePayload));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
          Turnstile Admission Gate
        </span>
        <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
          <QrCode className="w-7 h-7 text-red-600" />
          QR Code Ticket Verification
        </h1>
        <p className="text-xs text-slate-400">
          Scan or input the customer's digital ticket payload to verify cryptographic authenticity and record admission.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Ticket QR Code Payload / JSON String
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs text-red-500 hover:underline font-semibold"
              >
                Paste Sample Demo Ticket
              </button>
            </div>
            <textarea
              rows={4}
              value={payloadInput}
              onChange={(e) => setPayloadInput(e.target.value)}
              placeholder='{"data":{"ticketCode":"TCK-9841-B8X",...},"signature":"..."}'
              className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono placeholder-slate-600 focus:outline-none focus:border-red-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-neon-red flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {verifying ? 'Verifying Signature with HMAC...' : 'Verify & Grant Entry'}
          </button>
        </form>

        {/* Verification Success Card */}
        {result && (
          <div className="p-6 rounded-2xl bg-green-950/40 border-2 border-green-500 text-white space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-green-600">
                  ADMISSION GRANTED • VALID TICKET
                </h3>
                <span className="text-xs text-slate-600">
                  Digital signature verified & check-in timestamped.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-green-800/40 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Ticket Code</span>
                <span className="font-mono font-bold text-white">{result.ticketCode}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Customer</span>
                <span className="font-bold text-white">{result.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Movie</span>
                <span className="font-bold text-white">{result.movie}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Cinema & Screen</span>
                <span className="text-slate-700">{result.cinema} ({result.screen})</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Seats</span>
                <span className="font-mono font-black text-cyan-600">{result.seats}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Showtime</span>
                <span className="font-bold text-amber-600">
                  {new Date(result.showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Failure Card */}
        {errorMsg && (
          <div className="p-5 rounded-2xl bg-red-950/60 border-2 border-red-600 text-white flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider">
                ENTRY DENIED / INVALID PASS
              </h3>
              <p className="text-xs text-slate-600 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

