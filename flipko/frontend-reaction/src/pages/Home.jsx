import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, Star, LayoutGrid, Search, 
    Clock, Zap, ArrowRight, TrendingUp, 
    Smartphone, Laptop, Shirt, Home as HomeIcon, 
    Book, Gamepad2, Dumbbell, PenTool, Sparkles, Check, Heart,
    SlidersHorizontal, Eye, Truck, ShieldCheck, Headphones, RotateCcw,
    X, ChevronLeft, ChevronRight, Mail, Sparkles as SparklesIcon
} from 'lucide-react';

import SEO from '../components/common/SEO';
import { ProductSkeleton, CategorySkeleton } from '../components/ui/Skeleton';

// Category-specific glow, hover backgrounds and styles
const CATEGORY_STYLES = {
    "mobiles": { 
        bg: "group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600", 
        glow: "bg-blue-500/20 dark:bg-blue-600/30", 
        text: "group-hover:text-blue-600 dark:group-hover:text-blue-400"
    },
    "electronics": { 
        bg: "group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600", 
        glow: "bg-purple-500/20 dark:bg-purple-600/30", 
        text: "group-hover:text-purple-600 dark:group-hover:text-purple-400"
    },
    "fashion": { 
        bg: "group-hover:bg-rose-500 group-hover:text-white dark:group-hover:bg-rose-500", 
        glow: "bg-rose-500/20 dark:bg-rose-600/30", 
        text: "group-hover:text-rose-500 dark:group-hover:text-rose-400"
    },
    "home-kitchen": { 
        bg: "group-hover:bg-amber-600 group-hover:text-white dark:group-hover:bg-amber-600", 
        glow: "bg-amber-500/20 dark:bg-amber-600/30", 
        text: "group-hover:text-amber-600 dark:group-hover:text-amber-400"
    },
    "grocery": { 
        bg: "group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-600", 
        glow: "bg-emerald-500/20 dark:bg-emerald-600/30", 
        text: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
    },
    "books": { 
        bg: "group-hover:bg-cyan-600 group-hover:text-white dark:group-hover:bg-cyan-600", 
        glow: "bg-cyan-500/20 dark:bg-cyan-600/30", 
        text: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
    },
    "beauty-grooming": { 
        bg: "group-hover:bg-fuchsia-500 group-hover:text-white dark:group-hover:bg-fuchsia-500", 
        glow: "bg-fuchsia-500/20 dark:bg-fuchsia-600/30", 
        text: "group-hover:text-fuchsia-500 dark:group-hover:text-fuchsia-400"
    },
    "toys-games": { 
        bg: "group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600", 
        glow: "bg-indigo-500/20 dark:bg-indigo-600/30", 
        text: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
    },
    "sports-outdoor": { 
        bg: "group-hover:bg-red-600 group-hover:text-white dark:group-hover:bg-red-600", 
        glow: "bg-red-500/20 dark:bg-red-600/30", 
        text: "group-hover:text-red-600 dark:group-hover:text-red-400"
    },
    "stationery": { 
        bg: "group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-600", 
        glow: "bg-teal-500/20 dark:bg-teal-600/30", 
        text: "group-hover:text-teal-600 dark:group-hover:text-teal-400"
    }
};

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const isLoggedIn = !!localStorage.getItem('access_token');
    
    const searchQuery = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || '';
    
    // Sort and client-side filter states
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('default');
    const [priceRange, setPriceRange] = useState('all');

    // Quick View modal state
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [quickViewQty, setQuickViewQty] = useState(1);

    // Toast alert state
    const [toast, setToast] = useState(null);
    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Newsletter email state
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
    
    const [activeBanner, setActiveBanner] = useState(0);
    const banners = [
        { 
            img: "/hero-tech.png", 
            title: "Next-Gen Tech Hub",
            subtitle: "Discover the future of computing, immersive audio, and premium gaming."
        },
        { 
            img: "/hero-fashion.png", 
            title: "Designer Fashion",
            subtitle: "Elevate your style statement with our exclusive curated collections."
        },
        { 
            img: "/ad-home.png", 
            title: "Modern Living Spaces",
            subtitle: "Transform your home with luxury furnishings and culinary essentials."
        }
    ];

    useEffect(() => {
        if (searchQuery || selectedCategory) return;
        const interval = setInterval(() => {
            setActiveBanner((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [searchQuery, selectedCategory]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Timer for Flash Sale
    const [timeLeft, setTimeLeft] = useState({ h: 3, m: 44, s: 19 });
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { h, m, s } = prev;
                if (s > 0) s--;
                else {
                    s = 59;
                    if (m > 0) m--;
                    else {
                        m = 59;
                        if (h > 0) h--;
                    }
                }
                return { h, m, s };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = {};
                if (searchQuery) params.q = searchQuery;
                if (selectedCategory) params.category = selectedCategory;
                
                const response = await api.get('/products/', { params });
                setProducts(response.data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchProducts();
    }, [searchQuery, selectedCategory]);

    useEffect(() => {
        if (isLoggedIn) {
            const fetchWishlist = async () => {
                try {
                    const res = await api.get('/wishlist/');
                    setWishlist(res.data.items.map(item => item.product.id));
                } catch (error) {
                    console.error('Failed to fetch wishlist', error);
                }
            };
            fetchWishlist();
        }
    }, [isLoggedIn]);

    const toggleWishlist = async (e, productId) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        
        try {
            if (wishlist.includes(productId)) {
                await api.delete(`/wishlist/${productId}/`);
                const updated = wishlist.filter(id => id !== productId);
                setWishlist(updated);
                showToast('Removed from your wishlist.');
                window.dispatchEvent(new CustomEvent('wishlistUpdate', { detail: { count: updated.length } }));
            } else {
                await api.post('/wishlist/', { product_id: productId });
                const updated = [...wishlist, productId];
                setWishlist(updated);
                showToast('Added to your wishlist!');
                window.dispatchEvent(new CustomEvent('wishlistUpdate', { detail: { count: updated.length } }));
            }
        } catch (error) {
            console.error('Failed to toggle wishlist', error);
        }
    };

    const updateCategory = (slug) => {
        const newParams = new URLSearchParams(searchParams);
        if (slug) {
            newParams.set('category', slug);
        } else {
            newParams.delete('category');
        }
        setSearchParams(newParams);
        window.scrollTo({ top: document.getElementById('products-section')?.offsetTop - 100, behavior: 'smooth' });
    };

    const getCategoryIcon = (slug) => {
        switch(slug) {
            case 'mobiles': return <Smartphone className="w-6 h-6" />;
            case 'electronics': return <Laptop className="w-6 h-6" />;
            case 'fashion': return <Shirt className="w-6 h-6" />;
            case 'home-kitchen': return <HomeIcon className="w-6 h-6" />;
            case 'grocery': return <ShoppingBag className="w-6 h-6" />;
            case 'books': return <Book className="w-6 h-6" />;
            case 'beauty-grooming': return <Sparkles className="w-6 h-6" />;
            case 'toys-games': return <Gamepad2 className="w-6 h-6" />;
            case 'sports-outdoor': return <Dumbbell className="w-6 h-6" />;
            case 'stationery': return <PenTool className="w-6 h-6" />;
            default: return <LayoutGrid className="w-6 h-6" />;
        }
    };

    // Filter and Sort Logic (Client Side for Instant Feedback)
    let processedProducts = [...products];

    // Apply Price Filter
    if (priceRange === 'under_1k') {
        processedProducts = processedProducts.filter(p => Number(p.price) <= 1000);
    } else if (priceRange === '1k_5k') {
        processedProducts = processedProducts.filter(p => Number(p.price) > 1000 && Number(p.price) <= 5000);
    } else if (priceRange === '5k_25k') {
        processedProducts = processedProducts.filter(p => Number(p.price) > 5000 && Number(p.price) <= 25000);
    } else if (priceRange === 'over_25k') {
        processedProducts = processedProducts.filter(p => Number(p.price) > 25000);
    }

    // Apply Sort order
    if (sortBy === 'price_asc') {
        processedProducts.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price_desc') {
        processedProducts.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
        processedProducts.sort((a, b) => Number(b.average_rating || 4.5) - Number(a.average_rating || 4.5));
    }

    // Determine trending products
    const trendingProducts = !searchQuery && !selectedCategory && products.length > 4 ? products.slice(0, 4) : [];

    // Filter products for the Flash Sale product slider
    const flashSaleProducts = products.filter(p => Number(p.price) > 300).slice(1, 5);
    const [flashIndex, setFlashIndex] = useState(0);

    useEffect(() => {
        if (flashSaleProducts.length <= 1) return;
        const interval = setInterval(() => {
            setFlashIndex(prev => (prev + 1) % flashSaleProducts.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [flashSaleProducts.length]);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail) {
            setNewsletterSubscribed(true);
            setNewsletterEmail('');
            showToast('Subscribed to Flipko newsletter!');
        }
    };

    const handleAddToCartFromQuickView = () => {
        if (quickViewProduct) {
            dispatch(addToCart({ productId: quickViewProduct.id, quantity: quickViewQty }));
            showToast(`${quickViewQty} x ${quickViewProduct.name} added to cart.`);
            setQuickViewProduct(null);
            setQuickViewQty(1);
        }
    };

    return (
        <div className="min-h-screen bg-transparent dark:bg-dark-950 font-sans pb-24 transition-colors duration-300">
            <SEO title="Home" description="Discover premium electronics, fashion, and home essentials on Flipko." />
            
            {/* Toast Alerts */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50 px-6 py-3.5 bg-indigo-600 border border-indigo-500 rounded-2xl shadow-2xl text-white font-extrabold text-sm flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dynamic Hero Section */}
            {!searchQuery && !selectedCategory && (
                <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black flex flex-col justify-center">
                    {/* Animated Background Images */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeBanner}
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 0.55, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0 z-0"
                        >
                            <img 
                                src={banners[activeBanner].img} 
                                alt="Hero Banner" 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50/95 via-slate-100/30 to-transparent dark:from-dark-950 dark:via-dark-950/65 z-10 transition-colors duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/20 to-transparent dark:from-indigo-950/80 z-10 transition-colors duration-500"></div>

                    {/* Interactive Slide Progress Line */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200/20 z-30">
                        <motion.div
                            key={activeBanner}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="h-full bg-indigo-600 dark:bg-indigo-400"
                        />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 w-full">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                            >
                                <span className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
                                    <SparklesIcon className="w-3.5 h-3.5 fill-indigo-400 text-indigo-500" /> Season Launch
                                </span>
                                
                                <AnimatePresence mode="wait">
                                    <motion.h1 
                                        key={activeBanner}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.4 }}
                                        className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white leading-[1.08] tracking-tight mb-6"
                                    >
                                        {banners[activeBanner].title}
                                    </motion.h1>
                                </AnimatePresence>
                                
                                <AnimatePresence mode="wait">
                                    <motion.p 
                                        key={`p-${activeBanner}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                        className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-10 font-medium max-w-lg"
                                    >
                                        {banners[activeBanner].subtitle}
                                    </motion.p>
                                </AnimatePresence>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="group rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-slate-900 px-7 py-3.5 font-extrabold text-sm flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-xl shadow-indigo-600/10 dark:shadow-white/10"
                                    >
                                        <span>Shop Collection</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Category Navigation Scroller (Overlapping bottom) */}
                    <div className="absolute bottom-0 left-0 w-full z-30 transform translate-y-1/2 px-4 sm:px-10">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x">
                                {categories.length === 0 ? (
                                    [...Array(8)].map((_, i) => <CategorySkeleton key={i} />)
                                ) : (
                                    <>
                                        {/* All Category icon */}
                                        <motion.div 
                                            whileHover={{ y: -6 }}
                                            onClick={() => updateCategory(null)}
                                            className="snap-start shrink-0 flex flex-col items-center gap-2.5 cursor-pointer group"
                                        >
                                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-[1.5rem] bg-white dark:bg-dark-800 border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center justify-center text-slate-800 dark:text-white group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 transition-all duration-300 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-indigo-400/10 opacity-0 group-hover:opacity-100 blur-md transition-opacity"></div>
                                                <LayoutGrid className="w-6 h-6 relative z-10" />
                                            </div>
                                            <span className="text-[11px] font-black text-slate-800 dark:text-white tracking-wide transition-colors">All Products</span>
                                        </motion.div>
                                        
                                        {/* Category List */}
                                        {categories.map((cat, i) => {
                                            const styles = CATEGORY_STYLES[cat.slug] || { bg: 'group-hover:bg-indigo-600 group-hover:text-white', glow: 'bg-indigo-500/10', text: 'group-hover:text-indigo-600' };
                                            const isSelected = selectedCategory === cat.slug;
                                            return (
                                                <motion.div 
                                                    key={cat.id}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.35 + (i * 0.04) }}
                                                    whileHover={{ y: -6 }}
                                                    onClick={() => updateCategory(cat.slug)}
                                                    className="snap-start shrink-0 flex flex-col items-center gap-2.5 cursor-pointer group"
                                                >
                                                    <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-[1.5rem] bg-white dark:bg-dark-800 border ${
                                                        isSelected 
                                                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30' 
                                                            : 'border-slate-100 dark:border-slate-800/80'
                                                    } shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center justify-center text-slate-600 dark:text-slate-400 ${styles.bg} transition-all duration-300 relative overflow-hidden`}>
                                                        <div className={`absolute inset-0 ${styles.glow} opacity-0 group-hover:opacity-100 blur-md transition-opacity`}></div>
                                                        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                                                            {getCategoryIcon(cat.slug)}
                                                        </div>
                                                    </div>
                                                    <span className={`text-[11px] font-black tracking-wide text-slate-700 dark:text-slate-300 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : styles.text} transition-colors whitespace-nowrap`}>
                                                        {cat.name}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Promo Ticker Strip - Animated marquee bar */}
            {!searchQuery && !selectedCategory && (
                <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 text-white py-2.5 overflow-hidden relative">
                    <div className="flex items-center animate-marquee whitespace-nowrap gap-0">
                        {[
                            '🔥 Flash Sale: Up to 40% OFF on Electronics',
                            '🚚 Free Shipping on orders over ₹499',
                            '⚡ Limited Drops — Grab before stock runs out',
                            '🎁 New Arrivals: Premium Mobiles & Gadgets',
                            '💎 Exclusive Members-Only Prices — Sign in now',
                            '🏆 Top Rated Products: 4.8★ and above',
                            '🔥 Flash Sale: Up to 40% OFF on Electronics',
                            '🚚 Free Shipping on orders over ₹499',
                            '⚡ Limited Drops — Grab before stock runs out',
                        ].map((msg, i) => (
                            <span key={i} className="inline-flex items-center gap-2 text-xs font-bold tracking-wider px-8 border-r border-white/20">
                                {msg}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Split Flash Sale and Products Slider Container */}
            {!searchQuery && !selectedCategory && (
                <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-28 lg:mt-24">
                    <div className="bg-white/80 dark:bg-dark-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12">
                            
                            {/* Left Side: Flash Details & Timer */}
                            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                                <div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 rounded-xl animate-pulse">
                                            <Zap className="w-5 h-5 fill-current" />
                                        </div>
                                        <span className="text-[10px] uppercase font-black tracking-[0.25em] text-rose-500 dark:text-rose-400">Limited Flash Drops</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight mb-2">
                                        ELITE FLASHSALE
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">Premium products, marked down for immediate collection.</p>
                                    
                                    {/* Urgency Progress Bar */}
                                    <div className="space-y-2 mb-8">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-amber-600 dark:text-amber-400">📦 Urgency: 84% Sold Out</span>
                                            <span className="text-slate-400">14 Items Left</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full w-[84%]"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timer */}
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Offers Terminating In</span>
                                    <div className="flex items-center gap-2.5 font-mono text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                                        <div className="bg-slate-50 dark:bg-dark-950 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center min-w-[70px]">
                                            <span>{String(timeLeft.h).padStart(2, '0')}</span>
                                            <span className="text-[9px] font-sans text-slate-400 font-bold uppercase tracking-wider mt-1">Hrs</span>
                                        </div>
                                        <span className="text-slate-300 dark:text-slate-600">:</span>
                                        <div className="bg-slate-50 dark:bg-dark-950 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center min-w-[70px]">
                                            <span>{String(timeLeft.m).padStart(2, '0')}</span>
                                            <span className="text-[9px] font-sans text-slate-400 font-bold uppercase tracking-wider mt-1">Min</span>
                                        </div>
                                        <span className="text-slate-300 dark:text-slate-600">:</span>
                                        <div className="bg-slate-50 dark:bg-dark-950 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center min-w-[70px]">
                                            <span>{String(timeLeft.s).padStart(2, '0')}</span>
                                            <span className="text-[9px] font-sans text-slate-400 font-bold uppercase tracking-wider mt-1">Sec</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Product Carousel */}
                            <div className="lg:col-span-7 p-8 sm:p-10 bg-slate-50/50 dark:bg-dark-950/20 flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    {flashSaleProducts.length > 0 ? (
                                        <motion.div
                                            key={flashIndex}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.35 }}
                                            className="flex flex-col sm:flex-row items-center gap-6 cursor-pointer"
                                            onClick={() => navigate(`/product/${flashSaleProducts[flashIndex].id}`)}
                                        >
                                            <div className="w-40 h-40 shrink-0 bg-white dark:bg-dark-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-4 flex items-center justify-center relative overflow-hidden group">
                                                <img 
                                                    src={flashSaleProducts[flashIndex].image} 
                                                    alt={flashSaleProducts[flashIndex].name} 
                                                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
                                                    }}
                                                />
                                                <div className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[8px] px-2 py-1 rounded-md uppercase tracking-wider">
                                                    -25%
                                                </div>
                                            </div>
                                            <div className="flex-grow text-center sm:text-left space-y-3">
                                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Featured Flash Deal</span>
                                                <h4 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">{flashSaleProducts[flashIndex].name}</h4>
                                                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-amber-500">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{flashSaleProducts[flashIndex].average_rating || '4.8'}</span>
                                                </div>
                                                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                                                    <span className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(flashSaleProducts[flashIndex].price).toLocaleString('en-IN')}</span>
                                                    <span className="text-sm text-slate-400 line-through">₹{(Number(flashSaleProducts[flashIndex].price) * 1.25).toFixed(0)}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        dispatch(addToCart({ productId: flashSaleProducts[flashIndex].id, quantity: 1 }));
                                                        showToast('Item linked to your cart.');
                                                    }}
                                                    className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 dark:bg-white dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
                                                >
                                                    Claim Offer
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-40 flex items-center justify-center text-slate-400 font-bold">
                                            Loading custom flash deals...
                                        </div>
                                    )}
                                </AnimatePresence>
                                
                                {/* Indicators */}
                                <div className="flex justify-center sm:justify-start gap-1.5 mt-6">
                                    {flashSaleProducts.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setFlashIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === flashIndex ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* Deals of the Day — 3-Column Ad Banners */}
            {!searchQuery && !selectedCategory && (
                <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-8">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400">
                                <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Deals of the Day</h2>
                        </div>
                        <button 
                            onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            All Deals <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Ad Card 1 — Electronics */}
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => updateCategory('electronics')}
                            className="relative rounded-[2rem] overflow-hidden cursor-pointer group h-52 sm:h-56"
                        >
                            <img 
                                src="/ad-electronics.png" 
                                alt="Electronics Deals" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Up to 35% OFF</span>
                                <h3 className="text-xl font-black text-white leading-tight mb-2">Premium Electronics</h3>
                                <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold group-hover:text-white transition-colors">
                                    <span>Shop Now</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-rose-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                Hot Deal
                            </div>
                        </motion.div>

                        {/* Ad Card 2 — Fashion */}
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => updateCategory('fashion')}
                            className="relative rounded-[2rem] overflow-hidden cursor-pointer group h-52 sm:h-56"
                        >
                            <img 
                                src="/ad-fashion.png" 
                                alt="Fashion Deals" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-rose-900/30 to-transparent"></div>
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest mb-1">New Season Styles</span>
                                <h3 className="text-xl font-black text-white leading-tight mb-2">Designer Fashion</h3>
                                <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold group-hover:text-white transition-colors">
                                    <span>Explore Styles</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                New In
                            </div>
                        </motion.div>

                        {/* Ad Card 3 — Home & Kitchen */}
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => updateCategory('home-kitchen')}
                            className="relative rounded-[2rem] overflow-hidden cursor-pointer group h-52 sm:h-56"
                        >
                            <img 
                                src="/ad-home.png" 
                                alt="Home & Kitchen" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-900/30 to-transparent"></div>
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1">Refresh Your Space</span>
                                <h3 className="text-xl font-black text-white leading-tight mb-2">Home & Living</h3>
                                <div className="flex items-center gap-1.5 text-white/80 text-xs font-bold group-hover:text-white transition-colors">
                                    <span>Discover More</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                Top Picks
                            </div>
                        </motion.div>
                    </div>

                    {/* Wide Promotional Banner */}
                    <motion.div
                        whileHover={{ scale: 1.005 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => navigate('/signup')}
                        className="mt-5 relative rounded-[2rem] overflow-hidden cursor-pointer group h-32 sm:h-40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700"></div>
                        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)'}}></div>
                        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute left-1/4 top-0 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10 h-full flex items-center justify-between px-8 sm:px-12">
                            <div>
                                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest block mb-1">Members Exclusive</span>
                                <h3 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight mb-1">Join Flipko Today</h3>
                                <p className="text-xs text-white/70 font-medium">Get 15% off your first order + early access to Flash Sales</p>
                            </div>
                            <div className="shrink-0">
                                <div className="bg-white text-indigo-700 font-black text-sm px-6 py-3 rounded-2xl shadow-2xl group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-300 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Sign Up Free
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Products Listing Section */}
            <div id="products-section" className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 space-y-8">
                
                {/* Trending Section */}
                {!searchQuery && !selectedCategory && trendingProducts.length > 0 && (
                    <div className="space-y-6 pb-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Trending Collections</h2>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {trendingProducts.map((product, idx) => (
                                <ProductCard 
                                    key={`trend-${product.id}`} 
                                    product={product} 
                                    navigate={navigate} 
                                    dispatch={dispatch} 
                                    index={idx} 
                                    trending 
                                    isWishlisted={wishlist.includes(product.id)}
                                    onToggleWishlist={toggleWishlist}
                                    onQuickView={setQuickViewProduct}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Section Header with Filters */}
                <div className="space-y-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                {searchQuery ? (
                                    <>
                                        <Search className="w-6 h-6 text-indigo-600" />
                                        Results for "{searchQuery}"
                                    </>
                                ) : selectedCategory ? (
                                    <>
                                        {getCategoryIcon(selectedCategory)}
                                        {categories.find(c => c.slug === selectedCategory)?.name || 'Category'}
                                    </>
                                ) : (
                                    "Just For You"
                                )}
                            </h2>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                                {processedProducts.length} items catalogued
                            </p>
                        </div>
                        
                        {/* Sort & Filter Toggle Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2.5 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all active:scale-95 ${
                                    showFilters || priceRange !== 'all' || sortBy !== 'default'
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                                        : 'bg-white dark:bg-dark-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                }`}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Filter & Sort</span>
                                {(priceRange !== 'all' || sortBy !== 'default') && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                )}
                            </button>

                            {/* Active Filters Clear */}
                            {(searchQuery || selectedCategory) && (
                                <button 
                                    onClick={() => {
                                        setSearchParams(new URLSearchParams());
                                        setPriceRange('all');
                                        setSortBy('default');
                                    }}
                                    className="text-[10px] font-black text-slate-400 hover:text-rose-600 transition-colors uppercase tracking-widest"
                                >
                                    Reset Search
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Collapsible Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-slate-50 dark:bg-dark-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    {/* Sort By options */}
                                    <div className="space-y-3">
                                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Sort Catalog</span>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'default', label: 'Recommended' },
                                                { id: 'price_asc', label: 'Price: Low to High' },
                                                { id: 'price_desc', label: 'Price: High to Low' },
                                                { id: 'rating', label: 'Customer Rating' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSortBy(opt.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                        sortBy === opt.id
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                            : 'bg-white dark:bg-dark-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range options */}
                                    <div className="space-y-3">
                                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Price Bounds</span>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { id: 'all', label: 'All Prices' },
                                                { id: 'under_1k', label: 'Under ₹1,000' },
                                                { id: '1k_5k', label: '₹1,000 - ₹5,000' },
                                                { id: '5k_25k', label: '₹5,000 - ₹25,000' },
                                                { id: 'over_25k', label: 'Over ₹25,000' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setPriceRange(opt.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                        priceRange === opt.id
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                                            : 'bg-white dark:bg-dark-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Products Grid */}
                <div className="relative min-h-[300px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                [...Array(8)].map((_, i) => <ProductSkeleton key={`skel-${i}`} />)
                            ) : (
                                processedProducts.map((product, index) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        navigate={navigate} 
                                        dispatch={dispatch} 
                                        index={index} 
                                        isWishlisted={wishlist.includes(product.id)}
                                        onToggleWishlist={toggleWishlist}
                                        onQuickView={setQuickViewProduct}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                        
                        {!loading && processedProducts.length === 0 && (
                            <div className="col-span-full py-20 bg-white dark:bg-dark-900 rounded-[2rem] border border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-dark-950 rounded-full flex items-center justify-center mb-5">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No matching products</h3>
                                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mb-6">No products met your selected price bounds or sort parameters.</p>
                                <button 
                                    onClick={() => {
                                        setPriceRange('all');
                                        setSortBy('default');
                                    }}
                                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-xs hover:bg-indigo-700 transition-all shadow-md"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Brand Trust Badges */}
                <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/20 dark:via-dark-900/50 dark:to-purple-950/20"></div>
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
                        {[
                            { icon: Truck, title: "Free Express Shipping", desc: "On orders over ₹499", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30 group-hover:bg-indigo-600" },
                            { icon: ShieldCheck, title: "Secure Checkout", desc: "Bank-grade 128-bit encryption", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-600" },
                            { icon: Headphones, title: "24/7 Customer Support", desc: "Direct concierge for all issues", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30 group-hover:bg-violet-600" },
                            { icon: RotateCcw, title: "Easy Returns", desc: "Refund within 7 calendar days", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 group-hover:bg-amber-600" }
                        ].map((badge, index) => {
                            const Icon = badge.icon;
                            return (
                                <motion.div 
                                    key={index} 
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                    className="flex gap-4 items-center p-7 group cursor-default"
                                >
                                    <div className={`p-3.5 ${badge.bg} rounded-2xl ${badge.color} group-hover:text-white transition-all duration-300 shrink-0 shadow-sm`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{badge.title}</h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">{badge.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Modern Newsletter Section */}
                <section className="rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950"></div>
                    <div className="absolute right-0 bottom-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px]"></div>
                    <div className="absolute left-1/3 top-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-[80px]"></div>
                    <div className="absolute left-0 top-0 w-64 h-64 bg-violet-700/10 rounded-full blur-[100px]"></div>
                    
                    {/* Decorative dots pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px'}}></div>

                    <div className="relative z-10 p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
                        <div className="max-w-lg space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Exclusive Newsletter</span>
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">Stay Tuned with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Flipko</span></h3>
                            <p className="text-xs text-slate-400 max-w-md font-medium leading-relaxed">
                                Subscribe to receive flash deal notifications, product drops, and exclusive member-only discounts delivered straight to your inbox.
                            </p>
                            <div className="flex items-center gap-6 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /><span>Early Access</span></div>
                                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /><span>Flash Alerts</span></div>
                                <div className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /><span>15% Off First Order</span></div>
                            </div>
                        </div>
                        
                        <div className="w-full sm:w-auto sm:min-w-[340px]">
                            {newsletterSubscribed ? (
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-indigo-950/60 border border-indigo-500/30 p-5 rounded-2xl flex items-center gap-3 text-sm font-bold text-indigo-300"
                                >
                                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-sm">You're subscribed!</p>
                                        <p className="text-slate-400 text-xs font-medium mt-0.5">Check your inbox for your 15% discount code.</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            type="email" 
                                            required
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            placeholder="Enter your email address"
                                            className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 focus:border-indigo-500/60 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-white placeholder-slate-500 transition-all"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 font-black text-sm rounded-2xl shadow-2xl shadow-amber-500/20 transition-all uppercase tracking-wider active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Get 15% Off — Subscribe
                                    </button>
                                    <p className="text-center text-[10px] text-slate-600 font-medium">No spam. Unsubscribe anytime.</p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

            </div>

            {/* QUICK VIEW PRODUCT OVERLAY MODAL */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md">
                    <motion.div 
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 w-full max-w-3xl border border-slate-100 dark:border-slate-800/80 shadow-2xl relative overflow-hidden"
                    >
                        {/* Close button */}
                        <button 
                            onClick={() => {
                                setQuickViewProduct(null);
                                setQuickViewQty(1);
                            }}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800/80 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:scale-105 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-4">
                            {/* Product Image */}
                            <div className="md:col-span-5 h-64 bg-slate-50 dark:bg-dark-950/60 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 p-6 flex items-center justify-center relative overflow-hidden">
                                <img 
                                    src={quickViewProduct.image} 
                                    alt={quickViewProduct.name} 
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
                                    }}
                                />
                            </div>

                            {/* Product Info */}
                            <div className="md:col-span-7 space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md">
                                        {quickViewProduct.category?.name || 'Category'}
                                    </span>
                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md text-[11px] font-black text-amber-700 dark:text-amber-400">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        <span>{quickViewProduct.average_rating || '4.8'}</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">In Stock</span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                    {quickViewProduct.name}
                                </h3>

                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Experience premium quality and robust performance with the {quickViewProduct.name}. Meticulously designed for your e-commerce lifestyle utility.
                                </p>

                                <div className="flex items-baseline gap-2.5 pt-2">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                                        ₹{Number(quickViewProduct.price).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-sm text-slate-400 line-through">
                                        ₹{(Number(quickViewProduct.price) * 1.25).toFixed(0)}
                                    </span>
                                </div>

                                {/* Cart quantity and Add to cart */}
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex items-center bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden">
                                        <button 
                                            onClick={() => setQuickViewQty(prev => Math.max(1, prev - 1))}
                                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-900 font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 font-black text-sm text-slate-800 dark:text-white">
                                            {quickViewQty}
                                        </span>
                                        <button 
                                            onClick={() => setQuickViewQty(prev => prev + 1)}
                                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-900 font-bold"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleAddToCartFromQuickView}
                                        className="flex-grow py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs uppercase tracking-wider"
                                    >
                                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}

        </div>
    );
};

// Category fallback images for loading safeties
const CATEGORY_FALLBACKS = {
    "mobiles":         "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    "electronics":    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "fashion":        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    "home-kitchen":   "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "grocery":        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    "books":          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    "beauty":         "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    "beauty-grooming":"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    "toys":           "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
    "toys-games":     "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80",
    "sports":         "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    "sports-outdoor": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    "stationery":     "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=800&q=80",
};

// Refined ProductCard Component with Quick View and Heart icons stacked top right
const ProductCard = ({ product, navigate, dispatch, index, trending = false, isWishlisted, onToggleWishlist, onQuickView }) => {
    const [imgLoaded, setImgLoaded] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    const isLocal = product.image && !product.image.startsWith('http');
    const imageUrl = isLocal
        ? `${import.meta.env.VITE_MEDIA_URL || ''}${product.image}`
        : product.image;
    const fallbackUrl = CATEGORY_FALLBACKS[product.category?.slug] || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80";

    const handleImgError = (e) => {
        if (!imgError) {
            setImgError(true);
            e.target.src = fallbackUrl;
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
            className="group flex flex-col bg-white dark:bg-dark-900 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-slate-800/80 transition-all duration-500 cursor-pointer h-full relative"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            {/* Top Right Action Icons Panel */}
            <div className="absolute top-4 right-4 z-35 flex flex-col gap-2">
                {/* Wishlist Heart */}
                <button 
                    onClick={(e) => onToggleWishlist(e, product.id)}
                    className="p-2 rounded-xl bg-white/90 dark:bg-dark-950/90 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-800/80 hover:scale-110 transition-transform duration-200"
                >
                    <Heart 
                        className={`w-4.5 h-4.5 transition-colors duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-300 hover:text-rose-500'}`} 
                    />
                </button>

                {/* Quick View Eye */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                    }}
                    className="p-2 rounded-xl bg-white/90 dark:bg-dark-950/90 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-800/80 hover:scale-110 transition-transform duration-200"
                    title="Quick View"
                >
                    <Eye className="w-4.5 h-4.5 text-slate-400 dark:text-slate-300 hover:text-indigo-600" />
                </button>
            </div>

            {/* Product Image Container */}
            <div className="relative aspect-[4/5] bg-slate-50 dark:bg-dark-950/20 overflow-hidden p-6 flex items-center justify-center border-b border-slate-50 dark:border-slate-900/60">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/20 to-transparent mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Skeleton shimmer while image loads */}
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse"></div>
                )}

                <img 
                    src={imageUrl || fallbackUrl} 
                    alt={product.name} 
                    className={`object-contain w-full h-full transform transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    onError={handleImgError}
                />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {trending && (
                        <div className="bg-rose-600 text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-md flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-white" /> Hot
                        </div>
                    )}
                    {index % 4 === 0 && !trending && (
                        <div className="bg-emerald-600 text-white text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-md">
                            Bestseller
                        </div>
                    )}
                </div>

                {/* Quick Add Button - Slides up on hover */}
                <div className="absolute bottom-4 left-0 w-full px-4 transform translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                    <button 
                        className="w-full bg-slate-950/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 font-extrabold py-3.5 rounded-xl shadow-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToCart({ productId: product.id, quantity: 1 }));
                        }}
                    >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                </div>
            </div>
            
            {/* Card Information */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
                        {product.category?.name || 'Category'}
                    </span>
                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md text-[9px] font-black text-amber-700 dark:text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                        <span>{product.average_rating || '4.8'}</span>
                    </div>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug mb-4 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-grow">
                    {product.name}
                </h3>
                
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold line-through">
                            ₹{(Number(product.price) * 1.25).toFixed(0)}
                        </span>
                        <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mt-0.5">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                        </div>
                    </div>
                    {/* Inline Bag Icon - vanishes when the hover button slides up */}
                    <button 
                        className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:opacity-0 transition-opacity duration-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToCart({ productId: product.id, quantity: 1 }));
                        }}
                    >
                        <ShoppingBag className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
