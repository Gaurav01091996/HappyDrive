import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Star, Shield, Award, Users, ChevronRight, Fuel, Settings } from 'lucide-react';
import { testimonials } from '../mock';
import { carsAPI } from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');
  const [dateError, setDateError] = useState('');

  const [cars, setCars]           = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);

  useEffect(() => {
    carsAPI.getAll()
      .then(data => setCars(data?.cars || []))
      .catch(() => setCars([]))
      .finally(() => setCarsLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!fromDate || !toDate) { setDateError('Please select both dates.'); return; }
    if (new Date(toDate) <= new Date(fromDate)) { setDateError('Return date must be after pickup date.'); return; }
    setDateError('');
    navigate(`/cars?from=${fromDate}&to=${toDate}`);
  };

  return (
    <div className="min-h-screen bg-black">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1485291571150-772bcfc10da5?fm=jpg&q=60&w=3000&auto=format&fit=crop"
            alt="Car" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Drive Your Freedom with{' '}
                <span className="text-red-600">Happy Drives</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-light">Premium Self-Drive Car Rentals</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/cars"
                className="px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-600/30 flex items-center space-x-2">
                <span>Book Now</span><ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20">
                Learn More
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-red-600">10K+</p>
                <p className="text-sm text-gray-400 mt-1">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-red-600">
                  {carsLoading ? '...' : `${cars.length}+`}
                </p>
                <p className="text-sm text-gray-400 mt-1">Premium Cars</p>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-red-600">25+</p>
                <p className="text-sm text-gray-400 mt-1">Cities Covered</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── Quick Booking ─────────────────────────────────────────────────────── */}
      <section className="relative -mt-20 z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Quick Search</h2>
          <p className="text-gray-400 text-sm mb-6">Pick your dates and find available cars instantly</p>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <Calendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />From Date
              </label>
              <input type="date" min={today} value={fromDate}
                onChange={e => { setFromDate(e.target.value); setDateError(''); }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                <Calendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />To Date
              </label>
              <input type="date" min={fromDate || today} value={toDate}
                onChange={e => { setToDate(e.target.value); setDateError(''); }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
            <div className="flex flex-col justify-end">
              <button type="submit"
                className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg shadow-red-600/30">
                Search Cars
              </button>
            </div>
          </form>
          {dateError && <p className="text-red-400 text-sm mt-3">⚠️ {dateError}</p>}
        </div>
      </section>

      {/* ── Cars from DB ──────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Featured <span className="text-red-600">Cars</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose from our premium collection of well-maintained vehicles
          </p>
        </div>

        {carsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(n => (
              <div key={n} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-white/10" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-white/10 rounded w-2/3" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-10 bg-white/10 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!carsLoading && cars.length === 0 && (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-gray-400 text-lg">No cars available yet.</p>
          </div>
        )}

        {!carsLoading && cars.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cars.map(car => (
                <div key={car.id}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20 hover:scale-105">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={car.image_url || car.image || 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&q=80'}
                      alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=600&q=80'; }} />
                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {car.category}
                    </div>
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${car.available !== false ? 'bg-green-600/80 text-white' : 'bg-gray-700 text-gray-300'}`}>
                      {car.available !== false ? 'Available' : 'Booked'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{car.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center space-x-1"><Settings className="w-3.5 h-3.5" /><span>{car.transmission}</span></span>
                      <span>•</span>
                      <span className="flex items-center space-x-1"><Fuel className="w-3.5 h-3.5" /><span>{car.fuel}</span></span>
                      <span>•</span>
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-red-600">₹{(car.price_per_day || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-400">per day</p>
                      </div>
                      <Link to="/cars" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center space-x-2">
                        <span>Book</span><ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/cars" className="inline-flex items-center space-x-2 text-red-600 hover:text-red-500 font-semibold text-lg">
                <span>View All Cars</span><ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose <span className="text-red-600">Happy Drives</span></h2>
            <p className="text-gray-400 text-lg">Your safety and satisfaction are our top priorities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[{icon:Shield,title:'Safe & Reliable',desc:'All vehicles regularly maintained and sanitized'},
              {icon:Award, title:'Premium Quality', desc:'Luxury cars with the latest features'},
              {icon:Users, title:'24/7 Support',    desc:'Round-the-clock customer assistance'},
              {icon:Star,  title:'Best Prices',     desc:'Competitive rates with no hidden charges'}
            ].map(({icon:Icon,title,desc}) => (
              <div key={title} className="text-center group">
                <div className="w-20 h-20 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors duration-300">
                  <Icon className="w-10 h-10 text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What Our <span className="text-red-600">Customers Say</span></h2>
          <p className="text-gray-400 text-lg">Real experiences from our happy customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
              <div className="flex space-x-1 mb-4">
                {[...Array(t.rating)].map((_,i) => <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />)}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">{t.comment}</p>
              <div>
                <p className="text-white font-semibold">{t.name}</p>
                <p className="text-gray-500 text-sm">{new Date(t.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl text-white/90 mb-8">Book your dream car today and experience the freedom of the open road</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/cars" className="px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl">Browse Cars</Link>
            <Link to="/contact" className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
