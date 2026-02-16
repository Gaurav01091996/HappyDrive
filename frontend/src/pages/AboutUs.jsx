import React from 'react';
import { Target, Eye, Heart, Users, Award, Shield, TrendingUp, MapPin } from 'lucide-react';
import { aboutUs } from '../mock';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-red-600">Happy Drives</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your trusted partner for premium self-drive car rentals and unforgettable journeys since 2016
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300">
            <p className="text-5xl font-bold text-red-600 mb-2">{aboutUs.stats.happyCustomers}</p>
            <p className="text-gray-400 font-medium">Happy Customers</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300">
            <p className="text-5xl font-bold text-red-600 mb-2">{aboutUs.stats.carsAvailable}</p>
            <p className="text-gray-400 font-medium">Premium Cars</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300">
            <p className="text-5xl font-bold text-red-600 mb-2">{aboutUs.stats.citiesCovered}</p>
            <p className="text-gray-400 font-medium">Cities Covered</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300">
            <p className="text-5xl font-bold text-red-600 mb-2">{aboutUs.stats.yearsExperience}</p>
            <p className="text-gray-400 font-medium">Years Experience</p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                {aboutUs.mission}
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center mr-4">
                  <Eye className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                {aboutUs.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Core <span className="text-red-600">Values</span>
          </h2>
          <p className="text-gray-400 text-lg">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {aboutUs.values.map((value, index) => {
            const icons = [Users, Shield, TrendingUp, Award, Heart];
            const Icon = icons[index];
            
            return (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 hover:bg-red-600/5 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-600 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white">{value}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our <span className="text-red-600">Story</span>
            </h2>
          </div>

          <div className="space-y-8 text-gray-300 text-lg leading-relaxed">
            <p>
              Founded in 2016, Happy Drives began with a simple vision: to make premium car rentals accessible 
              to everyone who dreams of exploring India's diverse landscapes with complete freedom and comfort.
            </p>

            <p>
              What started as a small fleet of 10 vehicles in Guwahati has grown into a trusted network spanning 
              25+ cities across India, with over 150 premium vehicles and a dedicated team of professionals 
              committed to making every journey memorable.
            </p>

            <p>
              Over the years, we've had the privilege of serving more than 10,000 happy customers, from solo 
              travelers seeking adventure to families creating lasting memories, and corporate clients requiring 
              reliable transportation solutions.
            </p>

            <p>
              Our commitment to quality, safety, and customer satisfaction has made us one of the most trusted 
              names in the car rental industry. Every vehicle in our fleet is meticulously maintained, regularly 
              serviced, and thoroughly sanitized to ensure your safety and comfort.
            </p>

            <p className="text-white font-semibold text-xl">
              Today, Happy Drives continues to evolve, introducing new services, expanding to new cities, and 
              always putting our customers first. Your journey is our passion, and we're here to make every 
              mile unforgettable.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose <span className="text-red-600">Us</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
            <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Safe & Reliable</h3>
            <p className="text-gray-400 leading-relaxed">
              All vehicles are regularly maintained, inspected, and sanitized. Your safety is our top priority 
              with 24/7 roadside assistance.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
            <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Premium Quality</h3>
            <p className="text-gray-400 leading-relaxed">
              From luxury sedans to spacious SUVs, our fleet features the latest models with modern amenities 
              for your comfort.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-600/50 transition-all duration-300">
            <div className="w-16 h-16 bg-red-600/10 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Customer First</h3>
            <p className="text-gray-400 leading-relaxed">
              Our dedicated support team is available round-the-clock to assist you with any queries or 
              requirements during your journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy customers who trust us for their travel needs
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/cars"
              className="px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Browse Cars
            </a>
            <a
              href="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
