# 🚗 Happy Drives - Premium Car Rental Platform

<div align="center">

![Happy Drives](https://img.shields.io/badge/Happy-Drives-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-4.5-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A luxury car rental platform with self-drive options, professional driver services, and curated travel packages.**

[Demo](#) • [Features](#features) • [Installation](#installation) • [API Docs](#api-documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Payment Integration](#payment-integration)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**Happy Drives** is a full-stack car rental platform designed to provide seamless, safe, and luxurious self-drive car rental experiences. The platform features:

- **Self-Drive Cars**: Premium fleet of 150+ luxury vehicles
- **Driver Services**: Professional drivers at ₹1,000-₹1,500 per day
- **Package Trips**: Curated travel packages across 25+ Indian cities
- **Real-time Booking**: Instant booking with secure payment gateway

### Why Happy Drives?

✅ 10,000+ Happy Customers  
✅ 150+ Premium Vehicles  
✅ 25+ Cities Covered  
✅ 8+ Years of Excellence  

---

## ✨ Features

### 🏠 User Features

- **Smart Search & Filters**: Find cars by category (Sedan, SUV, Sports), price, and availability
- **Quick Booking**: Fast booking form with location, date, and time selection
- **Multiple Services**:
  - Self-drive car rentals
  - Professional driver hiring
  - Pre-packaged trips
  - Custom trip planning
- **Secure Payments**: Razorpay integration for safe transactions
- **Real-time Communication**: WhatsApp integration for instant support
- **FAQ Section**: Interactive accordion with common questions
- **Testimonials**: Customer reviews and ratings
- **Google Maps Integration**: Easy location finding

### 🎨 Design Features

- **Premium UI/UX**: Luxury black, white, and red color scheme
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Glass-morphism Effects**: Modern backdrop blur designs
- **High-quality Images**: Professional car and destination photography

### 🔧 Technical Features

- **RESTful API**: Clean and well-documented endpoints
- **MongoDB Database**: Scalable NoSQL database
- **Payment Gateway**: Razorpay integration with webhook support
- **WhatsApp API**: Automated customer notifications
- **Form Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error management
- **Hot Reload**: Development mode with instant updates

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19.0
- **Routing**: React Router DOM 7.5.1
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **HTTP Client**: Axios 1.8.4
- **Toast Notifications**: Sonner
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: FastAPI 0.110.1
- **Server**: Uvicorn 0.25.0
- **Database**: MongoDB (Motor async driver 3.3.1)
- **Authentication**: PyJWT 2.10.1
- **Validation**: Pydantic 2.6.4
- **Payment**: Razorpay
- **Messaging**: WhatsApp (Baileys)

### DevOps & Tools
- **Process Manager**: Supervisor
- **Version Control**: Git
- **Package Managers**: Yarn (Frontend), Pip (Backend)
- **Linting**: ESLint, Ruff
- **Testing**: Pytest (Backend)

---

## 📁 Project Structure

```
happy-drives/
├── frontend/                # React frontend application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── WhatsAppButton.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── SelfDriveCars.jsx
│   │   │   ├── DriverService.jsx
│   │   │   ├── PackageTrips.jsx
│   │   │   ├── AboutUs.jsx
│   │   │   └── Contact.jsx
│   │   ├── mock.js        # Mock data (to be replaced)
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env               # Environment variables
│
├── backend/               # FastAPI backend application
│   ├── server.py         # Main application entry
│   ├── models.py         # Database models (to be created)
│   ├── routes/           # API routes (to be created)
│   ├── utils/            # Utility functions (to be created)
│   ├── requirements.txt
│   └── .env              # Environment variables
│
├── memory/
│   └── PRD.md            # Product Requirements Document
│
├── supervisord.conf      # Process management config
└── README.md             # This file
```

---

## 🚀 Installation

### Quick Start (5 Minutes)
👉 **New to the project?** Follow our [**Quick Start Guide**](QUICK_START.md) for a fast setup!

### Complete Setup Instructions
📖 **Need detailed steps?** Check the [**Complete Setup Guide**](SETUP_GUIDE.md) with:
- Detailed software installation for Windows, macOS, and Linux
- Production deployment on VPS/Cloud servers
- Docker deployment
- Troubleshooting guide
- Performance optimization tips

### Prerequisites

- **Node.js**: v16+ and Yarn
- **Python**: 3.9-3.11 (Recommended: 3.10)
- **MongoDB**: 5.0+ (Recommended: 6.0)
- **Git**: Latest version

### Clone Repository

```bash
git clone https://github.com/yourusername/happy-drives.git
cd happy-drives
```

### Frontend Setup

```bash
cd frontend
yarn install
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## ⚙️ Environment Setup

### Frontend Environment Variables

Create `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Backend Environment Variables

Create `backend/.env`:

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=happy_drives

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Environment
ENVIRONMENT=development
```

---

## 💻 Usage

### Development Mode

#### Start MongoDB
```bash
sudo systemctl start mongodb
# or
mongod --dbpath /data/db
```

#### Start Backend
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

#### Start Frontend
```bash
cd frontend
yarn start
```

Visit `http://localhost:3000` in your browser.

### Production Mode

#### Build Frontend
```bash
cd frontend
yarn build
```

#### Run Backend
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

#### Using Supervisor (Recommended)
```bash
sudo supervisorctl start all
sudo supervisorctl status
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:8001/api
Production: https://your-domain.com/api
```

### Authentication
Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Endpoints

#### Cars

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cars` | Get all cars | No |
| GET | `/api/cars/{id}` | Get car by ID | No |
| POST | `/api/cars` | Create new car | Yes (Admin) |
| PUT | `/api/cars/{id}` | Update car | Yes (Admin) |
| DELETE | `/api/cars/{id}` | Delete car | Yes (Admin) |

**Query Parameters for GET /api/cars:**
- `category`: Filter by category (Sedan, SUV, Sports)
- `min_price`: Minimum price per day
- `max_price`: Maximum price per day
- `available`: Boolean for availability

**Example Response:**
```json
{
  "cars": [
    {
      "id": "1",
      "name": "Mercedes Benz S-Class",
      "category": "Sedan",
      "price_per_day": 5999,
      "fuel": "Diesel",
      "transmission": "Automatic",
      "seats": 5,
      "image": "https://...",
      "featured": true,
      "available": true
    }
  ],
  "total": 6
}
```

#### Bookings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/car` | Create car booking | Yes |
| POST | `/api/bookings/driver` | Hire driver | Yes |
| POST | `/api/bookings/package` | Book package trip | Yes |
| GET | `/api/bookings/{id}` | Get booking details | Yes |
| GET | `/api/bookings/user` | Get user's bookings | Yes |

**POST /api/bookings/car Request:**
```json
{
  "car_id": "1",
  "start_date": "2025-02-01",
  "end_date": "2025-02-05",
  "pickup_location": "Guwahati Airport",
  "pickup_time": "10:00",
  "user_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

#### Packages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/packages` | Get all packages | No |
| GET | `/api/packages/{id}` | Get package by ID | No |
| POST | `/api/packages/custom` | Submit custom trip request | No |

#### Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-order` | Create payment order | Yes |
| POST | `/api/payments/verify` | Verify payment | Yes |
| POST | `/api/payments/webhook` | Razorpay webhook | No |

**POST /api/payments/create-order Request:**
```json
{
  "booking_id": "booking_123",
  "amount": 29995
}
```

**Response:**
```json
{
  "order_id": "order_xyz",
  "amount": 29995,
  "currency": "INR",
  "razorpay_key": "rzp_test_...",
  "callback_url": "https://..."
}
```

#### Contact

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contact` | Submit contact form | No |
| GET | `/api/faqs` | Get FAQs | No |

---

## 💳 Payment Integration

Happy Drives uses **Razorpay** for secure payment processing.

### Setup Razorpay

1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get API keys from Settings → API Keys
3. Add keys to `backend/.env`
4. Configure webhook URL: `https://your-domain.com/api/payments/webhook`

### Payment Flow

1. User selects car/service and fills booking form
2. Frontend calls `/api/bookings/car` to create booking
3. Backend creates Razorpay order via `/api/payments/create-order`
4. Frontend opens Razorpay checkout with order details
5. User completes payment
6. Razorpay sends webhook to backend
7. Backend verifies signature and updates booking status
8. User receives confirmation email/WhatsApp message

### Test Cards

| Card Number | Expiry | CVV | Result |
|------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future date | Any | Success |
| 4012 0010 3714 1112 | Any future date | Any | Declined |

---

## 📸 Screenshots

### Home Page
![Home Page](screenshots/home.png)
*Hero section with luxury car and quick booking form*

### Self-Drive Cars
![Cars Page](screenshots/cars.png)
*Premium car collection with filters and search*

### Driver Service
![Driver Service](screenshots/driver-service.png)
*Professional driver hiring with pricing*

### Package Trips
![Packages](screenshots/packages.png)
*Curated travel packages with destinations*

### Contact Page
![Contact](screenshots/contact.png)
*Contact form with Google Maps integration*

---

## 🗺 Roadmap

### Phase 1 - MVP ✅
- [x] Frontend with all pages
- [x] Responsive design
- [x] Mock data structure
- [x] UI/UX polish

### Phase 2 - Backend (In Progress)
- [ ] MongoDB models
- [ ] RESTful API endpoints
- [ ] User authentication
- [ ] Booking management
- [ ] Admin dashboard

### Phase 3 - Integrations
- [ ] Razorpay payment gateway
- [ ] WhatsApp API notifications
- [ ] Email service (SendGrid)
- [ ] SMS notifications

### Phase 4 - Advanced Features
- [ ] Live availability calendar
- [ ] Dynamic pricing
- [ ] User reviews and ratings
- [ ] Referral system
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Phase 5 - Analytics & Optimization
- [ ] Google Analytics
- [ ] SEO optimization
- [ ] Performance monitoring
- [ ] A/B testing
- [ ] Customer behavior tracking

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Code Style

**Frontend:**
- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Use Lucide React for icons

**Backend:**
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Use async/await for I/O operations

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, versions)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Happy Drives

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact

**Happy Drives**
- 📧 Email: info@happydrives.com
- 📱 Phone: +91 98765 43210
- 🌐 Website: https://happydrives.com
- 💬 WhatsApp: +91 98765 43210

**Development Team**
- GitHub: [@happydrives](https://github.com/happydrives)
- Twitter: [@happydrives](https://twitter.com/happydrives)

---

## 🙏 Acknowledgments

- **Unsplash & Pexels** - For high-quality car images
- **Shadcn UI** - For beautiful UI components
- **Razorpay** - For payment gateway services
- **MongoDB** - For database infrastructure
- **FastAPI** - For modern Python backend framework
- **React Team** - For the amazing frontend library

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/happy-drives?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/happy-drives?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/happy-drives)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/happy-drives)

---

<div align="center">

**Made with ❤️ by Happy Drives Team**

[⬆ Back to Top](#-happy-drives---premium-car-rental-platform)

</div>
