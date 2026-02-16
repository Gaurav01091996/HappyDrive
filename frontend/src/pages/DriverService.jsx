import React, { useState } from 'react';
import { Phone, CheckCircle, Shield, Star, Clock, Globe, ChevronRight } from 'lucide-react';
import { driverServices } from '../mock';

const DriverService = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'standard',
    days: '1',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Driver hire request submitted! We will contact you shortly.');
    console.log('Driver service request:', contactForm);
    // Reset form
    setContactForm({
      name: '',
      phone: '',
      email: '',
      service: 'standard',
      days: '1',
      message: ''
    });
  };

  const calculatePrice = () => {
    const rate = contactForm.service === 'premium' ? driverServices.premiumRate : driverServices.standardRate;
    const days = parseInt(contactForm.days) || 1;
    return rate * days;
  };

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Professional <span className="text-red-600">Driver Service</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Travel in comfort and safety with our experienced, professional drivers. 
              Perfect for long trips, local sightseeing, or when you just want to relax and enjoy the journey.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Standard Driver */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Standard Driver</h3>
              <div className="bg-red-600/20 text-red-600 px-4 py-2 rounded-lg font-semibold">
                Popular
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-white">₹{driverServices.standardRate}</span>
                <span className="text-gray-400 ml-2">/ day</span>
              </div>
              <p className="text-gray-400 mt-2">Perfect for everyday trips and local travel</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Experienced & Licensed
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Local Area Knowledge
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Courteous Service
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                8-10 Hours Daily
              </li>
            </ul>
          </div>

          {/* Premium Driver */}
          <div className="bg-gradient-to-br from-red-600/10 to-red-700/5 backdrop-blur-xl border border-red-600/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-2 text-sm font-semibold transform rotate-45 translate-x-8 translate-y-2">
              Best Value
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Premium Driver</h3>
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-white">₹{driverServices.premiumRate}</span>
                <span className="text-gray-400 ml-2">/ day</span>
              </div>
              <p className="text-gray-400 mt-2">Premium experience for special occasions</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Highly Experienced (5+ years)
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Multi-language Support
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Interstate Travel Expert
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Professional Attire
              </li>
              <li className="flex items-center text-gray-300">
                <CheckCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                Flexible Hours
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Our <span className="text-red-600">Drivers</span>
            </h2>
            <p className="text-gray-400 text-lg">Professional, safe, and reliable service guaranteed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {driverServices.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-red-600/50 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {index === 0 && <Shield className="w-8 h-8 text-red-600" />}
                  {index === 1 && <CheckCircle className="w-8 h-8 text-red-600" />}
                  {index === 2 && <Globe className="w-8 h-8 text-red-600" />}
                  {index === 3 && <Star className="w-8 h-8 text-red-600" />}
                  {index === 4 && <Clock className="w-8 h-8 text-red-600" />}
                  {index === 5 && <Globe className="w-8 h-8 text-red-600" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Hire a Driver</h2>
            <p className="text-gray-400">Fill out the form and we'll get back to you shortly</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
                <select
                  value={contactForm.service}
                  onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                >
                  <option value="standard" className="bg-black">Standard (₹{driverServices.standardRate}/day)</option>
                  <option value="premium" className="bg-black">Premium (₹{driverServices.premiumRate}/day)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Days</label>
                <input
                  type="number"
                  min="1"
                  value={contactForm.days}
                  onChange={(e) => setContactForm({ ...contactForm, days: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Additional Requirements</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                rows="4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="Any special requirements or preferences..."
              ></textarea>
            </div>

            {/* Price Estimate */}
            <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 mb-1">Estimated Cost</p>
                  <p className="text-sm text-gray-400">
                    {contactForm.service === 'premium' ? 'Premium' : 'Standard'} driver for {contactForm.days || 1} day(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-red-600">₹{calculatePrice().toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30"
            >
              <span>Submit Request</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Phone className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need Immediate Assistance?
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Call us directly for instant driver booking
          </p>
          <a
            href="tel:+919876543210"
            className="inline-block px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            +91 98765 43210
          </a>
        </div>
      </section>
    </div>
  );
};

export default DriverService;
