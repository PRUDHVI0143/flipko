import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('register/', { username, email, password });
      alert('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(Array.isArray(err.response.data.error) ? err.response.data.error[0] : err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex justify-center items-center py-20 bg-[#f8fafc] dark:bg-dark-900 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <div className="bg-white dark:bg-dark-800 rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-all">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-50 dark:bg-dark-900 p-4 rounded-3xl">
                <User className="text-primary-500 w-10 h-10" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-center text-slate-800 dark:text-white mb-2">Create Account</h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-8 font-medium">Join Flipko for the best experience</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-2xl border border-red-100 dark:border-red-900/30 text-center font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border-0 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-primary-500/50 transition-all outline-none font-medium"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border-0 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-primary-500/50 transition-all outline-none font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 dark:text-slate-600" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-dark-900 border-0 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-primary-500/50 transition-all outline-none font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="glow-button w-full py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                  Sign Up
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-primary-600 dark:text-primary-400 hover:underline transition-colors">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
