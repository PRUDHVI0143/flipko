import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronLeft, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();

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
        window.scrollTo(0, 0); // Scroll to top on id change
    }, [id]);

    const handleAddToCart = () => {
        dispatch(addToCart({ productId: product.id, quantity }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-slate-800">Product not found</h2>
                <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">Back to shopping</Link>
            </div>
        );
    }

    const discountedPrice = (Number(product.price) * 1.2).toFixed(2);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-8 transition-colors">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Gallery
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Image Section */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center overflow-hidden"
                >
                    {product.image ? (
                        <motion.img 
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            src={product.image?.includes('://') ? product.image : `http://127.0.0.1:8080${product.image}`} 
                            alt={product.name} 
                            className="max-h-[500px] w-auto object-contain"
                        />
                    ) : (
                        <div className="h-[400px] flex items-center justify-center text-slate-300 font-bold text-2xl tracking-widest">
                            NO IMAGE AVAILABLE
                        </div>
                    )}
                </motion.div>

                {/* Details Section */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                >
                    <div className="mb-2">
                        <span className="bg-primary-50 text-primary-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {product.category?.name || 'Uncategorized'}
                        </span>
                    </div>
                    
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                            <Star className="w-5 h-5 text-slate-300" />
                            <span className="ml-2 text-slate-500 text-sm font-medium">(124 Reviews)</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-bold text-slate-900">₹{product.price}</span>
                            <span className="text-xl text-slate-400 line-through">₹{discountedPrice}</span>
                            <span className="text-emerald-500 font-bold text-lg">20% OFF</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">Inclusive of all taxes</p>
                    </div>

                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {product.description || "Expertly crafted with attention to detail, this product combines premium quality with contemporary design. Perfect for those who appreciate excellence and style in their everyday life."}
                    </p>

                    <div className="space-y-6 mb-10">
                        <div className="flex items-center gap-6">
                            <span className="text-slate-900 font-bold uppercase text-xs tracking-widest">Quantity</span>
                            <div className="flex items-center border-2 border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-5 py-3 hover:bg-slate-200 transition-colors text-slate-600 font-bold"
                                >
                                    -
                                </button>
                                <span className="px-6 py-3 font-bold text-slate-900 min-w-[60px] text-center">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-5 py-3 hover:bg-slate-200 transition-colors text-slate-600 font-bold"
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
                                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 px-8 rounded-2xl shadow-xl shadow-orange-500/10 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 active:scale-95"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>

                    {/* Features/Trust badges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">1 Year Warranty</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Truck className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600">7 Days Return</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Related Products */}
            <div className="mt-20">
                <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Products related to this item</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {/* Simplified related products logic: showing items from same category */}
                    {relatedProducts.slice(0, 6).map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all cursor-pointer group"
                        >
                            <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden p-4">
                                <img 
                                    src={item.image?.includes('://') ? item.image : `http://127.0.0.1:8080${item.image}`} 
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                                    alt={item.name} 
                                />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-amber-600">{item.name}</h4>
                            <div className="text-amber-500 font-black text-sm">₹{item.price}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

