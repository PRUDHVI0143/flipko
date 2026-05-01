import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle, 
    Home, 
    Package, 
    ArrowRight,
    Truck,
    Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-900 py-20 px-4 transition-colors duration-300">
        <div className="max-w-[800px] mx-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-dark-800 rounded-[40px] p-12 text-center shadow-2xl shadow-emerald-500/10 dark:shadow-dark-900/50 border border-emerald-50 dark:border-emerald-900/30 relative overflow-hidden"
            >
                {/* Decorative background elements */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/40"
                    >
                        <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>

                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Order Placed Successfully!</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-sm font-medium">
                        Thank you for your purchase. Your order <span className="text-slate-900 dark:text-white font-bold"># {id}</span> is being processed and will be shipped soon.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                        <div className="p-6 bg-slate-50 dark:bg-dark-900 rounded-[32px] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                            <Truck className="w-6 h-6 text-emerald-500 mb-3" />
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Shipping</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">2-4 Business Days</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-dark-900 rounded-[32px] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                            <Star className="w-6 h-6 text-amber-500 mb-3" />
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Reward</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">+50 Flipko Coins</p>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-dark-900 rounded-[32px] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                            <Package className="w-6 h-6 text-blue-500 mb-3" />
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Processing</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button 
                            onClick={() => navigate('/orders')}
                            className="flex-1 bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-slate-900/20 dark:shadow-indigo-900/40"
                        >
                            View Order Details
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-white dark:bg-dark-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-dark-700 transition-all active:scale-95"
                        >
                            <Home className="w-5 h-5" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
        </div>
    );
};

export default OrderSuccess;
