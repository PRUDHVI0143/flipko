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
        <div className="max-w-[800px] mx-auto py-20 px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] p-12 text-center shadow-2xl shadow-emerald-500/10 border border-emerald-50 relative overflow-hidden"
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

                    <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Order Placed Successfully!</h1>
                    <p className="text-slate-500 text-lg mb-10 max-w-sm">
                        Thank you for your purchase. Your order <span className="text-slate-900 font-bold"># {id}</span> is being processed and will be shipped soon.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center">
                            <Truck className="w-6 h-6 text-emerald-500 mb-3" />
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Shipping</h4>
                            <p className="text-sm font-bold text-slate-800">2-4 Business Days</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center">
                            <Star className="w-6 h-6 text-amber-500 mb-3" />
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Reward</h4>
                            <p className="text-sm font-bold text-slate-800">+50 Flipko Coins</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center">
                            <Package className="w-6 h-6 text-blue-500 mb-3" />
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status</h4>
                            <p className="text-sm font-bold text-slate-800">Processing</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <button 
                            onClick={() => navigate('/orders')}
                            className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                        >
                            View Order Details
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Home className="w-5 h-5" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
