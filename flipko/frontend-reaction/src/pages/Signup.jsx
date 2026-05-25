import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, User, Mail, Lock, ArrowRight, Sparkles, Check, Gift, Zap, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('register/', { username, email, password });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(Array.isArray(err.response.data.error) ? err.response.data.error[0] : err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: Gift, label: '15% off your first order', color: 'text-rose-400 bg-rose-500/15' },
    { icon: Zap, label: 'Early Flash Sale access', color: 'text-amber-400 bg-amber-500/15' },
    { icon: Sparkles, label: 'Exclusive member prices', color: 'text-indigo-400 bg-indigo-500/15' },
    { icon: Star, label: 'Priority customer support', color: 'text-emerald-400 bg-emerald-500/15' },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-dark-950 transition-colors duration-300 overflow-hidden">
      {/* Left Panel — Brand Showcase */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex-col justify-between p-14 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-white/25 backdrop-blur-sm p-2 rounded-xl transform -rotate-6 group-hover:rotate-0 transition-transform">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-white">FLIPKO</span>
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-white/90 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Join Free Today
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-none tracking-tight">
              Unlock Exclusive<br />Member Perks
            </h2>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs font-medium">
              Create your account and instantly unlock deals, priority access, and your own personalized shopping hub.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map(({ icon: Icon, label, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className={`w-7 h-7 ${color} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
          © 2025 Flipko. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Signup Form */}
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
          {/* Welcome Offer Badge */}
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 px-3.5 py-2.5 rounded-2xl mb-6 w-fit">
            <Gift className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Get 15% off your first order</span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">Create your account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Free forever. No credit card required.</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 dark:focus:border-amber-700 transition-all outline-none font-medium text-sm placeholder-slate-400"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 dark:focus:border-amber-700 transition-all outline-none font-medium text-sm placeholder-slate-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 dark:focus:border-amber-700 transition-all outline-none font-medium text-sm placeholder-slate-400"
                  placeholder="Choose a strong password"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">
              By signing up, you agree to our{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">Terms</a> and{' '}
              <a href="#" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline">Privacy Policy</a>.
            </p>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-7 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-center gap-6">
              {[
                { val: '10K+', label: 'Members' },
                { val: '4.9★', label: 'Rating' },
                { val: 'Free', label: 'Forever' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-sm font-black text-slate-800 dark:text-white">{item.val}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
