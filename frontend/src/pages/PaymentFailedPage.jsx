import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home, Loader2, ShieldCheck } from 'lucide-react';
import { bookingsAPI } from '../utils/api';
import { openRazorpayCheckout, paymentAPI } from '../services/razorpayService';
import { useAuth } from '../context/AuthContext';

const PaymentFailedPage = () => {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const bookingId       = searchParams.get('booking_id');

  const [booking, setBooking]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [retrying, setRetrying]   = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    bookingsAPI.getOne(bookingId)
      .then(setBooking)
      .catch(() => setError('Could not load booking details.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleRetry = async () => {
    if (!bookingId) return;
    setRetrying(true); setError('');
    try {
      const orderData = await paymentAPI.retry(bookingId);
      await openRazorpayCheckout({
        orderData: { ...orderData, id: bookingId },
        user,
        onSuccess: async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
          try {
            const confirmed = await paymentAPI.verify({
              booking_id:          bookingId,
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            });
            navigate(`/booking/confirm/${confirmed.id}`, { state: { booking: confirmed } });
          } catch (e) {
            setError(e.response?.data?.detail || 'Payment verification failed.');
            setRetrying(false);
          }
        },
        onFailure: (msg) => { setError(msg); setRetrying(false); },
        onDismiss: () => setRetrying(false),
      });
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to retry payment.');
      setRetrying(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await bookingsAPI.cancel(bookingId, 'Cancelled after payment failure');
      navigate('/my-bookings');
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to cancel booking.');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-red-900/40 rounded-2xl p-10 text-center">

          {/* Icon */}
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            Your payment could not be processed. No money has been deducted.
            You can retry or cancel the booking.
          </p>

          {/* Booking info */}
          {booking && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Booking ID</span>
                <span className="font-mono text-red-400">{booking.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Vehicle</span>
                <span className="text-white">{booking.car_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-bold">₹{booking.total_price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Dates</span>
                <span className="text-white">{booking.from_date} → {booking.to_date}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-600/10 border border-red-600/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-5">
              ⚠️ {error}
            </div>
          )}

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
            Secured by Razorpay · Your card was not charged
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {bookingId && (
              <button onClick={handleRetry} disabled={retrying || cancelling}
                className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {retrying
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  : <><RefreshCw className="w-5 h-5" /> Retry Payment</>}
              </button>
            )}

            {bookingId && (
              <button onClick={handleCancelBooking} disabled={retrying || cancelling}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 transition disabled:opacity-50 text-sm">
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}

            <Link to="/"
              className="w-full flex items-center justify-center gap-2 py-3 bg-transparent border border-white/20 text-gray-400 font-medium rounded-lg hover:bg-white/5 transition text-sm">
              <Home className="w-4 h-4" /> Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;
