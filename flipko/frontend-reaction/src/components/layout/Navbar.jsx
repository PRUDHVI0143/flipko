import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Search, 
    ShoppingCart, 
    User, 
    MapPin, 
    ChevronDown, 
    Menu, 
    Package, 
    Heart, 
    LogOut,
    Bell,
    Box,
    Sun,
    Moon,
    TrendingUp,
    Sparkles
} from 'lucide-react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

import Sidebar from './Sidebar';

const Navbar = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    
    const cartItems = useSelector(state => state.cart.items);
    const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

    const username = localStorage.getItem('username');
    const isLoggedIn = !!localStorage.getItem('access_token');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.reload(); // Reload to clear any state and reflect logged out UI
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const response = await api.get(`/products/?q=${searchQuery}&limit=6`);
                setSuggestions(response.data.slice(0, 6));
            } catch (error) {
                console.error('Failed to fetch suggestions');
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedCategory !== 'All') params.set('category', selectedCategory);
        navigate(`/?${params.toString()}`);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-dark-900 text-slate-800 dark:text-white shadow-md dark:shadow-dark-900/50 transition-all duration-500 border-b border-orange-100 dark:border-white/5">
            {/* Main Header */}
            <div className="max-w-[1500px] mx-auto flex items-center gap-4 px-4 py-3">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-1 group py-1">
                    <div className="relative flex items-center gap-2">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 rounded-xl transform -rotate-6 group-hover:rotate-0 transition-transform shadow-lg shadow-orange-500/20">
                             <Box className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">FLIPKO</span>
                        <div className="absolute -bottom-1 right-0 w-3/4 h-[2px] bg-orange-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>
                    </div>
                </Link>

                {/* Location Picker */}
                <div className="hidden lg:flex flex-col px-3 py-1 cursor-pointer hover:bg-orange-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                    <span className="text-[11px] text-slate-400 ml-5 leading-none">Deliver to</span>
                    <div className="flex items-center gap-0.5">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold tracking-tight">India</span>
                    </div>
                </div>

                {/* Search Bar - Modernized */}
                <form 
                    onSubmit={handleSearch}
                    className="flex-1 flex h-12 rounded-2xl overflow-visible relative focus-within:ring-4 focus-within:ring-orange-500/20 transition-all bg-orange-50/50 dark:bg-dark-800 border border-orange-100 dark:border-white/10"
                >
                    <div className="relative group hidden sm:block">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-full bg-transparent text-slate-700 dark:text-slate-300 px-4 pr-10 text-xs font-bold cursor-pointer appearance-none border-r border-orange-100 dark:border-white/10 hover:bg-orange-100 dark:hover:bg-white/5 transition-colors rounded-l-2xl"
                        >
                            <option value="All">All</option>
                            {categories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-4 top-4.5 pointer-events-none" />
                    </div>
                    
                    <input 
                        type="text" 
                        value={searchQuery}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Flipko premium products..."
                        className="flex-1 bg-transparent text-slate-900 dark:text-white px-5 focus:outline-none text-sm font-bold z-10"
                    />

                    {/* Suggestions Dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-[100%] left-0 right-0 bg-white shadow-2xl rounded-b-xl overflow-hidden z-[60] border border-slate-200 mt-1"
                            >
                                {suggestions.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => {
                                            navigate(`/product/${item.id}`);
                                            setShowSuggestions(false);
                                            setSearchQuery('');
                                        }}
                                        className="flex items-center gap-4 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group"
                                    >
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex-shrink-0 p-1 flex items-center justify-center">
                                            <img 
                                                src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8080${item.image}`} 
                                                className="w-full h-full object-contain"
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-sm font-bold text-slate-800 truncate group-hover:text-amber-600 transition-colors">{item.name}</h5>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{item.category?.name || 'Item'}</p>
                                        </div>
                                        <div className="text-sm font-black text-slate-900">₹{item.price}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <button 
                        type="submit"
                        className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-5 transition-colors z-10"
                    >
                        <Search className="w-5 h-5 font-bold" />
                    </button>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    {/* Theme Toggle */}
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            toggleTheme();
                        }}
                        className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 mr-2 flex items-center justify-center text-amber-400 dark:text-indigo-400 group relative overflow-hidden"
                        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ y: 20, opacity: 0, rotate: -90 }}
                                animate={{ y: 0, opacity: 1, rotate: 0 }}
                                exit={{ y: -20, opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.2 }}
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5 fill-amber-400" /> : <Moon className="w-5 h-5 fill-indigo-400" />}
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <div 
                            onMouseEnter={() => setIsProfileOpen(true)}
                            onMouseLeave={() => setIsProfileOpen(false)}
                            onClick={() => !isLoggedIn && navigate('/login')}
                            className="px-3 py-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white/50 rounded-sm lg:flex flex-col hidden relative"
                        >
                            <span className="text-[11px] text-slate-400 leading-none">Hello, {isLoggedIn ? username : 'Guest'}</span>
                            <div className="flex items-center">
                                <span className="text-sm font-bold">Account & Lists</span>
                                <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 mt-0 w-64 bg-white shadow-2xl rounded-lg p-5 text-slate-900 z-[100] cursor-default border border-slate-200"
                                    >
                                        <div className="flex flex-col gap-4">
                                            {!isLoggedIn ? (
                                                <>
                                                    <Link to="/login" className="bg-gradient-to-b from-amber-300 to-amber-500 text-center py-2 rounded-lg font-bold text-sm shadow-md hover:from-amber-400 hover:to-amber-500 border border-amber-600 transition-all active:scale-95">
                                                        Sign in
                                                    </Link>
                                                    <div className="text-[11px] text-center text-slate-500">
                                                        New customer? <Link to="/signup" className="text-blue-600 hover:underline font-bold">Start here.</Link>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <p className="text-sm font-semibold text-slate-800">Welcome back,</p>
                                                    <p className="text-amber-600 font-bold">{username}</p>
                                                </div>
                                            )}
                                            <div className="border-t border-slate-100 pt-4">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                         <h4 className="font-bold text-sm mb-2 text-slate-800 border-b pb-1">Your Lists</h4>
                                                         <ul className="text-xs space-y-2 text-slate-600 font-medium">
                                                            <li className="hover:text-amber-600 cursor-pointer" onClick={() => navigate('/wishlist')}>Wish List</li>
                                                            <li className="hover:text-amber-600 cursor-pointer" onClick={() => navigate('/wishlist')}>Favorites</li>
                                                         </ul>
                                                    </div>
                                                    <div className="flex-1 border-l pl-4">
                                                         <h4 className="font-bold text-sm mb-2 text-slate-800 border-b pb-1">Your Account</h4>
                                                         <ul className="text-xs space-y-2 text-slate-600 font-medium">
                                                            <li className="hover:text-amber-600 cursor-pointer flex items-center gap-2" onClick={() => navigate('/orders')}>
                                                                <Package className="w-3 h-3" /> Orders
                                                            </li>
                                                            <li className="hover:text-amber-600 cursor-pointer flex items-center gap-2" onClick={() => navigate('/account')}>
                                                                <User className="w-3 h-3" /> Account
                                                            </li>
                                                            {isLoggedIn && (
                                                                <li onClick={handleLogout} className="hover:text-amber-600 cursor-pointer flex items-center gap-2 text-red-500">
                                                                    <LogOut className="w-3 h-3" /> Sign Out
                                                                </li>
                                                            )}
                                                         </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Orders */}
                    <Link to="/orders" className="hidden md:flex flex-col px-3 py-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white/50 rounded-sm">
                        <span className="text-[11px] text-slate-400 leading-none">Returns</span>
                        <span className="text-sm font-bold">& Orders</span>
                    </Link>

                    {/* Cart */}
                    <Link to="/cart" className="flex items-end px-3 py-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white/50 rounded-sm relative ml-2">
                        <div className="relative">
                            <ShoppingCart className="w-8 h-8" />
                            <span className="absolute top-0 right-1 bg-amber-500 text-slate-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#131921]">
                                {cartCount}
                            </span>
                        </div>
                        <span className="text-sm font-bold hidden lg:inline ml-1 mb-1">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                categories={categories} 
            />

            {/* Sub Navbar - Warm & Inviting */}
            <div className="bg-amber-50 dark:bg-dark-950/80 backdrop-blur-md px-6 py-2 flex items-center gap-6 text-xs font-bold overflow-x-auto scrollbar-hide border-b border-orange-100 dark:border-white/10 transition-all duration-300">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center gap-2 bg-orange-100 dark:bg-white/10 hover:bg-orange-200 dark:hover:bg-white/20 text-orange-900 dark:text-white px-4 py-1.5 rounded-full border border-orange-200 dark:border-white/10 transition-all active:scale-95 group"
                >
                    <Menu className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span>All Categories</span>
                </button>
                
                <div className="flex items-center gap-8 whitespace-nowrap text-orange-800 dark:text-slate-300">
                    <Link to="/?category=new-arrivals" className="hover:text-orange-600 dark:hover:text-white transition-colors flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        New Arrivals
                    </Link>
                    <Link to="/orders" className="hover:text-orange-600 dark:hover:text-white transition-colors">Customer Service</Link>
                    <Link to="/wishlist" className="hover:text-orange-600 dark:hover:text-white transition-colors">Your Wishlist</Link>
                    <span className="hover:text-orange-600 dark:hover:text-white transition-colors cursor-pointer">Sell on Flipko</span>
                </div>

                <div className="flex-1"></div>
                
                <div className="hidden lg:flex items-center gap-2 text-orange-700/60 dark:text-slate-400 font-medium tracking-tight">
                    <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                    Trending: <span className="text-orange-900 dark:text-white font-bold">Premium Electronics</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
