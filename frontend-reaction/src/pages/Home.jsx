import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, LayoutGrid, Filter, Search } from 'lucide-react';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const searchQuery = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || '';
    
    const [activeBanner, setActiveBanner] = useState(0);
    const banners = [
        { img: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2070", title: "Festive Sale" },
        { img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2070", title: "Sportswear Launch" },
        { img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070", title: "Modern Home Office" }
    ];

    useEffect(() => {
        if (searchQuery || selectedCategory) return;
        const interval = setInterval(() => {
            setActiveBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [searchQuery, selectedCategory]);

    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    const updateCategory = (slug) => {
        const newParams = new URLSearchParams(searchParams);
        if (slug) {
            newParams.set('category', slug);
        } else {
            newParams.delete('category');
        }
        setSearchParams(newParams);
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
                    <div className="absolute top-0 left-0 animate-pulse rounded-full h-16 w-16 border-4 border-primary-100"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Section - Amazon Hub Style */}
            {!searchQuery && !selectedCategory && (
                <section className="relative h-[600px] -mt-8 mb-4 overflow-hidden">
                    {/* Background Banner Carousel */}
                    <div className="absolute inset-0 group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#eaeded]/50 to-[#eaeded] z-10 pointer-events-none"></div>
                        <AnimatePresence mode="wait">
                            <motion.img 
                                key={activeBanner}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 1 }}
                                src={banners[activeBanner].img} 
                                alt={banners[activeBanner].title}
                                className="w-full h-full object-cover absolute inset-0"
                            />
                        </AnimatePresence>
                    </div>

                    {/* Discovery Cards - Amazon Grid Style */}
                    <div className="relative z-20 max-w-[1500px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-10 -mt-[350px]">
                        {[
                            { title: 'Deals on Mobiles', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800', slug: 'mobiles' },
                            { title: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', slug: 'home-kitchen' },
                            { title: 'Premium Fashion', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800', slug: 'fashion' },
                            { title: 'Best of Electronics', img: 'https://m.media-amazon.com/images/I/71-KogJ-30L.jpg', slug: 'electronics' }
                        ].map((card, i) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                                key={i}
                                className="bg-white p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer group rounded-sm"
                                onClick={() => updateCategory(card.slug)}
                            >
                                <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-amber-600 transition-colors">{card.title}</h3>
                                <div className="aspect-square bg-slate-50 overflow-hidden mb-6 rounded-sm">
                                    <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <span className="text-sm font-bold text-blue-600 hover:text-rose-600 hover:underline">Shop now</span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Main Content Area */}
            <div className="max-w-[1500px] mx-auto px-10 space-y-12">
                {/* Category Filter */}
                <div className={`space-y-6 ${searchQuery || selectedCategory ? 'mt-8' : ''}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {searchQuery ? `Results for "${searchQuery}"` : 'Browse Categories'}
                        </h2>
                    </div>
                    {searchQuery && (
                        <button 
                            onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('q');
                                setSearchParams(newParams);
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors"
                        >
                            CLEAR SEARCH
                        </button>
                    )}
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    <button 
                        onClick={() => updateCategory(null)}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap shadow-sm border ${!selectedCategory ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-100'}`}
                    >
                        All Products
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => updateCategory(cat.slug)}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap shadow-sm border ${selectedCategory === cat.slug ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20' : 'bg-white text-slate-500 hover:bg-slate-100 border-slate-100'}`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-30 flex items-center justify-center rounded-[40px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <AnimatePresence mode="popLayout">
                        {products.map((product, index) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                key={product.id} 
                                className="group relative bg-white rounded-3xl p-4 shadow-xl shadow-slate-200/50 border border-slate-50 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 cursor-pointer"
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                {/* Card Header: Image */}
                                <div className="aspect-[4/5] bg-slate-50 rounded-2xl mb-5 overflow-hidden relative flex items-center justify-center p-6">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-200/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    {product.image ? (
                                        <img 
                                            src={product.image?.includes('://') ? product.image : `http://127.0.0.1:8080${product.image}`} 
                                            alt={product.name} 
                                            className="object-contain w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <span className="text-slate-300 font-bold opacity-30 tracking-widest text-lg">FLIPKO</span>
                                    )}
                                    
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        <button 
                                            className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg hover:bg-primary-500 hover:text-white transition-all active:scale-90"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(addToCart({ productId: product.id, quantity: 1 }));
                                            }}
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {index % 5 === 0 && (
                                        <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            Best Seller
                                        </div>
                                    )}
                                </div>
                                
                                {/* Card Content */}
                                <div className="px-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">
                                            {product.category?.name || 'Uncategorized'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="text-[10px] font-bold text-slate-400">4.8</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary-600 transition-colors">
                                        {product.name}
                                    </h3>
                                    
                                    <div className="flex items-end justify-between mt-4">
                                        <div>
                                            <span className="text-[10px] text-slate-400 line-through">₹{(Number(product.price)*1.2).toFixed(0)}</span>
                                            <div className="text-2xl font-black text-slate-900">₹{product.price}</div>
                                        </div>
                                        <div className="text-[10px] font-bold text-emerald-500 py-1 px-2 border border-emerald-100 rounded-lg bg-emerald-50">
                                            Save 20%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {!loading && products.length === 0 && (
                        <div className="col-span-full py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">No items found</h3>
                            <p className="text-slate-500 max-w-xs">We couldn't find any products matching your current filters.</p>
                            <button 
                                onClick={() => navigate('/')}
                                className="mt-6 text-primary-600 font-bold hover:underline"
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

export default Home;


