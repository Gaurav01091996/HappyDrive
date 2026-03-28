import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Tag, ChevronRight, MapPin,
  CreditCard, Banknote, CheckCircle, Loader2, ShieldCheck, Building2
} from 'lucide-react';
import { carsAPI, bookingsAPI } from '../utils/api';
import { openRazorpayCheckout, paymentAPI } from '../services/razorpayService';
import { useAuth } from '../context/AuthContext';

const inputCls = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent";

// ── Pickup location config ────────────────────────────────────────────────────
const PICKUP_OPTIONS = [
  { id: 'Office Location',          label: 'Office Location',          charge: 0,   Icon: Building2 },
  { id: 'Guwahati Airport',         label: 'Guwahati Airport',         charge: 500, Icon: MapPin    },
  { id: 'Guwahati Railway Station', label: 'Guwahati Railway Station', charge: 500, Icon: MapPin    },
  { id: 'Kamakhya Railway Station', label: 'Kamakhya Railway Station', charge: 500, Icon: MapPin    },
];

const BookingPage = () => {
  const { carId }      = useParams();
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();
  const today          = new Date().toISOString().split('T')[0];

  const [car, setCar]                     = useState(null);
  const [fromDate, setFromDate]           = useState(searchParams.get('from') || '');
  const [toDate, setToDate]               = useState(searchParams.get('to')   || '');
  const [promoCode, setPromoCode]         = useState('');
  const [promoApplied, setPromoApplied]   = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [pickupLocation, setPickupLocation] = useState(''); // required
  const [pricing, setPricing]             = useState(null);
  const [loadingCar,   setLoadingCar]     = useState(true);
  const [loadingPrice, setLoadingPrice]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [paymentStep, setPaymentStep]     = useState('idle');
  const [error, setError]                 = useState('');

  const selectedPickup = PICKUP_OPTIONS.find(o => o.id === pickupLocation) || null;
  const pickupCharge   = selectedPickup?.charge ?? 0;

  // Car price after discount (from backend preview), or simple calc
  const carPriceAfterDiscount = pricing?.final_price ?? ((car?.price_per_day || 0) * Math.max(0, days));
  const grandTotal             = carPriceAfterDiscount + pickupCharge;

  useEffect(() => {
    carsAPI.getOne(carId)
      .then(setCar)
      .catch(() => setError('Car not found.'))
      .finally(() => setLoadingCar(false));
  }, [carId]);

  const days = fromDate && toDate
    ? Math.max(0, (new Date(toDate) - new Date(fromDate)) / 86400000)
    : 0;

  useEffect(() => {
    if (!fromDate || !toDate || !car || days <= 0) return;
    setLoadingPrice(true);
    carsAPI.pricePreview(carId, fromDate, toDate, promoApplied ? promoCode : '')
      .then(setPricing).catch(() => setPricing(null))
      .finally(() => setLoadingPrice(false));
  }, [fromDate, toDate, carId, promoApplied, car]);

  const handleApplyPromo = () => { if (promoCode.trim()) setPromoApplied(true); };

  const validate = () => {
    if (!fromDate || !toDate || days <= 0) { setError('Please select valid travel dates.'); return false; }
    if (!pickupLocation)                   { setError('Please select a pickup location to continue.'); return false; }
    return true;
  };

  const handleCashBooking = async () => {
    if (!validate()) return;
    setError(''); setSubmitting(true);
    try {
      const booking = await bookingsAPI.create(
        carId, fromDate, toDate, promoApplied ? promoCode : null, 'cash', pickupLocation);
      navigate(`/booking/confirm/${booking.id}`, { state: { booking } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Booking failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  const handleOnlineBooking = async () => {
    if (!validate()) return;
    setError(''); setPaymentStep('creating'); setSubmitting(true);
    try {
      const orderData = await bookingsAPI.create(
        carId, fromDate, toDate, promoApplied ? promoCode : null, 'online', pickupLocation);
      setPaymentStep('checkout');
      await openRazorpayCheckout({
        orderData, user,
        onSuccess: async ({ razorpay_payment_id, razorpay_order_id, razorpay_signature }) => {
          setPaymentStep('verifying');
          try {
            const confirmed = await paymentAPI.verify({
              booking_id: orderData.id || orderData.booking_id,
              razorpay_order_id, razorpay_payment_id, razorpay_signature,
            });
            navigate(`/booking/confirm/${confirmed.id}`, { state: { booking: confirmed } });
          } catch (e) {
            setError(e.response?.data?.detail || 'Payment verification failed.');
            setPaymentStep('idle'); setSubmitting(false);
            navigate(`/payment/failed?booking_id=${orderData.id || orderData.booking_id}`);
          }
        },
        onFailure: (msg) => {
          setError(msg || 'Payment failed. Please try again.');
          setPaymentStep('idle'); setSubmitting(false);
          if (orderData?.id) navigate(`/payment/failed?booking_id=${orderData.id}`);
        },
        onDismiss: () => {
          setError('Payment cancelled. You can retry from My Bookings.');
          setPaymentStep('idle'); setSubmitting(false);
        },
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initiate payment.');
      setPaymentStep('idle'); setSubmitting(false);
    }
  };

  const handleBook = () => paymentMethod === 'online' ? handleOnlineBooking() : handleCashBooking();

  const stepLabels = { creating: 'Creating your booking...', checkout: 'Waiting for payment...', verifying: 'Verifying payment...' };

  if (loadingCar) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">Loading car details...</div>
    </div>
  );
  if (!car) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-red-500">{error || 'Car not found.'}</div>
    </div>
  );

  const pricePerDay = car.price_per_day || 0;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/cars" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cars
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">

          {/* Car Hero */}
          <div className="relative">
            <img src={car.image_url || car.image || 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=80'}
              alt={car.name} className="w-full h-64 object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&q=80'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h1 className="text-3xl font-bold text-white">{car.name}</h1>
              <p className="text-gray-300 text-sm">{car.brand} · {car.model} · {car.category}</p>
            </div>
          </div>

          <div className="p-8 space-y-6">

            {/* ── 1. Travel Dates ──────────────────────────────────────────── */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" /> Travel Dates
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">From Date *</label>
                  <input type="date" min={today} value={fromDate}
                    onChange={e => { setFromDate(e.target.value); setPromoApplied(false); }}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">To Date *</label>
                  <input type="date" min={fromDate || today} value={toDate}
                    onChange={e => { setToDate(e.target.value); setPromoApplied(false); }}
                    className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── 2. Pickup Location ───────────────────────────────────────── */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Pickup Location
                <span className="text-red-500 text-sm">*</span>
              </h3>
              <div className="space-y-2.5">
                {PICKUP_OPTIONS.map(({ id, label, charge, Icon }) => {
                  const isSelected = pickupLocation === id;
                  return (
                    <label key={id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8'
                      }`}>
                      <input type="radio" name="pickup_location" value={id}
                        checked={isSelected} onChange={() => setPickupLocation(id)}
                        className="sr-only" />

                      {/* Custom radio circle */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-red-600 bg-red-600' : 'border-gray-500 bg-transparent'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-red-400' : 'text-gray-500'}`} />

                      <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {label}
                      </span>

                      {/* Charge badge */}
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 border ${
                        charge === 0
                          ? 'bg-green-600/20 text-green-400 border-green-600/30'
                          : 'bg-orange-600/20 text-orange-400 border-orange-600/30'
                      }`}>
                        {charge === 0 ? 'Free' : `+₹${charge}`}
                      </span>
                    </label>
                  );
                })}
              </div>
              {!pickupLocation && (
                <p className="text-gray-600 text-xs mt-2 ml-1">↑ Select a pickup point to continue</p>
              )}
            </div>

            {/* ── 3. Promo Code ────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="inline w-4 h-4 mr-1 -mt-0.5 text-red-500" /> Promo Code
              </label>
              <div className="flex gap-3">
                <input value={promoCode}
                  onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); }}
                  placeholder="e.g. HAPPY20"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600" />
                <button onClick={handleApplyPromo} disabled={!promoCode.trim()}
                  className="px-5 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition font-medium disabled:opacity-40">
                  Apply
                </button>
              </div>
              {promoApplied && pricing?.applied_discounts?.length > 0 && (
                <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> {pricing.applied_discounts.join(', ')} applied
                </p>
              )}
              {promoApplied && pricing?.applied_discounts?.length === 0 && (
                <p className="text-red-400 text-xs mt-2">✗ Invalid or inactive promo code</p>
              )}
            </div>

            {/* ── 4. Payment Method ────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'cash',   Icon: Banknote,   label: 'Cash',   sub: 'Pay at pickup'     },
                  { id: 'online', Icon: CreditCard, label: 'Online', sub: 'Pay now securely'  },
                ].map(({ id, Icon, label, sub }) => (
                  <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === id
                        ? 'border-red-600 bg-red-600/10 text-white'
                        : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40'}`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">{label}</div>
                      <div className="text-xs opacity-70">{sub}</div>
                    </div>
                    {paymentMethod === id && <CheckCircle className="w-4 h-4 text-red-500 ml-auto" />}
                  </button>
                ))}
              </div>
              {paymentMethod === 'online' && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  Secured by Razorpay — 100% safe & encrypted
                </div>
              )}
            </div>

            {/* ── 5. Price Breakdown ───────────────────────────────────────── */}
            {days > 0 && (
              <div className="bg-red-600/10 border border-red-600/30 rounded-xl p-6">
                {loadingPrice ? (
                  <div className="text-gray-400 text-sm text-center py-2 animate-pulse">Calculating price...</div>
                ) : (
                  <div className="space-y-3">

                    {/* Car base price */}
                    <div className="flex justify-between text-gray-300 text-sm">
                      <span>Car price (₹{pricePerDay.toLocaleString()} × {days} day{days !== 1 ? 's' : ''})</span>
                      <span>₹{(pricing?.original_price ?? pricePerDay * days).toLocaleString()}</span>
                    </div>

                    {/* Discount */}
                    {pricing?.discount_percent > 0 && (
                      <div className="flex justify-between text-green-400 text-sm">
                        <span>
                          Discount ({pricing.discount_percent}%)
                          {pricing.applied_discounts?.length > 0 && ` — ${pricing.applied_discounts.join(', ')}`}
                        </span>
                        <span>−₹{pricing.discount_amount?.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Car subtotal after discount (only if discount applied) */}
                    {pricing?.discount_percent > 0 && (
                      <div className="flex justify-between text-gray-400 text-sm">
                        <span>Car subtotal</span>
                        <span>₹{pricing.final_price?.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Pickup charge */}
                    <div className={`flex justify-between text-sm items-center ${
                      pickupLocation
                        ? pickupCharge > 0 ? 'text-orange-400' : 'text-green-400'
                        : 'text-gray-600'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {pickupLocation ? `Pickup: ${pickupLocation}` : 'Pickup charge'}
                      </span>
                      <span>
                        {!pickupLocation
                          ? '—'
                          : pickupCharge > 0
                            ? `+₹${pickupCharge}`
                            : 'Free'}
                      </span>
                    </div>

                    {/* Grand total */}
                    <div className="border-t border-red-600/30 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">Grand Total</span>
                        <span className="text-4xl font-bold text-red-600">
                          ₹{(pickupLocation ? grandTotal : carPriceAfterDiscount).toLocaleString()}
                        </span>
                      </div>
                      {pickupLocation && pickupCharge > 0 && (
                        <p className="text-xs text-orange-400/70 text-right mt-1">
                          Includes ₹{pickupCharge} pickup charge
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                      <span>Payment: <span className="capitalize text-gray-400">{paymentMethod}</span></span>
                      <span>{paymentMethod === 'online' ? '✅ Instant confirmation' : '⏳ Pay at pickup'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Error ────────────────────────────────────────────────────── */}
            {error && (
              <div className="bg-red-600/10 border border-red-600/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* ── Processing step indicator ─────────────────────────────────── */}
            {paymentStep !== 'idle' && stepLabels[paymentStep] && (
              <div className="flex items-center justify-center gap-3 py-3 bg-white/5 rounded-xl border border-white/10">
                <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                <span className="text-gray-300 text-sm">{stepLabels[paymentStep]}</span>
              </div>
            )}

            {/* ── CTA Button ───────────────────────────────────────────────── */}
            {days > 0 ? (
              <button onClick={handleBook}
                disabled={submitting || !pickupLocation}
                className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></>
                ) : !pickupLocation ? (
                  <span>Select Pickup Location to Continue</span>
                ) : paymentMethod === 'online' ? (
                  <><CreditCard className="w-5 h-5" /><span>Pay ₹{grandTotal.toLocaleString()} with Razorpay</span></>
                ) : (
                  <><span>Confirm Booking — ₹{grandTotal.toLocaleString()}</span><ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            ) : (
              <div className="text-center text-gray-500 border border-dashed border-white/10 rounded-xl py-5 text-sm">
                Select travel dates to see pricing and confirm
              </div>
            )}

            <p className="text-xs text-gray-600 text-center">
              {paymentMethod === 'cash'
                ? 'Booking will be pending until confirmed by our team.'
                : 'Your booking will be confirmed instantly after payment.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
