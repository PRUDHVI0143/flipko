import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowLeft, Trash2, Star } from 'lucide-react';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isLoggedIn = !!localStorage.getItem('access_token');

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        const fetchWishlist = async () => {
            try {
                const res = await api.get('/wishlist/');
                setWishlistItems(res.data.items || []);
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [isLoggedIn, navigate]);

    const removeFromWishlist = async (productId) => {
        try {
            await api.delete(`/wishlist/${productId}/`);
            setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
        } catch (error) {
            console.error('Failed to remove item', error);
        }
    };

    const moveToCart = (product) => {
        dispatch(addToCart({ productId: product.id, quantity: 1 }));
        removeFromWishlist(product.id);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh] bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-900 font-sans pb-24 pt-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 sm:px-10">
                
                {/* Header */}
                <div className="flex items-center gap-4 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-dark-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-500">
                            <Heart className="w-8 h-8 fill-rose-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Wishlist</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {wishlistItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-dark-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-24 h-24 bg-rose-50 dark:bg-dark-700 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-rose-300 dark:text-rose-500/50" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Your wishlist is empty</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-center mb-8">
                            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/40"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {wishlistItems.map((item) => {
                                const product = item.product;
                                const isLocal = product.image && !product.image.includes('://');
                                const imageUrl = isLocal ? `${import.meta.env.VITE_MEDIA_URL || ''}${product.image}` : product.image;

                                return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className="bg-white dark:bg-dark-800 rounded-[24px] border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl dark:hover:shadow-dark-900/50 transition-shadow flex flex-col"
                                    >
                                        <div className="relative aspect-video bg-[#f8fafc] dark:bg-slate-800/50 p-6 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                                            <img src={imageUrl} alt={product.name} className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal" />
                                            
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromWishlist(product.id);
                                                }}
                                                className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md rounded-full text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-500 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                        
                                        <div className="p-5 flex flex-col flex-grow border-t border-slate-50 dark:border-slate-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{product.name}</h3>
                                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md shrink-0 ml-2">
                                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">4.8</span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                ₹{Number(product.price).toLocaleString('en-IN')}
                                            </div>
                                            
                                            <button 
                                                onClick={() => moveToCart(product)}
                                                className="mt-auto w-full py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-colors group"
                                            >
                                                <ShoppingBag className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                                Move to Cart
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
