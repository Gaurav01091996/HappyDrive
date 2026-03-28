import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Star, Settings, Fuel, Users as UsersIcon, ArrowRight, ChevronRight } from 'lucide-react';
import { carsAPI, reviewsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SelfDriveCars = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(searchParams.get('from') || '');
  const [toDate,   setToDate]   = useState(searchParams.get('to')   || '');
  const [cars, setCars]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [ratings, setRatings]   = useState({}); // vehicleId -> avg

  const loadCars = (fd, td) => {
    setLoading(true);
    carsAPI.getAll(fd || undefined, td || undefined)
      .then(data => {
        const carList = data?.cars || [];
        setCars(carList);
        // Load ratings for all cars
        carList.forEach(car => {
          reviewsAPI.getForVehicle(car.id)
            .then(rv => {
              if (rv?.average_rating) {
                setRatings(prev => ({ ...prev, [car.id]: rv.average_rating }));
              }
            }).catch(() => {});
        });
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCars(fromDate, toDate); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCars(fromDate, toDate);
  };

  const days = fromDate && toDate
    ? Math.max(0, (new Date(toDate) - new Date(fromDate)) / 86400000)
    : 0;

  const availableCars = cars.filter(c => c.is_available_for_dates !== false);

  return (
    <div className="min-h-screen bg-black pt-20">

      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Self Drive <span className="text-red-600">Cars</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">Choose your dates and find available vehicles</p>
          {fromDate && toDate && (
            <p className="text-gray-400 text-sm">
              Showing availability for <span className="text-white font-semibold">{fromDate}</span> → <span className="text-white font-semibold">{toDate}</span>
              {days > 0 && <span className="text-red-400 ml-2">({days} day{days!==1?'s':''})</span>}
            </p>
          )}
        </div>
      </section>

      {/* Date Filter */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <form onSubmit={handleSearch} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <Calendar className="inline w-3.5 h-3.5 mr-1" />From Date
              </label>
              <input type="date" min={today} value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <Calendar className="inline w-3.5 h-3.5 mr-1" />To Date
              </label>
              <input type="date" min={fromDate || today} value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
            <div className="flex items-end">
              <button type="submit"
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Stats bar */}
      {!loading && (fromDate && toDate) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex gap-6 text-sm text-gray-400">
            <span>Total: <span className="text-white font-semibold">{cars.length}</span> vehicles</span>
            <span>Available: <span className="text-green-400 font-semibold">{availableCars.length}</span></span>
            <span>Unavailable: <span className="text-red-400 font-semibold">{cars.length - availableCars.length}</span></span>
          </div>
        </div>
      )}

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-white/10" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-white/10 rounded w-2/3" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-10 bg-white/10 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">🚗</div>
            <p className="text-2xl text-white font-bold mb-3">No vehicles found</p>
            <p className="text-gray-400">Try different dates or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map(car => {
              const isAvail  = car.is_available_for_dates !== false;
              const availCnt = car.available_count ?? car.quantity ?? 1;
              const qty      = car.quantity ?? 1;
              const avgRating = ratings[car.id];

              return (
                <div key={car.id}
                  className={`group bg-white/5 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isAvail
                      ? 'border-white/10 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/20 hover:scale-105'
                      : 'border-white/5 opacity-60 cursor-not-allowed'}`}>

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden bg-white/5">
                    <img
                      src={car.image_url || car.image || 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&q=80'}
                      alt={car.name}
                      className={`w-full h-full object-cover transition-transform duration-500 ${isAvail ? 'group-hover:scale-110' : 'grayscale'}`}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&q=80'; }} />

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {car.category}
                    </div>

                    {/* Availability badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                      availCnt === 0
                        ? 'bg-red-900/80 text-red-300'
                        : availCnt === 1
                        ? 'bg-yellow-700/80 text-yellow-200'
                        : 'bg-green-700/80 text-green-200'}`}>
                      {fromDate && toDate
                        ? availCnt === 0 ? '0 Available' : `${availCnt} Available`
                        : car.available !== false ? `${qty} in fleet` : 'Inactive'}
                    </div>

                    {/* Rating badge */}
                    {avgRating > 0 && (
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-yellow-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" /> {avgRating}
                      </div>
                    )}

                    {!isAvail && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-900/80 text-red-300 px-4 py-2 rounded-full text-sm font-bold">Not Available</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1">{car.name}</h3>
                    <p className="text-gray-500 text-xs mb-3">{car.brand} · {car.model}</p>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 flex-wrap">
                      <span className="flex items-center gap-1"><Settings className="w-3.5 h-3.5" />{car.transmission}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{car.fuel}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" />{car.seats} seats</span>
                    </div>

                    {car.description && (
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{car.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-red-500">₹{(car.price_per_day || 0).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">per day{days > 0 && ` · ₹${((car.price_per_day||0)*days).toLocaleString()} total`}</p>
                      </div>

                      {isAvail ? (
                        user ? (
                          <Link
                            to={`/booking/${car.id}${fromDate && toDate ? `?from=${fromDate}&to=${toDate}` : ''}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
                            Book <ChevronRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <Link to="/auth"
                            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-gray-300 text-sm font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                            Login to Book
                          </Link>
                        )
                      ) : (
                        <button disabled
                          className="px-5 py-2.5 bg-gray-700/30 text-gray-500 text-sm font-semibold rounded-lg cursor-not-allowed">
                          Unavailable
                        </button>
                      )}
                    </div>
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

export default SelfDriveCars;
