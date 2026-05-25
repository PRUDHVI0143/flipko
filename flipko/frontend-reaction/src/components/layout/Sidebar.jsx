import React, { useEffect, useState } from 'react';
import { 
    X, 
    ChevronRight, 
    Globe, 
    Settings,
    HelpCircle,
    Flag,
    LogOut,
    Home,
    TrendingUp,
    Star,
    Zap,
    Sparkles,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, categories }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const isLoggedIn = !!localStorage.getItem('access_token');
    
    const [profile, setProfile] = useState({
        displayName: username || 'Guest',
        avatarGradient: 'from-indigo-500 to-purple-600',
        tier: 'VIP Club Member'
    });

    useEffect(() => {
        const updateSidebarProfile = () => {
            if (isLoggedIn) {
                const saved = localStorage.getItem('user_profile');
                if (saved) {
                    setProfile(JSON.parse(saved));
                } else {
                    const namePart = username?.includes('@') ? username.split('@')[0] : username;
                    const formattedName = namePart ? (namePart.charAt(0).toUpperCase() + namePart.slice(1)) : 'Guest';
                    setProfile(prev => ({ 
                        ...prev, 
                        displayName: formattedName,
                        tier: 'Platinum Club Member'
                    }));
                }
            } else {
                setProfile({
                    displayName: 'Guest',
                    avatarGradient: 'from-slate-600 to-slate-700',
                    tier: 'VIP Club Member'
                });
            }
        };

        updateSidebarProfile();
        window.addEventListener('profileUpdate', updateSidebarProfile);
        window.addEventListener('storage', updateSidebarProfile);
        return () => {
            window.removeEventListener('profileUpdate', updateSidebarProfile);
            window.removeEventListener('storage', updateSidebarProfile);
        };
    }, [isLoggedIn, username, isOpen]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        onClose();
        window.location.reload();
    };

    const handleLoginClick = () => {
        onClose();
        navigate('/login');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Frosted Glass */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/65 z-[100] backdrop-blur-sm"
                    />

                    {/* Sidebar Content Panel */}
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-0 left-0 bottom-0 w-[360px] bg-white dark:bg-dark-900 z-[101] flex flex-col shadow-2xl border-r border-slate-100 dark:border-slate-800"
                    >
                        {/* Header Banner - High contrast dark gradient */}
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 pt-8 flex items-center justify-between border-b border-orange-500/20 shadow-md">
                            <div className="flex items-center gap-3.5">
                                {/* Profile Avatar */}
                                <div 
                                    onClick={() => {
                                        if (isLoggedIn) {
                                            navigate('/account');
                                            onClose();
                                        } else {
                                            handleLoginClick();
                                        }
                                    }}
                                    className={`w-12 h-12 rounded-full bg-gradient-to-tr ${profile.avatarGradient} flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white/20 hover:scale-105 transition-transform cursor-pointer`}
                                >
                                    {profile.displayName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black tracking-tight leading-none">
                                        Hello, {profile.displayName}
                                    </h3>
                                    {isLoggedIn ? (
                                        <span className="inline-block text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                                            ★ {profile.tier}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 font-semibold">Welcome to Flipko</span>
                                    )}
                                </div>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all hover:rotate-90 duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable List container */}
                        <div className="flex-1 overflow-y-auto pt-6 pb-12 scrollbar-hide">
                            
                            {/* Trending section */}
                            <section className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="px-6 pb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Trending Feeds</span>
                                </div>
                                <ul className="text-sm font-semibold text-slate-700 dark:text-slate-300 space-y-0.5 px-3">
                                    <li 
                                        onClick={() => { navigate('/'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex justify-between items-center group hover:translate-x-1"
                                    >
                                        <span>Best Sellers</span>
                                        <span className="text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Top</span>
                                    </li>
                                    <li 
                                        onClick={() => { navigate('/'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex justify-between items-center group hover:translate-x-1"
                                    >
                                        <span>New Releases</span>
                                        <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">New</span>
                                    </li>
                                    <li 
                                        onClick={() => { navigate('/'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex justify-between items-center group hover:translate-x-1"
                                    >
                                        <span>Movers and Shakers</span>
                                        <span className="text-[8px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">Hot</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Shop By Category */}
                            <section className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="px-6 pb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <Star className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Shop By Category</span>
                                </div>
                                <ul className="text-sm font-semibold text-slate-700 dark:text-slate-300 space-y-0.5 px-3">
                                    {categories.map(cat => (
                                        <li 
                                            key={cat.slug} 
                                            onClick={() => {
                                                navigate(`/?category=${cat.slug}`);
                                                onClose();
                                            }}
                                            className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex justify-between items-center group hover:translate-x-1"
                                        >
                                            <span className="capitalize">{cat.name}</span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Features */}
                            <section className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                                <div className="px-6 pb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Programs & Features</span>
                                </div>
                                <ul className="text-sm font-semibold text-slate-700 dark:text-slate-300 space-y-0.5 px-3">
                                    <li 
                                        onClick={() => { navigate('/account'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex justify-between items-center group hover:translate-x-1"
                                    >
                                        <span>Flipko VIP Premium</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                    </li>
                                    <li 
                                        onClick={() => { navigate('/'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex justify-between items-center group hover:translate-x-1"
                                    >
                                        <span>Beta Launchpad</span>
                                        <span className="text-[8px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">Beta</span>
                                    </li>
                                    <li 
                                        onClick={() => { navigate('/account'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all"
                                    >
                                        <span>Gift Cards</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Help & Settings */}
                            <section className="px-3">
                                <div className="px-3 pb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <Settings className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Help & Settings</span>
                                </div>
                                <ul className="text-sm font-semibold text-slate-700 dark:text-slate-300 space-y-0.5">
                                    <li 
                                        onClick={() => { navigate('/account'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all"
                                    >
                                        Your Account
                                    </li>
                                    <li className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-indigo-500" /> 
                                        <span>English</span>
                                    </li>
                                    <li className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all flex items-center gap-3">
                                        <Flag className="w-4 h-4 text-indigo-500" /> 
                                        <span>India</span>
                                    </li>
                                    <li 
                                        onClick={() => { navigate('/orders'); onClose(); }}
                                        className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-dark-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl cursor-pointer transition-all"
                                    >
                                        Customer Care Help
                                    </li>
                                    {isLoggedIn ? (
                                        <li 
                                            onClick={handleLogout}
                                            className="px-5 py-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer transition-all flex items-center gap-3 text-rose-600 font-extrabold"
                                        >
                                            <LogOut className="w-4 h-4" /> 
                                            <span>Sign Out</span>
                                        </li>
                                    ) : (
                                        <li 
                                            onClick={handleLoginClick}
                                            className="px-5 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl cursor-pointer transition-all flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-extrabold"
                                        >
                                            <User className="w-4 h-4" /> 
                                            <span>Sign In</span>
                                        </li>
                                    )}
                                </ul>
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
