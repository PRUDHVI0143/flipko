import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Package, 
    ChevronRight, 
    Calendar, 
    CheckCircle2, 
    Clock, 
    Truck, 
    Search,
    ShoppingBag,
    ArrowLeft
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Get order IDs saved in localStorage for guest tracking
                const savedIds = JSON.parse(localStorage.getItem('flipko_order_ids') || '[]');
                if (savedIds.length === 0) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }
                // Fetch all orders and filter to only show this user's orders
                const response = await api.get('/orders/');
                const allOrders = Array.isArray(response.data)
                    ? response.data
                    : response.data.results || [];
                const myOrders = allOrders
                    .filter(o => savedIds.includes(o.id))
                    .sort((a, b) => b.id - a.id); // Newest orders first
                setOrders(myOrders);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'Shipped': return <Truck className="w-4 h-4 text-blue-500" />;
            case 'Processing': return <Clock className="w-4 h-4 text-amber-500" />;
            default: return <Package className="w-4 h-4 text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent dark:bg-dark-900 flex justify-center items-center py-40 transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent dark:bg-dark-900 pb-20 transition-colors duration-300">
        <div className="max-w-[1000px] mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-10">
                <button 
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </button>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-dark-800 rounded-[40px] p-20 text-center shadow-2xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-50 dark:border-slate-700">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">No orders found</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto font-medium">
                        It looks like you haven't placed any orders yet. Start shopping our premium catalog!
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#131921] dark:bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-slate-900/20 dark:shadow-indigo-900/40"
                    >
                        Explore Marketplace
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={order.id}
                            className="bg-white dark:bg-dark-800 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-50 dark:border-slate-700 hover:border-amber-100 dark:hover:border-amber-500/30 transition-all group"
                        >
                            {/* Order Header */}
                            <div className="bg-slate-50/80 dark:bg-dark-900/50 px-8 py-5 flex flex-wrap justify-between items-center gap-6 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex gap-10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Order Placed</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Total Value</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none mt-1">₹{order.total_amount}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Ship To</p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none mt-1">{order.first_name} {order.last_name}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Order # {order.id}</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 cursor-pointer">
                                        View Details <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div className="px-8 py-8">
                                <div className="flex items-center gap-3 mb-8 bg-slate-50 dark:bg-dark-900 inline-flex px-4 py-2 rounded-xl">
                                    {getStatusIcon(order.status)}
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{order.status}</span>
                                </div>

                                <div className="space-y-6">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="flex gap-6 items-center">
                                            <div className="w-20 h-20 bg-white dark:bg-dark-900 rounded-2xl flex-shrink-0 flex items-center justify-center p-3 border border-slate-50 dark:border-slate-700 group-hover:border-amber-50 dark:group-hover:border-amber-500/30 shadow-sm overflow-hidden">
                                                <img 
                                                    src={item.product?.image ? (item.product.image?.includes('://') ? item.product.image : `http://127.0.0.1:8080${item.product.image}`) : 'https://placehold.co/400'} 
                                                    alt={item.product?.name} 
                                                    className="w-full h-full object-contain transform transition-transform group-hover:scale-110 dark:mix-blend-normal mix-blend-multiply"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{item.product?.name || 'Unknown Product'}</h4>
                                                <div className="flex items-center gap-4 text-sm font-bold text-slate-400 dark:text-slate-500">
                                                    <span>₹{item.price}</span>
                                                    <span>•</span>
                                                    <span>Quantity: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex flex-col gap-2">
                                                <button className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10 transition-all active:scale-95">
                                                    Buy it again
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/track/${order.id}`)}
                                                    className="bg-slate-100 dark:bg-dark-900 hover:bg-amber-100 dark:hover:bg-amber-500/10 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-400 px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/30 flex items-center gap-1.5"
                                                >
                                                    <Truck className="w-3.5 h-3.5" /> Track package
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default Orders;
