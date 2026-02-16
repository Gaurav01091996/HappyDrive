import React, { useState } from 'react';
import { Search, Fuel, Settings, Users, ChevronRight } from 'lucide-react';
import { cars } from '../mock';

const SelfDriveCars = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Sedan', 'SUV', 'Sports'];

  const filteredCars = cars.filter((car) => {
    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;
    const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookCar = (car) => {
    alert(`Booking ${car.name}! In production, this will open the booking form.`);
    console.log('Selected car:', car);
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Premium <span className="text-red-600">Self-Drive Cars</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose from our exclusive collection of luxury vehicles and hit the road with confidence
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by car name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredCars.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400">No cars found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20 hover:scale-105"
              >
                {/* Car Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {car.category}
                  </div>
                  {car.featured && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                {/* Car Details */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">{car.name}</h3>

                  {/* Specifications */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
                      <Fuel className="w-5 h-5 text-red-600 mb-1" />
                      <span className="text-xs text-gray-400">{car.fuel}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
                      <Settings className="w-5 h-5 text-red-600 mb-1" />
                      <span className="text-xs text-gray-400">{car.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
                      <Users className="w-5 h-5 text-red-600 mb-1" />
                      <span className="text-xs text-gray-400">{car.seats} Seats</span>
                    </div>
                  </div>

                  {/* Pricing and Book Button */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold text-red-600">₹{car.pricePerDay.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">per day</p>
                    </div>
                    <button
                      onClick={() => handleBookCar(car)}
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center space-x-2 shadow-lg shadow-red-600/30"
                    >
                      <span className="font-semibold">Book Now</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-white/5 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">No Hidden Charges</h3>
              <p className="text-gray-400">Transparent pricing with no surprise fees</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Easy Cancellation</h3>
              <p className="text-gray-400">Free cancellation up to 24 hours before pickup</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Verified Cars</h3>
              <p className="text-gray-400">All vehicles inspected and regularly maintained</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SelfDriveCars;
