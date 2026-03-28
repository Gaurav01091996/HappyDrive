import React from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { faqs } from '../mock';

const Contact = () => {
  const mapCoordinates = { lat: 26.11455266882115, lng: 91.7969922213579 };

  return (
    <div className="min-h-screen bg-black pt-20">

      {/* Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in <span className="text-red-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions? We're here to help. Reach out to us through any of the channels below
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Phone */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors duration-300">
              <Phone className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Call Us</h3>
            <p className="text-gray-400 mb-2">Mon-Sun: 24/7</p>
            <a href="tel:+917099674802" className="text-red-600 hover:text-red-500 font-semibold block">
              +91 70996 74802
            </a>
          </div>

          {/* Email */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors duration-300">
              <Mail className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Email Us</h3>
            <p className="text-gray-400 mb-2">We'll respond within 24 hours</p>
            <a href="mailto:info@happydrives.com" className="text-red-600 hover:text-red-500 font-semibold block">
              info@happydrives.com
            </a>
          </div>

          {/* Location */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-red-600/50 transition-all duration-300 group">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-600 transition-colors duration-300">
              <MapPin className="w-8 h-8 text-red-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Visit Us</h3>
            <p className="text-gray-400 mb-2">Mon-Sat: 9:00 AM - 7:00 PM</p>
            <p className="text-red-600 font-semibold">
              Guwahati, Assam<br />India - 781001
            </p>
          </div>

        </div>
      </section>

      {/* Map — full width */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.234567890123!2d${mapCoordinates.lng}!3d${mapCoordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDA2JzUyLjQiTiA5McKwNDcnNDkuMiJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin`}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Happy Drives Location"
          ></iframe>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white/5 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Frequently Asked <span className="text-red-600">Questions</span>
            </h2>
            <p className="text-gray-400 text-lg">Quick answers to common questions</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={`item-${faq.id}`}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-6 hover:border-red-600/50 transition-all duration-300"
              >
                <AccordionTrigger className="text-white hover:text-red-600 text-left py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageCircle className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prefer to Chat?
          </h2>
          <p className="text-xl text-white/90 mb-6">
            Connect with us instantly on WhatsApp for quick responses
          </p>
          <a
            href="https://wa.me/917099674802?text=Hi!%20I%20would%20like%20to%20inquire%20about%20car%20rentals."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

    </div>
  );
};

export default Contact;
