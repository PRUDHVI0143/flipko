import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
    // In future: dispatch a Redux action to authenticate via API
  };

  return (
    <div className="flex justify-center items-center py-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <div className="bg-primary-50 p-3 rounded-2xl">
                <Package className="text-primary-500 w-10 h-10" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
            <p className="text-center text-slate-500 mb-8 font-light">Sign in to your Reaction account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500/50 transition-shadow outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-xs text-primary-600 font-medium hover:text-primary-700">Forgot?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-0 text-slate-900 rounded-xl focus:ring-2 focus:ring-primary-500/50 transition-shadow outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="glow-button">
                  Sign In
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <a href="#" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Sign up instead
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
