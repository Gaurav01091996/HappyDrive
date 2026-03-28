import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, XCircle, CreditCard } from 'lucide-react';
import { bookingsAPI } from '../utils/api';

const statusStyles = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/40' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-600/20 text-green-400 border-green-600/40' },
  rejected:  { label: 'Rejected',  cls: 'bg-red-600/20 text-red-400 border-red-600/40' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-600/20 text-gray-400 border-gray-600/40' },
};

const MyBookings = () => {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [cancelling, setCancelling] = useState('');
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    bookingsAPI.getMy()
      .then(data => setBookings(Array.isArray(data) ? data : data?.bookings || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const canCancel = (b) => {
    if (!['pending', 'confirmed'].includes(b.status)) return false;
    return new Date(b.from_date) > new Date();
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id); setCancelError('');
    try {
      await bookingsAPI.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (e) {
      setCancelError(e.response?.data?.detail || 'Failed to cancel booking.');
    } finally { setCancelling(''); }
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            My <span className="text-red-600">Bookings</span>
          </h1>
          <p className="text-xl text-gray-300">Track and manage all your reservations</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 rounded-xl px-5 py-4 text-sm mb-6">⚠️ {error}</div>
        )}
        {cancelError && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 rounded-xl px-5 py-4 text-sm mb-6">⚠️ {cancelError}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-2xl text-white font-bold mb-3">No bookings yet</p>
            <p className="text-gray-400 mb-8">Browse our fleet and make your first booking!</p>
            <Link to="/cars" className="inline-flex items-center space-x-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
              <span>Browse Cars</span><ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => {
              const s = statusStyles[b.status] || statusStyles.pending;
              return (
                <div key={b.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 hover:border-red-600/30 rounded-2xl p-6 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex gap-4 items-start min-w-0">
                      {b.car_image && (
                        <img src={b.car_image} alt={b.car_name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="text-white font-bold text-lg">{b.car_name}</span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                          {b.payment_status === 'paid' && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-green-600/20 text-green-400 border-green-600/40 flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> Paid
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{b.from_date} → {b.to_date} · {b.days} day{b.days !== 1 ? 's' : ''}</p>
                        <p className="text-gray-600 text-xs mt-1 font-mono">{b.id}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-black text-xl">₹{b.total_price?.toLocaleString()}</div>
                      {b.discount_percent > 0 && (
                        <div className="text-green-400 text-xs mt-0.5">−{b.discount_percent}% off</div>
                      )}
                      <div className="text-gray-600 text-xs mt-1 capitalize">{b.payment_method}</div>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                    <Link to={`/booking/confirm/${b.id}`}
                      className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
                      View Details →
                    </Link>
                    {canCancel(b) && (
                      <button onClick={() => handleCancel(b.id)}
                        disabled={cancelling === b.id}
                        className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors disabled:opacity-40 font-medium">
                        <XCircle className="w-4 h-4" />
                        {cancelling === b.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
