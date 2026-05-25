import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import api from '../api/axios';
import { ShoppingBag, ChevronLeft, Star, ShieldCheck, Truck, RefreshCw, Heart, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/common/SEO';

// Beautiful Toast Notification Component
const Toast = ({ toast }) => {
    if (!toast) return null;
    const isSuccess = toast.type === 'success';
    return (
        <AnimatePresence>
            <motion.div
                key="toast"
                initial={{ opacity: 0, y: -60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -60, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl min-w-[320px] max-w-[90vw] ${
                    isSuccess
                        ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                        : 'bg-rose-500 text-white shadow-rose-500/40'
                }`}
            >
                <div className={`p-1 rounded-full ${ isSuccess ? 'bg-white/20' : 'bg-white/20' }`}>
                    {isSuccess
                        ? <CheckCircle2 className="w-6 h-6 text-white" />
                        : <XCircle className="w-6 h-6 text-white" />
                    }
                </div>
                <div>
                    <p className="font-black text-base">{toast.title}</p>
                    <p className="text-sm font-medium opacity-90">{toast.message}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewError, setReviewError] = useState('');
    const [toast, setToast] = useState(null);
    const dispatch = useDispatch();
    const isLoggedIn = !!localStorage.getItem('access_token');

    const showToast = (type, title, message, duration = 3000) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), duration);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}/`);
                setProduct(response.data);
                
                // Fetch related products (same category)
                if (response.data.category?.slug) {
                    const relatedResponse = await api.get(`/products/?category=${response.data.category.slug}`);
                    setRelatedProducts(relatedResponse.data.filter(p => p.id !== Number(id)));
                }
            } catch (error) {
                console.error('Failed to fetch product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();

        if (isLoggedIn) {
            const checkWishlist = async () => {
                try {
                    const res = await api.get('/wishlist/');
                    const inWishlist = res.data.items.some(item => item.product.id === Number(id));
                    setIsWishlisted(inWishlist);
                } catch (error) {
                    console.error('Failed to check wishlist', error);
                }
            };
            checkWishlist();
        }

        window.scrollTo(0, 0); // Scroll to top on id change
    }, [id, isLoggedIn]);

    const toggleWishlist = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        
        try {
            if (isWishlisted) {
                await api.delete(`/wishlist/${id}/`);
                setIsWishlisted(false);
                window.dispatchEvent(new CustomEvent('wishlistUpdate'));
            } else {
                await api.post('/wishlist/', { product_id: id });
                setIsWishlisted(true);
                window.dispatchEvent(new CustomEvent('wishlistUpdate'));
            }
        } catch (error) {
            console.error('Failed to toggle wishlist', error);
        }
    };

    const handleAddToCart = async () => {
        try {
            await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
            showToast('success', 'Added to Bag!', `${product.name} has been added to your cart.`);
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error);
            showToast('error', 'Failed to Add', 'Could not add item to cart. Please try again.');
            return false;
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError('');
        try {
            const res = await api.post(`/products/${id}/add_review/`, reviewForm);
            setProduct(res.data);
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            setReviewError(err.response?.data?.error || 'Failed to submit review');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] bg-transparent dark:bg-dark-900 transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20 bg-transparent dark:bg-dark-900 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Product not found</h2>
                <Link to="/" className="text-amber-600 hover:underline mt-4 inline-block font-bold">Back to shopping</Link>
            </div>
        );
    }

    const discountedPrice = (Number(product.price) * 1.2).toFixed(2);

    return (
        <div className="min-h-screen bg-transparent dark:bg-dark-900 pb-24 transition-colors duration-300">
        <SEO 
            title={product.name} 
            description={product.description} 
            image={product.image?.includes('://') ? product.image : `${import.meta.env.VITE_MEDIA_URL || ''}${product.image}`}
            type="product"
        />
        <Toast toast={toast} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 mb-8 transition-colors font-bold">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Gallery
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Image Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-dark-800 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group"
                >
                    {/* Detail Wishlist Heart */}
                    <button 
                        onClick={toggleWishlist}
                        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-md shadow-lg border border-slate-100 dark:border-slate-700 hover:scale-110 transition-transform duration-300"
                    >
                        <Heart 
                            className={`w-6 h-6 transition-colors duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500 hover:text-rose-500'}`} 
                        />
                    </button>
                    
                    {(() => {
                        const categoryFallbacks = {
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
                        const fallback = categoryFallbacks[product.category?.slug] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
                        const imgSrc = product.image?.includes('://') ? product.image : (product.image ? `${import.meta.env.VITE_MEDIA_URL || ''}${product.image}` : fallback);
                        return (
                            <motion.img 
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.5 }}
                                src={imgSrc}
                                alt={product.name} 
                                className="max-h-[500px] w-auto object-contain"
                                onError={(e) => { if (e.target.src !== fallback) e.target.src = fallback; }}
                            />
                        );
                    })()}
                </motion.div>

                {/* Details Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <div className="mb-2">
                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {product.category?.name || 'Uncategorized'}
                        </span>
                    </div>
                    
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`w-5 h-5 ${i <= Math.round(product.average_rating || 0) ? 'fill-current text-amber-500' : 'text-slate-300'}`} />
                            ))}
                            <span className="ml-2 text-slate-800 dark:text-slate-200 font-bold text-lg">{product.average_rating || '4.8'}</span>
                            <span className="ml-2 text-slate-500 text-sm font-medium">({product.reviews?.length || 0} Reviews)</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
                            <span className="text-xl text-slate-400 dark:text-slate-500 line-through">₹{discountedPrice}</span>
                            <span className="text-emerald-500 dark:text-emerald-400 font-bold text-lg">20% OFF</span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 font-medium">Inclusive of all taxes</p>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
                        {product.description || "Expertly crafted with attention to detail, this product combines premium quality with contemporary design. Perfect for those who appreciate excellence and style in their everyday life."}
                    </p>

                    <div className="space-y-6 mb-10">
                        <div className="flex items-center gap-6">
                            <span className="text-slate-900 dark:text-white font-bold uppercase text-xs tracking-widest">Quantity</span>
                            <div className="flex items-center border-2 border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-dark-800">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-5 py-3 hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors text-slate-600 dark:text-slate-300 font-bold"
                                >
                                    -
                                </button>
                                <span className="px-6 py-3 font-bold text-slate-900 dark:text-white min-w-[60px] text-center">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-5 py-3 hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors text-slate-600 dark:text-slate-300 font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-5 px-8 rounded-2xl shadow-xl shadow-amber-500/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
                            >
                                <ShoppingBag className="w-6 h-6" />
                                Add to Bag
                            </button>
                            <button 
                                onClick={async () => { 
                                    const success = await handleAddToCart(); 
                                    if (success) {
                                        // Small delay for the toast to be seen before navigating
                                        setTimeout(() => navigate('/checkout'), 800);
                                    }
                                }}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-orange-500/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>

                    {/* Features/Trust badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-8 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">1 Year Warranty</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <Truck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">7 Days Return</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reviews Section */}
            <div className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Review Form */}
                    <div className="lg:w-1/3">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Customer Reviews</h3>
                        <div className="bg-white dark:bg-dark-800 rounded-[24px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700">
                            {isLoggedIn ? (
                                <form onSubmit={handleReviewSubmit} className="space-y-6">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100">Write a Review</h4>
                                    
                                    {reviewError && (
                                        <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-semibold">
                                            {reviewError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                    className={`w-8 h-8 cursor-pointer transition-colors ${star <= reviewForm.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300 hover:text-amber-300'}`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Comment (Optional)</label>
                                        <textarea 
                                            value={reviewForm.comment}
                                            onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                                            rows="4" 
                                            className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 rounded-xl p-4 outline-none text-slate-700 dark:text-slate-200 resize-none"
                                            placeholder="What did you like or dislike?"
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                                        Submit Review
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-slate-500 mb-4 font-medium">Please login to write a review</p>
                                    <button onClick={() => navigate('/login')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Login Now</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="lg:w-2/3">
                        <div className="space-y-6">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map(review => (
                                    <div key={review.id} className="bg-white dark:bg-dark-800 rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black">
                                                    {review.user_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-slate-800 dark:text-slate-100">{review.user_name}</h5>
                                                    <p className="text-xs text-slate-400 font-medium">{new Date(review.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex text-amber-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-50 dark:bg-dark-800/50 rounded-[24px] p-10 text-center border border-dashed border-slate-200 dark:border-slate-700">
                                    <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No reviews yet</h4>
                                    <p className="text-slate-500">Be the first to review this product!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="mt-20">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Products related to this item</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {/* Simplified related products logic: showing items from same category */}
                    {relatedProducts.slice(0, 6).map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-dark-900/50 transition-all cursor-pointer group"
                        >
                            <div className="aspect-square bg-slate-50 dark:bg-dark-900 rounded-xl mb-4 overflow-hidden p-4">
                                <img 
                                    src={item.image?.includes('://') ? item.image : `${import.meta.env.VITE_MEDIA_URL || ''}${item.image}`} 
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform dark:mix-blend-normal mix-blend-multiply" 
                                    alt={item.name}
                                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"; }}
                                />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">{item.name}</h4>
                            <div className="text-amber-500 dark:text-amber-400 font-black text-sm">₹{item.price}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div>
    );
};

export default ProductDetail;

