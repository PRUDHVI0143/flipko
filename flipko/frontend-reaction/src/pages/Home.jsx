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
    Book, Gamepad2, Dumbbell, PenTool, Sparkles, Check, Heart
} from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const isLoggedIn = !!localStorage.getItem('access_token');
    
    const searchQuery = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || '';
    
    const [activeBanner, setActiveBanner] = useState(0);
    const banners = [
        { 
            img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070", 
            title: "Next-Gen Tech",
            subtitle: "Discover the future of personal computing and gaming."
        },
        { 
            img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070", 
            title: "Premium Fashion",
            subtitle: "Elevate your style with our curated summer collection."
        },
        { 
            img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000", 
            title: "Modern Living",
            subtitle: "Transform your home into a sanctuary."
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
    const [timeLeft, setTimeLeft] = useState({ h: 5, m: 23, s: 41 });
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
                setLoading(false);
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
                setWishlist(prev => prev.filter(id => id !== productId));
            } else {
                await api.post('/wishlist/', { product_id: productId });
                setWishlist(prev => [...prev, productId]);
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
        // Scroll to products slightly smoothly
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

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[70vh] bg-slate-50">
                <div className="relative flex flex-col items-center">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
                    <div className="absolute top-0 left-0 animate-pulse rounded-full h-20 w-20 border-4 border-indigo-200"></div>
                    <p className="mt-6 text-indigo-900 font-bold tracking-widest uppercase text-sm">Loading Experience</p>
                </div>
            </div>
        );
    }

    // Determine trending products (just a slice of current products for display if not searching)
    const trendingProducts = !searchQuery && !selectedCategory && products.length > 4 ? products.slice(0, 4) : [];

    return (
        <div className="min-h-screen bg-transparent dark:bg-dark-900 font-sans pb-24 transition-colors duration-300">
            
            {/* Dynamic Hero Section */}
            {!searchQuery && !selectedCategory && (
                <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-black flex flex-col justify-center">
                    {/* Animated Background Images */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeBanner}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 0.6, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute inset-0 z-0"
                        >
                            <img 
                                src={banners[activeBanner].img} 
                                alt="Hero" 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Gradient Overlays for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-100/90 via-orange-50/40 to-transparent dark:from-slate-900 dark:via-slate-900/60 z-10 transition-colors duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-indigo-950/90 z-10 transition-colors duration-500"></div>

                    {/* Floating Orbs */}
                    <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-400/20 dark:bg-indigo-600/30 rounded-full blur-[120px] z-10 animate-pulse mix-blend-multiply dark:mix-blend-screen transition-colors duration-500"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-400/20 dark:bg-fuchsia-600/20 rounded-full blur-[100px] z-10 animate-pulse mix-blend-multiply dark:mix-blend-screen delay-1000 transition-colors duration-500"></div>

                    {/* Hero Content */}
                    <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 w-full">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-orange-500/10 dark:bg-indigo-500/20 border border-orange-400/30 dark:border-indigo-400/30 text-orange-600 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md transition-colors">
                                    Welcome to Flipko
                                </span>
                                <AnimatePresence mode="wait">
                                    <motion.h1 
                                        key={activeBanner}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-5xl sm:text-7xl font-black text-orange-950 dark:text-white leading-[1.1] tracking-tight mb-6"
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
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="text-lg sm:text-xl text-orange-900/70 dark:text-slate-300 mb-10 font-medium max-w-lg transition-colors"
                                    >
                                        {banners[activeBanner].subtitle}
                                    </motion.p>
                                </AnimatePresence>

                                <button 
                                    onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="group relative overflow-hidden rounded-full bg-orange-600 dark:bg-white text-white dark:text-slate-900 px-8 py-4 font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(234,88,12,0.3)] dark:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    <span className="relative z-10">Shop Collection</span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-orange-700 dark:bg-indigo-50 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 z-0"></div>
                                </button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Category Scroller (Overlaps Hero Bottom) */}
                    <div className="absolute bottom-0 left-0 w-full z-30 transform translate-y-1/2 px-4 sm:px-10">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x">
                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    onClick={() => updateCategory(null)}
                                    className="snap-start shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-xl border border-orange-200 dark:border-white/20 shadow-2xl flex items-center justify-center text-orange-600 dark:text-white group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-indigo-600 transition-all duration-300">
                                        <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8" />
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-orange-950 dark:text-white group-hover:text-orange-600 dark:group-hover:text-indigo-400 transition-colors drop-shadow-md">All</span>
                                </motion.div>
                                
                                {categories.map((cat, i) => (
                                    <motion.div 
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.05) }}
                                        whileHover={{ y: -5 }}
                                        onClick={() => updateCategory(cat.slug)}
                                        className="snap-start shrink-0 flex flex-col items-center gap-3 cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-white/10 backdrop-blur-xl border border-orange-200 dark:border-white/20 shadow-2xl flex items-center justify-center text-orange-600 dark:text-white group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-indigo-600 transition-all duration-300 relative overflow-hidden">
                                            {/* Glow effect on hover */}
                                            <div className="absolute inset-0 bg-orange-400/20 dark:bg-indigo-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity"></div>
                                            <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                                                {getCategoryIcon(cat.slug)}
                                            </div>
                                        </div>
                                        <span className="text-xs sm:text-sm font-bold text-orange-950/90 dark:text-white/90 group-hover:text-orange-600 dark:group-hover:text-white transition-colors drop-shadow-md whitespace-nowrap">
                                            {cat.name.split(' ')[0]} {/* Shorten long names */}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Premium Flash Sale Banner */}
            {!searchQuery && !selectedCategory && (
                <div className="w-full relative overflow-hidden bg-orange-100 dark:bg-[#0a0a0a] py-12 px-6 transition-colors duration-500">
                    {/* Animated Background Gradients - Light Mode */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-300/30 to-transparent dark:from-indigo-600/20"></div>
                    <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-amber-300/30 to-transparent dark:from-rose-600/20"></div>
                    
                    <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                            <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-40 dark:bg-amber-500 animate-pulse"></div>
                                <div className="relative p-5 bg-gradient-to-br from-orange-400 to-orange-600 dark:from-amber-400 dark:to-amber-600 rounded-[2rem] shadow-2xl shadow-orange-500/40 dark:shadow-amber-500/40 transform -rotate-6">
                                    <Zap className="w-10 h-10 text-white dark:text-slate-900 fill-current" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-black text-4xl sm:text-5xl text-orange-950 dark:text-white tracking-tighter mb-1">
                                    ELITE <span className="text-orange-600 dark:text-amber-400">FLASH</span> SALE
                                </h3>
                                <div className="flex items-center justify-center sm:justify-start gap-3">
                                    <span className="h-[1px] w-8 bg-orange-300 dark:bg-slate-700"></span>
                                    <p className="text-orange-800 dark:text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">Limited Edition Drops</p>
                                    <span className="h-[1px] w-8 bg-orange-300 dark:bg-slate-700"></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center lg:items-end gap-4">
                            <div className="flex items-center gap-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl px-8 py-5 rounded-[2.5rem] border border-orange-200 dark:border-white/10 shadow-2xl">
                                <Clock className="w-6 h-6 text-orange-600 dark:text-amber-400 animate-bounce" />
                                <div className="flex gap-4 text-orange-900 dark:text-white font-mono font-black text-3xl tracking-tighter">
                                    <div className="flex flex-col items-center">
                                        <span>{String(timeLeft.h).padStart(2, '0')}</span>
                                        <span className="text-[10px] text-orange-800/60 dark:text-slate-500 font-sans uppercase tracking-widest mt-1">Hrs</span>
                                    </div>
                                    <span className="text-orange-500 dark:text-amber-500">:</span>
                                    <div className="flex flex-col items-center">
                                        <span>{String(timeLeft.m).padStart(2, '0')}</span>
                                        <span className="text-[10px] text-orange-800/60 dark:text-slate-500 font-sans uppercase tracking-widest mt-1">Min</span>
                                    </div>
                                    <span className="text-orange-500 dark:text-amber-500">:</span>
                                    <div className="flex flex-col items-center">
                                        <span>{String(timeLeft.s).padStart(2, '0')}</span>
                                        <span className="text-[10px] text-orange-800/60 dark:text-slate-500 font-sans uppercase tracking-widest mt-1">Sec</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-orange-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest animate-pulse">Live Status: Secure Packaging Active</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Container */}
            <div id="products-section" className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 space-y-16">
                
                {/* Trending Section (Only on home) */}
                {!searchQuery && !selectedCategory && trendingProducts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-100 dark:bg-orange-900/40 rounded-xl text-orange-600 dark:text-orange-400">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Trending Now</h2>
                            </div>
                            <button className="text-orange-600 dark:text-orange-400 font-bold text-sm hover:text-orange-800 dark:hover:text-orange-300 flex items-center gap-1 group">
                                View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
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
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Section Header for Products */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            {searchQuery ? (
                                <>
                                    <Search className="w-8 h-8 text-indigo-600" />
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
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {products.length} {products.length === 1 ? 'product' : 'products'} found
                        </p>
                    </div>
                    
                    {/* Active Filters Display */}
                    {(searchQuery || selectedCategory) && (
                        <div className="flex items-center gap-3">
                            {selectedCategory && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm border border-indigo-100">
                                    {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                    <button onClick={() => updateCategory(null)} className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </span>
                            )}
                            {searchQuery && (
                                <button 
                                    onClick={() => {
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.delete('q');
                                        setSearchParams(newParams);
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                <div className="relative min-h-[400px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        <AnimatePresence mode="popLayout">
                            {products.map((product, index) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    navigate={navigate} 
                                    dispatch={dispatch} 
                                    index={index} 
                                    isWishlisted={wishlist.includes(product.id)}
                                    onToggleWishlist={toggleWishlist}
                                />
                            ))}
                        </AnimatePresence>
                        
                        {!loading && products.length === 0 && (
                            <div className="col-span-full py-24 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-3">No matches found</h3>
                                <p className="text-slate-500 max-w-sm mb-8">We couldn't find any products matching your criteria. Try adjusting your filters or search terms.</p>
                                <button 
                                    onClick={() => {
                                        setSearchParams(new URLSearchParams());
                                    }}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-900/20"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Category fallback images
const CATEGORY_FALLBACKS = {
    "mobiles":        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    "electronics":    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    "fashion":        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    "home-kitchen":   "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    "grocery":        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    "books":          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
    "beauty-grooming":"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    "toys-games":     "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80",
    "sports-outdoor": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
    "stationery":     "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80",
};

// Extracted ProductCard Component for cleaner code
const ProductCard = ({ product, navigate, dispatch, index, trending = false, isWishlisted, onToggleWishlist }) => {
    const isLocal = product.image && !product.image.includes('://');
    const imageUrl = isLocal ? `http://127.0.0.1:8080${product.image}` : product.image;
    const fallbackUrl = CATEGORY_FALLBACKS[product.category?.slug] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";

    const handleImgError = (e) => {
        if (e.target.src !== fallbackUrl) {
            e.target.src = fallbackUrl;
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
            className="group flex flex-col bg-white dark:bg-dark-800 rounded-[24px] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 cursor-pointer border border-slate-100 dark:border-slate-700 h-full relative"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            {/* Wishlist Heart */}
            <button 
                onClick={(e) => onToggleWishlist(e, product.id)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-md shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform duration-300"
            >
                <Heart 
                    className={`w-5 h-5 transition-colors duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-300 hover:text-rose-500'}`} 
                />
            </button>

            {/* Image Container with Glassmorphic Overlay */}
            <div className="relative aspect-[4/5] bg-white dark:bg-slate-800/50 overflow-hidden p-6 flex items-center justify-center border-b border-orange-50 dark:border-white/5">
                {/* Subtle colored glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/40 to-transparent mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {product.image ? (
                    <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="object-contain w-full h-full transform transition-transform duration-700 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-xl"
                        loading="lazy"
                        onError={handleImgError}
                    />
                ) : (
                    <img 
                        src={fallbackUrl}
                        alt={product.name}
                        className="object-contain w-full h-full transform transition-transform duration-700 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-xl"
                        loading="lazy"
                    />
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {trending && (
                        <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-rose-500/30 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-white" /> Hot
                        </div>
                    )}
                    {index % 4 === 0 && !trending && (
                        <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                            Bestseller
                        </div>
                    )}
                </div>

                {/* Quick Action Button - Slides up on hover */}
                <div className="absolute bottom-4 left-0 w-full px-4 transform translate-y-[150%] group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                    <button 
                        className="w-full bg-white/90 backdrop-blur-md text-slate-900 font-bold py-3 rounded-xl shadow-xl hover:bg-orange-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addToCart({ productId: product.id, quantity: 1 }));
                        }}
                    >
                        <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                </div>
            </div>
            
            {/* Card Info */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md">
                        {product.category?.name || 'Category'}
                    </span>
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">{product.average_rating || '4.8'}</span>
                    </div>
                </div>
                
                <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 leading-snug mb-4 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors flex-grow">
                    {product.name}
                </h3>
                
                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold line-through decoration-slate-300 dark:decoration-slate-600">
                            ₹{(Number(product.price) * 1.25).toFixed(0)}
                        </span>
                        <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                        </div>
                    </div>
                    {/* Add to cart icon (visible when not hovering, hidden when button slides up) */}
                    <button 
                        className="w-10 h-10 rounded-full bg-orange-100 dark:bg-dark-700 flex items-center justify-center text-orange-600 dark:text-slate-300 group-hover:opacity-0 transition-opacity duration-200"
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
