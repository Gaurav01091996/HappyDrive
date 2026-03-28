/**
 * HappyDrive — Razorpay Frontend Service
 * Handles checkout initialization, success/failure callbacks,
 * and all payment API calls.
 */

import api from '../utils/api';

const unwrap = (r) => r.data?.data ?? r.data;

// ── Payment API calls ─────────────────────────────────────────────────────────
export const paymentAPI = {
  verify: (data) =>
    api.post('/api/payments/verify', data).then(unwrap),
  retry: (bookingId) =>
    api.post('/api/payments/retry', { booking_id: bookingId }).then(unwrap),
  refund: (bookingId, reason) =>
    api.post('/api/payments/refund', { booking_id: bookingId, reason }).then(unwrap),
};

/**
 * Load the Razorpay checkout script dynamically.
 * Returns a promise that resolves when the script is ready.
 */
export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Open Razorpay checkout modal.
 *
 * @param {object} orderData  - Data returned from POST /api/bookings/create
 * @param {object} user       - Current user { name, email, phone }
 * @param {function} onSuccess - Called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * @param {function} onFailure - Called with error message string
 * @param {function} onDismiss - Called when user closes the modal without paying
 */
export const openRazorpayCheckout = async ({
  orderData,
  user,
  onSuccess,
  onFailure,
  onDismiss,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure('Failed to load Razorpay. Please check your internet connection.');
    return;
  }

  const options = {
    key:         orderData.razorpay_key_id,
    amount:      orderData.amount,          // paise
    currency:    orderData.currency || 'INR',
    name:        'Happy Drives',
    description: `Vehicle Booking — ${orderData.car_name || orderData.booking_id}`,
    image:       '/logo192.png',
    order_id:    orderData.razorpay_order_id,

    // Prefill user details
    prefill: {
      name:    user?.name  || '',
      email:   user?.email || '',
      contact: user?.phone || '',
    },

    notes: {
      booking_id: orderData.booking_id || orderData.id,
    },

    theme: { color: '#dc2626' }, // Red to match HappyDrive brand

    handler: (response) => {
      // Payment captured on Razorpay side — now verify on backend
      onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_signature:  response.razorpay_signature,
      });
    },

    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
  };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', (response) => {
    onFailure(
      response.error?.description ||
      response.error?.reason ||
      'Payment failed. Please try again.'
    );
  });

  rzp.open();
};
