import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle, SearchX } from 'lucide-react';

export const NotFoundPage = () => (
  <div className="min-h-screen bg-black flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8">
        <SearchX className="w-12 h-12 text-red-600" />
      </div>
      <h1 className="text-8xl font-black text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
      <p className="text-gray-400 mb-8 leading-relaxed">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/"
        className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg shadow-red-600/30">
        <Home className="w-5 h-5" /> Back to Home
      </Link>
    </div>
  </div>
);

export const ServerErrorPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-yellow-600/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
        </div>
        <h1 className="text-8xl font-black text-yellow-500 mb-4">500</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          We're experiencing a technical issue. Our team has been notified and we're working on it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-600 text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors duration-300">
            <RefreshCw className="w-5 h-5" /> Try Again
          </button>
          <Link to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/20">
            <Home className="w-5 h-5" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
