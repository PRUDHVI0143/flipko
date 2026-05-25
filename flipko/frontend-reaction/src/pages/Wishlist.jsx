import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, ShoppingBag, ArrowLeft, Trash2, Star, Search, 
    SlidersHorizontal, Share2, Copy, Check, Clock, Package, 
    ArrowUpDown, AlertCircle, ShoppingCart, Sparkles, X
} from 'lucide-react';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState(null);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isLoggedIn = !!localStorage.getItem('access_token');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        const fetchWishlist = async () => {
            try {
                const res = await api.get('/wishlist/');
                const items = res.data.items || [];
                setWishlistItems(items);
                // Sync Navbar count on load
                window.dispatchEvent(new CustomEvent('wishlistUpdate', { detail: { count: items.length } }));
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
                showToast('Failed to load your wishlist items.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [isLoggedIn, navigate]);

    const removeFromWishlist = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}/`);
            const updated = wishlistItems.filter(item => item.product.id !== productId);
            setWishlistItems(updated);
            
            // Dispatch update event for navbar count sync
            window.dispatchEvent(new CustomEvent('wishlistUpdate', { detail: { count: updated.length } }));
            showToast('Item removed from wish list.');
        } catch (error) {
            console.error('Failed to remove item', error);
            showToast('Failed to remove item. Please try again.', 'error');
        }
    };

    const moveToCart = (product) => {
        dispatch(addToCart({ productId: product.id, quantity: 1 }));
        removeFromWishlist(product.id);
    };

    const handleAddAllToCart = () => {
        const inStockItems = wishlistItems.filter(item => {
            const stock = item.product.stock;
            return stock === undefined || stock > 0;
        });

        if (inStockItems.length === 0) {
            showToast('All items are currently out of stock or list is empty.', 'error');
            return;
        }

        inStockItems.forEach(item => {
            dispatch(addToCart({ productId: item.product.id, quantity: 1 }));
            // Call API delete in background but don't block
            api.delete(`/wishlist/${item.product.id}/`).catch(err => console.error(err));
        });

        setWishlistItems(prev => prev.filter(item => {
            const stock = item.product.stock;
            return stock !== undefined && stock <= 0;
        }));

        const newCount = wishlistItems.length - inStockItems.length;
        window.dispatchEvent(new CustomEvent('wishlistUpdate', { detail: { count: newCount } }));
        showToast(`Moved ${inStockItems.length} in-stock items to your cart!`);
    };

    const handleCopyLink = () => {
        const dummyUrl = `${window.location.origin}/shared/wishlist/usr_${localStorage.getItem('username')?.split('@')[0] || 'member'}`;
        navigator.clipboard.writeText(dummyUrl);
        setCopied(true);
        showToast('Share link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter Items
    const filteredItems = wishlistItems.filter(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort Items
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortBy === 'price-asc') {
            return Number(a.product.price) - Number(b.product.price);
        }
        if (sortBy === 'price-desc') {
            return Number(b.product.price) - Number(a.product.price);
        }
        if (sortBy === 'name-asc') {
            return a.product.name.localeCompare(b.product.name);
        }
        return b.id - a.id; // Default: Recently Added
    });

    const getCategoryBadgeStyle = (slug) => {
        const name = slug || 'default';
        if (name.includes('elec') || name.includes('phone') || name.includes('laptop')) {
            return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
        }
        if (name.includes('cloth') || name.includes('wear') || name.includes('fash')) {
            return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
        }
        if (name.includes('shoe') || name.includes('foot')) {
            return 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
        }
        return 'bg-slate-50 text-slate-600 dark:bg-dark-900 dark:text-slate-400 border-slate-100 dark:border-slate-800';
    };

    const getStockStatus = (stock) => {
        if (stock === undefined) return { label: 'In Stock', style: 'text-emerald-500 bg-emerald-500/10' };
        if (stock === 0) return { label: 'Out of Stock', style: 'text-rose-500 bg-rose-500/10' };
        if (stock <= 3) return { label: `Only ${stock} Left`, style: 'text-amber-500 bg-amber-500/10 animate-pulse' };
        return { label: 'In Stock', style: 'text-emerald-500 bg-emerald-500/10' };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh] bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-rose-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-rose-500 border-b-rose-500 animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-950 font-sans pb-24 pt-8 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className={`fixed top-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border text-sm font-bold text-white ${
                                toast.type === 'error' 
                                    ? 'bg-rose-600 border-rose-500' 
                                    : 'bg-emerald-600 border-emerald-500'
                            }`}
                        >
                            {toast.type === 'error' ? <AlertCircle className="w-4.5 h-4.5" /> : <Check className="w-4.5 h-4.5" />}
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-3 bg-white dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-750 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl transition-all shadow-sm hover:scale-105 active:scale-95 text-slate-600 dark:text-slate-300"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 shadow-inner">
                                <Heart className="w-7 h-7 fill-rose-500 text-rose-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                    My Wish List <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved in your premium vault
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShareModalOpen(true)}
                            disabled={wishlistItems.length === 0}
                            className="px-4.5 py-3 bg-white dark:bg-dark-850 text-slate-700 dark:text-slate-200 font-extrabold border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all text-sm shadow-sm hover:scale-102 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Share2 className="w-4.5 h-4.5 text-slate-500" /> Share List
                        </button>
                        <button
                            onClick={handleAddAllToCart}
                            disabled={wishlistItems.length === 0}
                            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black rounded-2xl flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/20 transition-all text-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-4.5 h-4.5 fill-slate-900/10" /> Add All to Cart
                        </button>
                    </div>
                </div>

                {/* Filter and Sort Toolbar */}
                {wishlistItems.length > 0 && (
                    <div className="bg-white/80 dark:bg-dark-800/65 backdrop-blur-md border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search Input */}
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search saved items..."
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/40 transition-all font-semibold"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <ArrowUpDown className="w-4 h-4" />
                                <span>Sort By</span>
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/60 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors"
                            >
                                <option value="recent">Recently Saved</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="name-asc">Alphabetical (A-Z)</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Wishlist Items Grid */}
                {wishlistItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-dark-800/60 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm text-center px-4"
                    >
                        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative animate-pulse">
                            <Heart className="w-10 h-10 fill-rose-500/20" />
                            <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-ping"></div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Your wish list is currently empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md text-center mb-8 font-medium">
                            Save products you're eyeing here. Keep tabs on stock levels, price changes, and add them to your cart when ready!
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/10 dark:shadow-indigo-900/20"
                        >
                            Explore Products
                        </button>
                    </motion.div>
                ) : sortedItems.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-dark-800/30 rounded-3xl border border-slate-100 dark:border-slate-800/40">
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No saved products matched your search term.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="text-rose-500 font-extrabold text-sm hover:underline mt-2"
                        >
                            Reset Search Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {sortedItems.map((item) => {
                                const product = item.product;
                                const isLocal = product.image && !product.image.includes('://');
                                const imageUrl = isLocal ? `${import.meta.env.VITE_MEDIA_URL || ''}${product.image}` : product.image;
                                const stockInfo = getStockStatus(product.stock);

                                return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-md rounded-[2rem] border border-slate-100 dark:border-slate-800/60 overflow-hidden hover:shadow-xl dark:hover:shadow-dark-900/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group relative"
                                    >
                                        {/* Image Container with zoom */}
                                        <div 
                                            className="relative aspect-[4/3] bg-[#f8fafc] dark:bg-slate-800/50 p-6 flex items-center justify-center cursor-pointer overflow-hidden" 
                                            onClick={() => navigate(`/product/${product.id}`)}
                                        >
                                            <img 
                                                src={imageUrl} 
                                                alt={product.name} 
                                                className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500" 
                                            />
                                            
                                            {/* Category Tag Overlay */}
                                            <span className={`absolute bottom-4 left-4 border text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${getCategoryBadgeStyle(product.category?.slug)}`}>
                                                {product.category?.name || 'Item'}
                                            </span>

                                            {/* Trash button absolute */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromWishlist(product.id);
                                                }}
                                                className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-500 transition-all shadow-sm hover:scale-110 active:scale-90"
                                                title="Remove from list"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                        
                                        {/* Card Body */}
                                        <div className="p-6 flex flex-col flex-grow border-t border-slate-50 dark:border-slate-800/30">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 text-base leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg shrink-0 border border-amber-100 dark:border-amber-900/20">
                                                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">4.8</span>
                                                </div>
                                            </div>
                                            
                                            {/* Details & Pricing */}
                                            <div className="flex items-center justify-between mt-auto pt-4 mb-5">
                                                <div className="text-xl font-black text-slate-900 dark:text-white">
                                                    ₹{Number(product.price).toLocaleString('en-IN')}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${stockInfo.style}`}>
                                                    {stockInfo.label}
                                                </span>
                                            </div>

                                            {/* Action Button */}
                                            <button 
                                                onClick={() => moveToCart(product)}
                                                disabled={product.stock === 0}
                                                className="w-full py-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-50 disabled:hover:text-indigo-600"
                                            >
                                                <ShoppingBag className="w-4.5 h-4.5 group-hover:-translate-y-0.5 transition-transform" />
                                                <span>Move to Cart</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* SHARE WISHLIST MODAL */}
            {shareModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 w-full max-w-lg border border-slate-100 dark:border-slate-700/60 shadow-2xl relative"
                    >
                        <button 
                            onClick={() => setShareModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-dark-900 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-500/10 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Share2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Share Your Wish List</h3>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold mt-1">Generate a direct visual link for friends and family.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-dark-900 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-800/80">
                                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Direct Shareable Link</span>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        readOnly
                                        value={`${window.location.origin}/shared/wishlist/usr_${localStorage.getItem('username')?.split('@')[0] || 'member'}`}
                                        className="flex-1 bg-white dark:bg-dark-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 outline-none select-all"
                                    />
                                    <button 
                                        onClick={handleCopyLink}
                                        className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors active:scale-95"
                                        title="Copy Link"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2">Wish List Summary</span>
                                <div className="max-h-36 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                                    {wishlistItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                            <div className="w-8 h-8 rounded bg-slate-50 dark:bg-dark-900 p-0.5 shrink-0 flex items-center justify-center">
                                                <img 
                                                    src={item.product.image.startsWith('http') ? item.product.image : `${import.meta.env.VITE_MEDIA_URL || ''}${item.product.image}`} 
                                                    className="w-full h-full object-contain"
                                                    alt={item.product.name}
                                                />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate flex-1">{item.product.name}</span>
                                            <span className="text-[11px] font-black text-slate-900 dark:text-white shrink-0">₹{item.product.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShareModalOpen(false)}
                                className="px-5 py-2.5 bg-slate-100 dark:bg-dark-900 hover:bg-slate-200 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-300 font-extrabold rounded-xl text-xs transition-colors"
                            >
                                Close Panel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
