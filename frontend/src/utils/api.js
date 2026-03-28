import axios from "axios";

const BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hd_token");
      localStorage.removeItem("hd_user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

// Unwrap { success, message, data } envelope
const unwrap = (r) => r.data?.data ?? r.data;

export const authAPI = {
  signup: (name, email, password, phone) =>
    api.post("/api/auth/signup", { name, email, password, phone }).then(unwrap),
  login:  (email, password) =>
    api.post("/api/auth/login", { email, password }).then(unwrap),
  me:     () => api.get("/api/auth/me").then(unwrap),
};

export const carsAPI = {
  getAll: (fromDate, toDate) => {
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate)   params.to_date   = toDate;
    return api.get("/api/cars", { params }).then(unwrap);
  },
  getOne:      (id)       => api.get(`/api/cars/${id}`).then(unwrap),
  pricePreview:(id, from_date, to_date, promo_code) => {
    const params = { from_date, to_date };
    if (promo_code) params.promo_code = promo_code;
    return api.get(`/api/cars/${id}/price-preview`, { params }).then(unwrap);
  },
  create:      (data)     => api.post("/api/cars", data).then(unwrap),
  update:      (id, data) => api.put(`/api/cars/${id}`, data).then(unwrap),
  remove:      (id)       => api.delete(`/api/cars/${id}`).then(unwrap),
  uploadImage: (id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post(`/api/cars/${id}/upload-image`, fd,
      { headers: { "Content-Type": "multipart/form-data" } }).then(unwrap);
  },
};

export const bookingsAPI = {
  // Main booking create — returns Razorpay order details for online, or booking for cash
  create: (carId, fromDate, toDate, promoCode, paymentMethod = "cash", pickupLocation = "Office Location") =>
    api.post("/api/bookings/create", {
      car_id:          carId,
      from_date:       fromDate,
      to_date:         toDate,
      promo_code:      promoCode || null,
      payment_method:  paymentMethod,
      pickup_location: pickupLocation,
    }).then(unwrap),

  getMy:  ()   => api.get("/api/bookings/my").then(unwrap),
  getOne: (id) => api.get(`/api/bookings/${id}`).then(unwrap),
  cancel: (id, reason) =>
    api.patch(`/api/bookings/${id}/cancel`, { reason: reason || null }).then(unwrap),
};

export const paymentsAPI = {
  // Verify after Razorpay checkout success
  verify: (bookingId, razorpayPaymentId, razorpayOrderId, razorpaySignature) =>
    api.post("/api/payments/verify", {
      booking_id:          bookingId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id:   razorpayOrderId,
      razorpay_signature:  razorpaySignature,
    }).then(unwrap),

  // Retry — generates a new Razorpay order for failed bookings
  retry: (bookingId) =>
    api.post("/api/payments/retry", { booking_id: bookingId }).then(unwrap),

  // Admin: trigger refund
  refund: (bookingId, reason) =>
    api.post("/api/payments/refund", { booking_id: bookingId, reason }).then(unwrap),
};

export const reviewsAPI = {
  create:       (vehicleId, bookingId, rating, comment) =>
    api.post("/api/reviews", { vehicle_id: vehicleId, booking_id: bookingId, rating, comment }).then(unwrap),
  getForVehicle:(vehicleId) => api.get(`/api/reviews/vehicle/${vehicleId}`).then(unwrap),
};

export const adminAPI = {
  getAllBookings:  ()           => api.get("/api/admin/bookings").then(unwrap),
  updateBooking:  (id, action) => api.patch(`/api/admin/bookings/${id}`, { action }).then(unwrap),
  getAnalytics:   ()           => api.get("/api/admin/analytics").then(unwrap),
  getUsers:       ()           => api.get("/api/admin/users").then(unwrap),
  getUser:        (id)         => api.get(`/api/admin/users/${id}`).then(unwrap),
  createUser:     (data)       => api.post("/api/admin/users", data).then(unwrap),
  updateUser:     (id, data)   => api.put(`/api/admin/users/${id}`, data).then(unwrap),
  deleteUser:     (id)         => api.delete(`/api/admin/users/${id}`).then(unwrap),
  getDiscounts:   ()           => api.get("/api/admin/discounts").then(unwrap),
  createDiscount: (data)       => api.post("/api/admin/discounts", data).then(unwrap),
  updateDiscount: (id, data)   => api.put(`/api/admin/discounts/${id}`, data).then(unwrap),
  deleteDiscount: (id)         => api.delete(`/api/admin/discounts/${id}`).then(unwrap),
  getReviews:     ()           => api.get("/api/admin/reviews").then(unwrap),
  deleteReview:   (id)         => api.delete(`/api/admin/reviews/${id}`).then(unwrap),
  refundBooking:  (id, reason) => api.post("/api/payments/refund", { booking_id: id, reason }).then(unwrap),
};

export default api;
