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
    Box
} from 'lucide-react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

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
    
    const cartItems = useSelector(state => state.cart.items);
    const cartCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

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
        <nav className="sticky top-0 z-50 bg-[#131921] text-white">
            {/* Main Header */}
            <div className="max-w-[1500px] mx-auto flex items-center gap-4 px-4 py-2">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-1 group py-1">
                    <div className="relative flex items-center gap-2">
                        <div className="bg-amber-500 p-1.5 rounded-lg transform -rotate-6 group-hover:rotate-0 transition-transform">
                             <Box className="w-5 h-5 text-slate-900" />
                        </div>
                        <span className="text-2xl font-black italic tracking-tighter text-white">FLIPKO</span>
                        <div className="absolute -bottom-1 right-0 w-3/4 h-[2px] bg-amber-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>
                    </div>
                </Link>

                {/* Location Picker */}
                <div className="hidden lg:flex flex-col px-3 py-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white/50 rounded-sm">
                    <span className="text-[11px] text-slate-400 ml-5 leading-none">Deliver to</span>
                    <div className="flex items-center gap-0.5">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-tight">India</span>
                    </div>
                </div>

                {/* Search Bar - Amazon Style */}
                <form 
                    onSubmit={handleSearch}
                    className="flex-1 flex h-10 rounded-lg overflow-visible relative focus-within:ring-2 focus-within:ring-amber-500 transition-shadow"
                >
                    <div className="relative group hidden sm:block">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-full bg-slate-100/90 text-slate-700 px-3 pr-8 text-xs font-semibold cursor-pointer appearance-none border-r border-slate-300 hover:bg-slate-200 transition-colors"
                        >
                            <option value="All">All</option>
                            {categories.map(cat => (
                                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-3.5 pointer-events-none" />
                    </div>
                    
                    <input 
                        type="text" 
                        value={searchQuery}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Flipko premium products..."
                        className="flex-1 bg-white text-slate-900 px-4 focus:outline-none text-sm font-medium z-10"
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
                    {/* User Menu */}
                    <div className="relative">
                        <div 
                            onMouseEnter={() => setIsProfileOpen(true)}
                            onMouseLeave={() => setIsProfileOpen(false)}
                            onClick={() => navigate('/login')}
                            className="px-3 py-1 cursor-pointer hover:outline hover:outline-1 hover:outline-white/50 rounded-sm lg:flex flex-col hidden relative"
                        >
                            <span className="text-[11px] text-slate-400 leading-none">Hello, Guest</span>
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
                                            <Link to="/login" className="bg-gradient-to-b from-amber-300 to-amber-500 text-center py-2 rounded-lg font-bold text-sm shadow-md hover:from-amber-400 hover:to-amber-500 border border-amber-600 transition-all active:scale-95">
                                                Sign in
                                            </Link>
                                            <div className="text-[11px] text-center text-slate-500">
                                                New customer? <Link to="/register" className="text-blue-600 hover:underline font-bold">Start here.</Link>
                                            </div>
                                            <div className="border-t border-slate-100 pt-4">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                         <h4 className="font-bold text-sm mb-2 text-slate-800 border-b pb-1">Your Lists</h4>
                                                         <ul className="text-xs space-y-2 text-slate-600 font-medium">
                                                            <li className="hover:text-amber-600 cursor-pointer">Wish List</li>
                                                            <li className="hover:text-amber-600 cursor-pointer">Favorites</li>
                                                         </ul>
                                                    </div>
                                                    <div className="flex-1 border-l pl-4">
                                                         <h4 className="font-bold text-sm mb-2 text-slate-800 border-b pb-1">Your Account</h4>
                                                         <ul className="text-xs space-y-2 text-slate-600 font-medium">
                                                            <li className="hover:text-amber-600 cursor-pointer flex items-center gap-2" onClick={() => navigate('/orders')}>
                                                                <Package className="w-3 h-3" /> Orders
                                                            </li>
                                                            <li className="hover:text-amber-600 cursor-pointer flex items-center gap-2">
                                                                <User className="w-3 h-3" /> Account
                                                            </li>
                                                            <li className="hover:text-amber-600 cursor-pointer flex items-center gap-2">
                                                                <LogOut className="w-3 h-3" /> Sign Out
                                                            </li>
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

            {/* Sub Navbar */}
            <div className="bg-[#232f3e] px-4 py-1.5 flex items-center gap-4 text-xs font-bold overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center gap-1 hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm border border-transparent"
                >
                    <Menu className="w-5 h-5" /> All
                </button>
                <div className="flex items-center gap-5 whitespace-nowrap">
                    <span 
                        onClick={() => navigate('/?category=mobiles')} 
                        className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm cursor-pointer border border-transparent transition-all"
                    >
                        Mobiles
                    </span>
                    <span 
                        onClick={() => navigate('/?category=electronics')}
                        className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm cursor-pointer border border-transparent transition-all"
                    >
                        Electronics
                    </span>
                    <span className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm cursor-pointer border border-transparent transition-all">Fashion</span>
                    <span className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm cursor-pointer border border-transparent transition-all">Home & Kitchen</span>
                    <span className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm cursor-pointer border border-transparent transition-all">Books</span>
                    <span className="hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm cursor-pointer border border-transparent transition-all italic text-amber-400">Flipko Launch 🎉</span>
                </div>
                <div className="flex-1"></div>
                <div className="hidden lg:block text-slate-300 font-medium">
                    New Arrivals in <span className="text-white font-bold">Tech</span> | <Link to="/" className="text-amber-400 hover:underline">See all</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
