import React, { useState } from 'react';
import { MapPin, Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { packages } from '../mock';

const PackageTrips = () => {
  const [customTripForm, setCustomTripForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    duration: '',
    travelers: '2',
    budget: '',
    requirements: ''
  });

  const handlePackageInquiry = (pkg) => {
    alert(`Inquiry for ${pkg.title} package! We will contact you shortly.`);
    console.log('Package inquiry:', pkg);
  };

  const handleCustomTripSubmit = (e) => {
    e.preventDefault();
    alert('Custom trip inquiry submitted! Our travel experts will contact you soon.');
    console.log('Custom trip request:', customTripForm);
    // Reset form
    setCustomTripForm({
      name: '',
      email: '',
      phone: '',
      destination: '',
      duration: '',
      travelers: '2',
      budget: '',
      requirements: ''
    });
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Curated <span className="text-red-600">Package Trips</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover India's most breathtaking destinations with our thoughtfully designed travel packages
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20"
            >
              {/* Package Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                
                {/* Destination Badge */}
                <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{pkg.destination}</span>
                </div>

                {/* Title and Duration */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-bold text-white mb-2">{pkg.title}</h3>
                  <div className="flex items-center text-white/90 space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">{pkg.duration}</span>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="p-8">
                <p className="text-gray-300 mb-6 leading-relaxed">{pkg.description}</p>

                {/* Inclusions */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">What's Included:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {pkg.inclusions.map((inclusion, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>{inclusion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Starting from</p>
                    <p className="text-4xl font-bold text-red-600">₹{pkg.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handlePackageInquiry(pkg)}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center space-x-2 shadow-lg shadow-red-600/30"
                  >
                    <span>Inquire Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Trip Section */}
      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Plan Your <span className="text-red-600">Custom Trip</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Have a unique destination in mind? Let us create a personalized package just for you
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
            <form onSubmit={handleCustomTripSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customTripForm.name}
                    onChange={(e) => setCustomTripForm({ ...customTripForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={customTripForm.email}
                    onChange={(e) => setCustomTripForm({ ...customTripForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={customTripForm.phone}
                  onChange={(e) => setCustomTripForm({ ...customTripForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Destination</label>
                  <input
                    type="text"
                    value={customTripForm.destination}
                    onChange={(e) => setCustomTripForm({ ...customTripForm, destination: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Kerala, Goa, etc."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (Days)</label>
                  <input
                    type="text"
                    value={customTripForm.duration}
                    onChange={(e) => setCustomTripForm({ ...customTripForm, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="5 days"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Travelers</label>
                  <input
                    type="number"
                    min="1"
                    value={customTripForm.travelers}
                    onChange={(e) => setCustomTripForm({ ...customTripForm, travelers: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget Range (Optional)</label>
                <input
                  type="text"
                  value={customTripForm.budget}
                  onChange={(e) => setCustomTripForm({ ...customTripForm, budget: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="₹50,000 - ₹1,00,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Special Requirements</label>
                <textarea
                  value={customTripForm.requirements}
                  onChange={(e) => setCustomTripForm({ ...customTripForm, requirements: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Tell us about your preferences, interests, or any special requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30"
              >
                <Calendar className="w-5 h-5" />
                <span>Submit Custom Trip Request</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Why Choose Our Packages */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose Our <span className="text-red-600">Packages</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">All-Inclusive</h3>
            <p className="text-gray-400">Everything taken care of - car, driver, accommodation, and meals</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Expert Guidance</h3>
            <p className="text-gray-400">Local guides who know the best spots and hidden gems</p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 bg-red-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Flexible Options</h3>
            <p className="text-gray-400">Customize any package to match your preferences</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PackageTrips;
