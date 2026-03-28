import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, profileCompleted } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setIsMenuOpen(false); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/cars', label: 'Self Drive' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;
  const showProfileBanner = user && !profileCompleted && location.pathname !== '/complete-profile';

  return (
    <>
      {/* Profile Completion Banner */}
      {showProfileBanner && (
        <div className="bg-orange-600/20 border-b border-orange-600/50 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <p className="text-orange-300 text-sm font-medium">
                Complete your profile to unlock all features
              </p>
            </div>
            <Link
              to="/complete-profile"
              className="px-4 py-1.5 bg-orange-600 text-white text-sm font-semibold rounded hover:bg-orange-700 transition-colors duration-300"
            >
              Complete Now
            </Link>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10" style={{ marginTop: showProfileBanner ? '52px' : '0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo — left */}
            <Link to="/" className="text-2xl font-bold text-white flex-shrink-0">
              Happy <span className="text-red-600">Drives</span>
            </Link>

            {/* All nav + auth — right side */}
            <div className="hidden md:flex items-center space-x-1">

              {/* Nav links */}
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="w-px h-6 bg-white/20 mx-2" />

              {/* Auth section */}
              {user ? (
                <>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive('/admin') ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" /><span>Admin</span>
                    </Link>
                  )}
                  {!user.is_admin && (
                    <Link
                      to="/my-bookings"
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive('/my-bookings') ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" /><span>My Bookings</span>
                    </Link>
                  )}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                    <User className="w-4 h-4 text-red-500" />
                    <span className="text-white text-sm font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" /><span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg shadow-red-600/30 text-sm"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-white/10 px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(link.to) ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
              {user ? (
                <>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10"
                    >
                      <LayoutDashboard className="w-4 h-4" /><span>Admin Panel</span>
                    </Link>
                  )}
                  {!user.is_admin && (
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10"
                    >
                      <BookOpen className="w-4 h-4" /><span>My Bookings</span>
                    </Link>
                  )}
                  <div className="flex items-center space-x-2 px-4 py-2 text-gray-400 text-xs">
                    <User className="w-3.5 h-3.5 text-red-500" />
                    <span>Logged in as <span className="text-gray-300 font-medium">{user.name}</span></span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" /><span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 bg-red-600 text-white font-semibold rounded-lg text-sm text-center"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
