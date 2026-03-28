import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle, Calendar, Car, CreditCard, Star,
  ArrowRight, ShieldCheck, Hash, Banknote, RefreshCw
} from 'lucide-react';
import { bookingsAPI, reviewsAPI } from '../utils/api';

const BOOKING_STATUS_STYLE = {
  pending:   { cls:'bg-yellow-600/20 text-yellow-400 border-yellow-600/40', label:'Pending Confirmation' },
  confirmed: { cls:'bg-green-600/20  text-green-400  border-green-600/40',  label:'Confirmed' },
  rejected:  { cls:'bg-red-600/20    text-red-400    border-red-600/40',    label:'Rejected' },
  cancelled: { cls:'bg-gray-600/20   text-gray-400   border-gray-600/40',   label:'Cancelled' },
  failed:    { cls:'bg-red-900/20    text-red-500    border-red-900/40',    label:'Failed' },
  completed: { cls:'bg-blue-600/20   text-blue-400   border-blue-600/40',   label:'Completed' },
};
const PAY_STATUS_STYLE = {
  pending:  'bg-yellow-600/20 text-yellow-400 border-yellow-600/40',
  paid:     'bg-green-600/20  text-green-400  border-green-600/40',
  failed:   'bg-red-600/20    text-red-400    border-red-600/40',
  refunded: 'bg-purple-600/20 text-purple-400 border-purple-600/40',
};

const ConfirmationPage = () => {
  const { bookingId } = useParams();
  const location      = useLocation();

  const [booking,  setBooking]  = useState(location.state?.booking || null);
  const [loading,  setLoading]  = useState(!booking);
  const [error,    setError]    = useState('');

  const [showReview,     setShowReview]     = useState(false);
  const [rating,         setRating]         = useState(0);
  const [hoverRating,    setHoverRating]    = useState(0);
  const [comment,        setComment]        = useState('');
  const [reviewDone,     setReviewDone]     = useState(false);
  const [reviewError,    setReviewError]    = useState('');
  const [reviewLoading,  setReviewLoading]  = useState(false);

  useEffect(() => {
    if (!booking) {
      bookingsAPI.getOne(bookingId)
        .then(setBooking)
        .catch(() => setError('Booking not found.'))
        .finally(() => setLoading(false));
    }
  }, [bookingId, booking]);

  const handleReview = async () => {
    if (rating === 0) { setReviewError('Please select a star rating.'); return; }
    setReviewLoading(true); setReviewError('');
    try {
      await reviewsAPI.create(booking.car_id, booking.id, rating, comment);
      setReviewDone(true); setShowReview(false);
    } catch (e) {
      setReviewError(e.response?.data?.detail || 'Failed to submit review.');
    } finally { setReviewLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading booking details...</div>
    </div>
  );
  if (!booking || error) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center px-4">
      <div>
        <p className="text-red-400 mb-4">{error || 'Booking not found.'}</p>
        <Link to="/my-bookings" className="text-red-500 underline">View My Bookings</Link>
      </div>
    </div>
  );

  const isPaid      = booking.payment_status === 'paid';
  const isConfirmed = booking.booking_status === 'confirmed';
  const ss          = BOOKING_STATUS_STYLE[booking.booking_status] || BOOKING_STATUS_STYLE.pending;
  const ps          = PAY_STATUS_STYLE[booking.payment_status]     || PAY_STATUS_STYLE.pending;
  const canReview   = isConfirmed && !reviewDone;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isConfirmed ? 'bg-green-600/20' : 'bg-yellow-600/20'}`}>
            <CheckCircle className={`w-10 h-10 ${isConfirmed ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isConfirmed ? 'Booking Confirmed!' : 'Booking Submitted!'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isPaid
              ? 'Payment successful. Your booking is confirmed.'
              : 'Your booking has been submitted and is pending confirmation.'}
          </p>
        </div>

        {/* ── Ticket ───────────────────────────────────────────────────────── */}
        <div className={`bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden ${
          isConfirmed ? 'border-green-900/40' : 'border-white/10'}`}>

          {booking.car_image && (
            <div className="relative">
              <img src={booking.car_image} alt={booking.car_name}
                className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {isPaid && (
                <div className="absolute top-4 right-4 bg-green-600/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Payment Verified
                </div>
              )}
            </div>
          )}

          <div className="p-8 space-y-5">

            {/* Booking ID + Status */}
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Booking ID</p>
                <p className="font-mono text-2xl font-bold text-red-500">{booking.id}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${ss.cls}`}>{ss.label}</span>
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-3 pb-5 border-b border-white/10">
              <Car className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-lg">{booking.car_name}</p>
                <p className="text-gray-400 text-sm">{booking.car_brand} {booking.car_model}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3 pb-5 border-b border-white/10">
              <Calendar className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div><p className="text-xs text-gray-400 mb-0.5">From</p><p className="text-white font-semibold">{booking.from_date}</p></div>
                  <div className="text-right"><p className="text-xs text-gray-400 mb-0.5">To</p><p className="text-white font-semibold">{booking.to_date}</p></div>
                </div>
                <p className="text-gray-500 text-xs mt-1">{booking.days} day{booking.days !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Pickup Location */}
            {booking.pickup_location && (
              <div className="flex items-center gap-3 pb-5 border-b border-white/10">
                <span className="text-lg flex-shrink-0">📍</span>
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Pickup Location</p>
                    <p className="text-white font-semibold">{booking.pickup_location}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    booking.pickup_charge > 0
                      ? 'bg-orange-600/20 text-orange-400 border-orange-600/30'
                      : 'bg-green-600/20 text-green-400 border-green-600/30'
                  }`}>
                    {booking.pickup_charge > 0 ? `+₹${booking.pickup_charge}` : 'Free'}
                  </span>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="pb-5 border-b border-white/10">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Price Breakdown</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>₹{booking.price_per_day?.toLocaleString()} × {booking.days} days</span>
                  <span>₹{booking.original_price?.toLocaleString()}</span>
                </div>
                {booking.discount_percent > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount ({booking.discount_percent}%) — {booking.applied_discounts?.join(', ')}</span>
                    <span>−₹{booking.discount_amount?.toLocaleString()}</span>
                  </div>
                )}
                {booking.pickup_location && (
                  <div className={`flex justify-between text-sm ${booking.pickup_charge > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                    <span className="flex items-center gap-1.5">
                      📍 Pickup: {booking.pickup_location}
                    </span>
                    <span>{booking.pickup_charge > 0 ? `+₹${booking.pickup_charge}` : 'Free'}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white font-bold">Total Paid</span>
                  <span className="text-3xl font-black text-red-500">₹{booking.total_price?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment details */}
            <div className="pb-5 border-b border-white/10 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Payment Details</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {booking.payment_method === 'online'
                    ? <CreditCard className="w-4 h-4 text-red-500" />
                    : <Banknote className="w-4 h-4 text-red-500" />}
                  <span className="text-white text-sm capitalize">{booking.payment_method}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${ps}`}>
                  {booking.payment_status}
                </span>
              </div>

              {/* Razorpay Payment ID */}
              {booking.razorpay_payment_id && (
                <div className="bg-green-600/10 border border-green-600/20 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3 h-3" /> Razorpay Payment ID
                  </p>
                  <p className="font-mono text-green-400 text-sm font-semibold break-all">
                    {booking.razorpay_payment_id}
                  </p>
                </div>
              )}

              {/* Razorpay Order ID */}
              {booking.razorpay_order_id && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <p className="text-xs text-gray-500 mb-0.5">Razorpay Order ID</p>
                  <p className="font-mono text-gray-400 text-xs break-all">{booking.razorpay_order_id}</p>
                </div>
              )}
            </div>

            {/* Review */}
            {canReview && !showReview && (
              <button onClick={() => setShowReview(true)}
                className="w-full py-3 bg-yellow-600/20 border border-yellow-600/40 text-yellow-400 font-semibold rounded-xl hover:bg-yellow-600/30 transition flex items-center justify-center gap-2">
                <Star className="w-4 h-4" /> Rate Your Ride
              </button>
            )}
            {reviewDone && (
              <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4 text-center">
                <p className="text-green-400 font-semibold text-sm">✓ Review submitted! Thank you.</p>
              </div>
            )}
            {showReview && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-400" /> Rate Your Ride
                </h3>
                {reviewError && <p className="text-red-400 text-xs">⚠️ {reviewError}</p>}
                <div className="flex gap-2 items-center">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= s ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                    </button>
                  ))}
                  {rating > 0 && <span className="text-gray-400 text-sm ml-1">{['','Poor','Fair','Good','Great','Excellent'][rating]}</span>}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                  placeholder="Share your experience (optional)..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-sm" />
                <div className="flex gap-3">
                  <button onClick={handleReview} disabled={reviewLoading}
                    className="flex-1 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 text-sm">
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button onClick={() => setShowReview(false)}
                    className="px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition text-sm">Skip</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/my-bookings"
                className="flex-1 text-center py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2">
                My Bookings <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/cars"
                className="flex-1 text-center py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
                Browse More Cars
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
