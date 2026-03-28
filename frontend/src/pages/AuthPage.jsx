import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inputCls = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent";

const AuthPage = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const data = await login(form.email, form.password);
        // Check if profile is completed
        if (!data.user.profile_completed) {
          navigate('/complete-profile');
        } else {
          navigate(data.user.is_admin ? '/admin' : '/cars');
        }
      } else {
        if (!form.name)               { setError('Name is required.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        await signup(form.name, form.email, form.password, form.phone);
        // New users go to profile completion
        navigate('/complete-profile');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const switchMode = () => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); };

  return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold text-red-600">Happy Drives</Link>
            <h1 className="text-white text-2xl font-bold mt-4">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-400 mt-2">
              {mode === 'login' ? 'Sign in to book your dream car' : 'Join Happy Drives today'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-600/10 border border-red-600/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-6">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <input type="text" value={form.name} onChange={set('name')} required
                    className={inputCls} placeholder="Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input type="tel" value={form.phone} onChange={set('phone')}
                    className={inputCls} placeholder="+91 70996 74802" />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
              <input type="email" value={form.email} onChange={set('email')} required
                className={inputCls} placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} required
                  className={`${inputCls} pr-12`}
                  placeholder={mode === 'login' ? 'Your password' : 'Min 6 characters'} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg shadow-red-600/30 disabled:opacity-50 mt-2">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} className="text-red-500 font-semibold hover:text-red-400">
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
