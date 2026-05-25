import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Mail, Lock, ArrowRight, Sparkles, Zap, ShieldCheck, Truck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', username);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: 'Flash deals up to 40% OFF' },
    { icon: Truck, text: 'Free shipping on ₹499+' },
    { icon: ShieldCheck, text: 'Secure 128-bit checkout' },
    { icon: Star, text: 'Exclusive member prices' },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-950 transition-colors duration-300 overflow-hidden">
      {/* Left Panel — Brand Showcase */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex-col justify-between p-14 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl transform -rotate-6 group-hover:rotate-0 transition-transform">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-white">FLIPKO</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-white/90 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Premium Shopping
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-none tracking-tight">
              Your Premium<br />Shopping Hub
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs font-medium">
              Join thousands of shoppers discovering unbeatable deals on electronics, fashion, and more.
            </p>
          </div>

          <div className="space-y-3">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/85"
              >
                <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
          © 2025 Flipko. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-16 sm:px-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link to="/" className="flex items-center gap-2 justify-center">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-xl transform -rotate-6">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">FLIPKO</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sign in to your Flipko account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center font-bold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400 dark:text-slate-600" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-700 transition-all outline-none font-medium text-sm placeholder-slate-400"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400 dark:text-slate-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-700 transition-all outline-none font-medium text-sm placeholder-slate-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Social proof */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-center gap-1.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 font-medium mt-2">
              Trusted by <span className="font-black text-slate-700 dark:text-slate-300">10,000+</span> shoppers across India
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
