import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar    from "./components/Navbar";
import Footer    from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

import Home             from "./pages/Home";
import AboutUs          from "./pages/AboutUs";
import Contact          from "./pages/Contact";
import SelfDriveCars    from "./pages/SelfDriveCars";
import AuthPage         from "./pages/AuthPage";
import BookingPage      from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import MyBookings       from "./pages/MyBookings";
import AdminPanel       from "./pages/AdminPanel";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import ProfileCompletion from "./pages/ProfileCompletion";
import { NotFoundPage, ServerErrorPage } from "./pages/ErrorPages";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user)          return <Navigate to="/auth" replace />;
  if (!user.is_admin) return <Navigate to="/"    replace />;
  return children;
}

function ProfileCompleteRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.profile_completed) return <Navigate to="/cars" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/about"   element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cars"    element={<SelfDriveCars />} />
        <Route path="/auth"    element={<AuthPage />} />
        <Route path="/login"   element={<AuthPage />} />
        <Route path="/complete-profile" element={<ProfileCompleteRoute><ProfileCompletion /></ProfileCompleteRoute>} />
        <Route path="/500"     element={<ServerErrorPage />} />

        <Route path="/booking/:carId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
        <Route path="/booking/confirm/:bookingId" element={<PrivateRoute><ConfirmationPage /></PrivateRoute>} />
        <Route path="/payment/failed" element={<PrivateRoute><PaymentFailedPage /></PrivateRoute>} />
        <Route path="/my-bookings"    element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/admin/*"        element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="*"               element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
