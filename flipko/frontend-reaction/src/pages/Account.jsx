import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Package, Heart, LogOut, Settings } from 'lucide-react';
import api from '../api/axios';

const Account = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const [userStats, setUserStats] = useState({ orders: 0, wishlist: 0 });

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        
        // Fetch stats (mock for now, could fetch from backend)
        const fetchStats = async () => {
            try {
                // Fetch wishlist count
                const wlRes = await api.get('/wishlist/');
                // Fetch orders count
                const ordersRes = await api.get('/orders/');
                
                setUserStats({
                    wishlist: wlRes.data?.items?.length || 0,
                    orders: ordersRes.data?.length || 0
                });
            } catch (error) {
                console.error("Failed to fetch user stats", error);
            }
        };
        fetchStats();
    }, [isLoggedIn, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    if (!isLoggedIn) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-900 font-sans pb-24 pt-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-6 sm:px-10">
                <div className="flex items-center gap-4 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                        <User className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Account</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your profile, orders, and preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Profile Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg shadow-indigo-500/30 mb-4">
                                {username?.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{username}</h2>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-6">
                                <Mail className="w-4 h-4" />
                                <span>User Email (Hidden)</span>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 shadow-lg shadow-amber-500/20 text-white relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                            <h3 className="font-black text-xl mb-2 relative z-10">Flipko Plus</h3>
                            <p className="text-sm font-medium text-amber-50 relative z-10 mb-4">You are not a Flipko Plus member yet. Upgrade to unlock free shipping.</p>
                            <button className="bg-white text-amber-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm relative z-10 hover:bg-amber-50 transition-colors">
                                Explore Plus
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Orders Card */}
                            <div 
                                onClick={() => navigate('/orders')}
                                className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-dark-900/50 cursor-pointer transition-all group"
                            >
                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Package className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Your Orders</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Track, return, or buy things again</p>
                                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{userStats.orders}</div>
                            </div>

                            {/* Wishlist Card */}
                            <div 
                                onClick={() => navigate('/wishlist')}
                                className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-dark-900/50 cursor-pointer transition-all group"
                            >
                                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Your Wishlist</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">View items you've saved for later</p>
                                <div className="text-2xl font-black text-rose-500 dark:text-rose-400">{userStats.wishlist}</div>
                            </div>
                        </div>

                        {/* Security Settings Placeholder */}
                        <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-500" /> Security & Privacy
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700/50">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">Password</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Update your password</p>
                                    </div>
                                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">Edit</button>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-700/50">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">2-Step Verification</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                                    </div>
                                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">Turn On</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
