# Happy Drives - Car Rental Website PRD

## Project Overview
Premium car rental website for Happy Drives - a luxury self-drive car rental service with driver options and package trips.

**Color Scheme:** Black, White, Red
**Style:** Luxury, Modern, Premium

---

## Original Problem Statement
Create a premium, modern, and fully responsive website for a car rental company named Happy Drives. The company mainly focuses on self-drive cars, also provides drivers at ₹1000–₹1500 per day, and offers custom package trips. The website must look luxury, bold, and premium in both desktop and mobile view.

---

## User Personas
1. **Self-Drive Enthusiasts** - Customers who prefer driving themselves
2. **Business Travelers** - Corporate clients needing reliable transportation with professional drivers
3. **Tourists & Vacationers** - People looking for package trips and memorable experiences
4. **Local Commuters** - Daily/weekly car rentals for personal use

---

## Core Features

### Pages Implemented (Frontend with Mock Data)
1. **Home Page**
   - Hero section with luxury car background
   - Quick booking form (Pickup location, Date, Time)
   - Featured cars showcase
   - Why Choose Us section
   - Customer testimonials
   - Statistics (10K+ customers, 150+ cars, 25+ cities, 8+ years)

2. **Self-Drive Cars Page**
   - Car listing grid with images
   - Filter by category (All, Sedan, SUV, Sports)
   - Search functionality
   - Car specifications (Fuel type, Transmission, Seats)
   - Price per day display
   - Book Now buttons

3. **Driver Service Page**
   - Pricing cards (Standard ₹1000/day, Premium ₹1500/day)
   - Service features and benefits
   - Hire driver form with price calculator
   - Professional driver highlights

4. **Package Trips Page**
   - 4 curated travel packages
   - Package details (Destination, Duration, Price, Inclusions)
   - High-quality destination images
   - Custom trip request form
   - Why Choose Our Packages section

5. **About Us Page**
   - Company mission and vision
   - Core values (Customer First, Safety, Transparency, Innovation, Excellence)
   - Company story and journey
   - Trust indicators

6. **Contact Page**
   - Contact form
   - Phone, email, location information
   - Google Maps embed (Coordinates: 26.11455266882115, 91.7969922213579)
   - FAQ accordion section

### Shared Components
- **Navbar** - Sticky navigation with logo, menu links, Book Now CTA
- **Footer** - Company info, quick links, services, contact details, social media
- **WhatsApp Button** - Floating button with pulse animation

---

## Technology Stack
- **Frontend:** React 19, React Router, Tailwind CSS, Shadcn UI
- **Backend:** FastAPI, Python (to be implemented)
- **Database:** MongoDB (to be implemented)
- **Payment:** Razorpay integration (playbook ready)
- **Messaging:** WhatsApp API integration (Baileys - playbook ready)

---

## What's Been Implemented (Date: 2025-01-16)

### Frontend (Completed ✓)
- All 6 pages with mock data
- Responsive design (mobile & desktop)
- Premium black/white/red color scheme
- Smooth animations and hover effects
- Professional luxury car images (6 cars)
- Beautiful destination images (4 packages)
- Interactive forms (mock submissions)
- FAQ accordion component
- Google Maps embed

### Mock Data Structure
Location: `/app/frontend/src/mock.js`
- Cars array (6 vehicles with images, pricing, specifications)
- Packages array (4 trip packages with details)
- Driver services (pricing and features)
- Testimonials (3 customer reviews)
- FAQs (6 questions and answers)
- About Us (mission, vision, values, stats)

---

## Integration Playbooks Received

### 1. Razorpay Payment Gateway
**Status:** Playbook Ready
**Required API Keys:**
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET

**Features:**
- Payment orders creation
- Split payments for multi-party transactions
- Webhook verification for payment confirmation
- Support for INR currency

### 2. WhatsApp API (Baileys)
**Status:** Playbook Ready
**Required:** QR code authentication (no API keys needed)
**Architecture:** Node.js microservice + FastAPI backend

**Features:**
- QR code authentication
- Real-time messaging
- Customer inquiries handling
- Booking confirmations
- Support messages

---

## API Contracts (To Be Implemented)

### Bookings
```
POST /api/bookings/car
- Create car booking with payment
- Input: car_id, dates, user_info, payment_method
- Output: booking_id, payment_url, confirmation

GET /api/bookings/{booking_id}
- Retrieve booking details
- Output: booking info, payment status, car details

POST /api/bookings/driver
- Hire driver request
- Input: service_type, days, user_info
- Output: request_id, total_price, confirmation

POST /api/bookings/package
- Book package trip
- Input: package_id, travelers, dates, customizations
- Output: booking_id, total_price, itinerary
```

### Cars
```
GET /api/cars
- List all available cars
- Query params: category, price_range, available_dates
- Output: cars array with availability

GET /api/cars/{car_id}
- Get specific car details
- Output: full car information, availability calendar, pricing
```

### Packages
```
GET /api/packages
- List all package trips
- Output: packages array

POST /api/packages/custom
- Submit custom trip request
- Input: destination, duration, travelers, requirements
- Output: request_id, acknowledgment
```

### Contact
```
POST /api/contact
- Submit contact form
- Input: name, email, phone, subject, message
- Output: confirmation, ticket_id

GET /api/faqs
- Get FAQ list
- Output: faqs array
```

### Payments
```
POST /api/payments/create-order
- Create Razorpay payment order
- Input: amount, booking_id
- Output: order_id, razorpay_key, amount

POST /api/payments/verify
- Verify payment signature
- Input: razorpay_order_id, razorpay_payment_id, razorpay_signature
- Output: verification status

POST /api/payments/webhook
- Handle Razorpay webhook
- Input: payment event data
- Output: acknowledgment
```

---

## Frontend-Backend Integration Plan

### Remove Mock Data
- Replace all mock.js imports with API calls
- Use axios for HTTP requests to REACT_APP_BACKEND_URL

### State Management
- Use React useState for form states
- Implement loading states during API calls
- Add error handling and user feedback

### Forms to Connect
1. Quick Booking Form (Home) → POST /api/bookings/car
2. Car Booking (Cars Page) → POST /api/bookings/car
3. Driver Hire Form → POST /api/bookings/driver
4. Package Inquiry → POST /api/bookings/package
5. Custom Trip Form → POST /api/packages/custom
6. Contact Form → POST /api/contact

---

## Database Schema (To Be Implemented)

### Collections

**users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  created_at: DateTime,
  bookings: [ObjectId] // references to bookings
}
```

**cars**
```javascript
{
  _id: ObjectId,
  name: String,
  category: String, // Sedan, SUV, Sports
  image: String,
  price_per_day: Number,
  fuel: String,
  transmission: String,
  seats: Number,
  featured: Boolean,
  available: Boolean,
  specifications: Object
}
```

**bookings**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  type: String, // car, driver, package
  car_id: ObjectId, // if type is car
  package_id: ObjectId, // if type is package
  start_date: DateTime,
  end_date: DateTime,
  total_price: Number,
  payment_status: String, // pending, completed, failed
  payment_id: String, // Razorpay payment ID
  status: String, // confirmed, cancelled, completed
  created_at: DateTime
}
```

**packages**
```javascript
{
  _id: ObjectId,
  title: String,
  destination: String,
  duration: String,
  price: Number,
  image: String,
  inclusions: [String],
  description: String,
  available: Boolean
}
```

**driver_requests**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  service_type: String, // standard, premium
  days: Number,
  total_price: Number,
  status: String, // pending, confirmed, completed
  created_at: DateTime
}
```

**contact_submissions**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  status: String, // new, in_progress, resolved
  created_at: DateTime
}
```

---

## Prioritized Backlog

### P0 - Must Have (Backend Phase 1)
- [ ] MongoDB models for all collections
- [ ] Cars CRUD endpoints
- [ ] Packages CRUD endpoints
- [ ] Contact form submission endpoint
- [ ] Basic booking endpoints (car, driver, package)
- [ ] Frontend-backend integration
- [ ] Environment variable setup

### P1 - High Priority (Backend Phase 2)
- [ ] Razorpay payment integration
- [ ] Payment order creation
- [ ] Payment verification
- [ ] Webhook handling
- [ ] Booking confirmation emails
- [ ] User authentication (optional)

### P2 - Medium Priority (Enhancements)
- [ ] WhatsApp API integration for notifications
- [ ] Admin dashboard for managing bookings
- [ ] Availability calendar for cars
- [ ] Customer booking history
- [ ] Reviews and ratings system
- [ ] Advanced search and filters

---

## Next Action Items
1. **Ask user for Razorpay API keys** before backend implementation
2. **Build backend** with MongoDB models and API endpoints
3. **Integrate Razorpay** payment gateway
4. **Connect frontend** to backend APIs (remove mock data)
5. **Test complete booking flow** end-to-end
6. **Deploy** to production environment

---

## Notes
- All car images are from Unsplash/Pexels (free for commercial use)
- WhatsApp button currently uses static link (to be replaced with API)
- Google Maps embed uses provided coordinates (Guwahati, Assam)
- Mock data in `/app/frontend/src/mock.js` serves as data structure reference
- Design follows luxury car rental aesthetics with premium feel
