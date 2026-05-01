import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    CreditCard, 
    Truck, 
    ShieldCheck, 
    ChevronRight, 
    CreditCard as PaymentIcon,
    Building,
    User,
    Phone,
    Mail,
    Lock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

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

const Checkout = () => {
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping;

    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const showToast = (type, title, message, duration = 4000) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), duration);
    };

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                ...formData,
                items: cartItems.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                }))
            };
            const response = await api.post('/orders/', orderData);
            if (response.status === 201) {
                const orderId = response.data.id;
                
                const saveTracking = () => {
                    // Save order ID for guest tracking
                    const existingIds = JSON.parse(localStorage.getItem('flipko_order_ids') || '[]');
                    if (!existingIds.includes(orderId)) existingIds.push(orderId);
                    localStorage.setItem('flipko_order_ids', JSON.stringify(existingIds));

                    // Save order meta: timestamp + delivery address for live tracking
                    const orderMeta = JSON.parse(localStorage.getItem('flipko_order_meta') || '{}');
                    orderMeta[orderId] = {
                        placedAt: Date.now(),
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                    };
                    localStorage.setItem('flipko_order_meta', JSON.stringify(orderMeta));
                };

                if (paymentMethod === 'Razorpay') {
                    try {
                        const rzpResponse = await api.post(`/orders/${orderId}/razorpay_create/`);
                        const { razorpay_order_id, amount, currency, key_id } = rzpResponse.data;

                        if (key_id === 'rzp_test_fake_key_for_dev' || !key_id) {
                            // Simulate a successful payment without popping the real Razorpay modal which would crash
                            setTimeout(async () => {
                                try {
                                    await api.post(`/orders/${orderId}/razorpay_verify/`, {
                                        razorpay_payment_id: `pay_mock_${Date.now()}`,
                                        razorpay_order_id: razorpay_order_id,
                                        razorpay_signature: "mock_signature_dev"
                                    });
                                    saveTracking();
                                    showToast('success', '🎉 Payment Successful!', 'Mock payment completed successfully in Dev Mode.');
                                    setTimeout(() => navigate(`/order-success/${orderId}`), 1800);
                                } catch (err) {
                                    showToast('error', 'Mock Verification Failed', 'Something went wrong.');
                                    setLoading(false);
                                }
                            }, 1500);
                        } else {
                            const options = {
                                key: key_id,
                                amount: amount,
                                currency: currency,
                                name: "Flipko",
                                description: "Premium E-commerce Purchase",
                                order_id: razorpay_order_id,
                                handler: async function (res) {
                                    try {
                                        await api.post(`/orders/${orderId}/razorpay_verify/`, {
                                            razorpay_payment_id: res.razorpay_payment_id,
                                            razorpay_order_id: res.razorpay_order_id,
                                            razorpay_signature: res.razorpay_signature
                                        });
                                        saveTracking();
                                        showToast('success', '🎉 Payment Successful!', 'Your order has been placed successfully!');
                                        setTimeout(() => navigate(`/order-success/${orderId}`), 1800);
                                    } catch (err) {
                                        showToast('error', 'Payment Verification Failed', 'Contact support if amount was deducted.');
                                        setLoading(false);
                                    }
                                },
                                prefill: {
                                    name: `${formData.first_name} ${formData.last_name}`,
                                    email: formData.email,
                                    contact: formData.phone
                                },
                                theme: { color: "#ea580c" }
                            };
                            const rzp = new window.Razorpay(options);
                            rzp.on('payment.failed', function (res) {
                                showToast('error', 'Payment Failed', res.error.description);
                                setLoading(false);
                            });
                            rzp.open();
                        }
                    } catch (err) {
                        showToast('error', 'Razorpay Error', 'Could not initialize payment gateway.');
                        setLoading(false);
                    }
                } else {
                    // COD Flow
                    saveTracking();
                    showToast('success', '🎉 Order Placed!', 'Your order has been placed successfully!');
                    setTimeout(() => navigate(`/order-success/${orderId}`), 1800);
                }
            }
        } catch (error) {
            console.error('Order placement failed', error.response?.data || error);
            const detail = error.response?.data?.detail || 'Something went wrong. Please try again.';
            showToast('error', 'Order Failed', detail);
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-900 flex flex-col items-center justify-center py-20 px-4 transition-colors duration-300">
                <div className="bg-white dark:bg-dark-800 rounded-3xl p-10 shadow-xl dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center max-w-md w-full">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-dark-900 rounded-full flex items-center justify-center mb-6">
                        <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Your cart is empty</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Add some premium items before checking out.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-amber-400 text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-amber-500 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent dark:bg-dark-900 pb-20 transition-colors duration-300">
        <Toast toast={toast} />
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Left: Form */}
                <div className="flex-1 space-y-8">
                    <section className="bg-white dark:bg-dark-800 rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-50 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Delivery Address</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                                    <div className="relative group">
                                        <input 
                                            required
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            type="text" 
                                            placeholder="John"
                                            className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within:text-amber-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        required
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        type="text" 
                                        placeholder="Doe"
                                        className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <input 
                                            required
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email" 
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within:text-amber-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <input 
                                            required
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="tel" 
                                            placeholder="+91 9876543210"
                                            className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within:text-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                                <div className="relative group">
                                    <input 
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        type="text" 
                                        placeholder="123 Luxury Avenue, Suite 4B"
                                        className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                    />
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700 group-focus-within:text-amber-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <input 
                                    required
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="City"
                                    className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                                <input 
                                    required
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="State"
                                    className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                                <input 
                                    required
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="Pincode"
                                    className="w-full bg-slate-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-400 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-dark-950 rounded-2xl py-4 px-6 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                                />
                            </div>
                        </form>
                    </section>

                    <section className="bg-slate-900 dark:bg-dark-800 text-white rounded-[32px] p-8 shadow-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <PaymentIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Payment Method</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                onClick={() => setPaymentMethod('COD')}
                                className={`border-2 p-5 rounded-3xl cursor-pointer transition-all ${
                                    paymentMethod === 'COD' 
                                    ? 'border-amber-500 bg-amber-500/10' 
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`font-black text-sm uppercase tracking-tighter ${paymentMethod === 'COD' ? 'text-amber-500' : 'text-slate-400'}`}>
                                        Gold Secured
                                    </div>
                                    <ShieldCheck className={`${paymentMethod === 'COD' ? 'text-amber-500' : 'text-slate-500'} w-5 h-5`} />
                                </div>
                                <h4 className="font-bold text-lg mb-1">Cash on Delivery</h4>
                                <p className="text-xs text-slate-400 font-medium">Pay directly at your doorstep</p>
                            </div>

                            <div 
                                onClick={() => setPaymentMethod('Razorpay')}
                                className={`border-2 p-5 rounded-3xl cursor-pointer transition-all ${
                                    paymentMethod === 'Razorpay' 
                                    ? 'border-indigo-500 bg-indigo-500/10' 
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`font-black text-sm uppercase tracking-tighter ${paymentMethod === 'Razorpay' ? 'text-indigo-400' : 'text-slate-400'}`}>
                                        Instant Pay
                                    </div>
                                    <CreditCard className={`${paymentMethod === 'Razorpay' ? 'text-indigo-400' : 'text-slate-500'} w-5 h-5`} />
                                </div>
                                <h4 className="font-bold text-lg mb-1">Card / UPI / NetBanking</h4>
                                <p className="text-xs text-slate-400 font-medium">Secured by Razorpay</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Summary */}
                <div className="lg:w-[400px]">
                    <div className="bg-white dark:bg-dark-800 rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-50 dark:border-slate-700 sticky top-32">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Order Summary</h3>
                        
                        <div className="space-y-4 mb-8">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-dark-900 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <img 
                                            src={item.product.image?.includes('://') ? item.product.image : `http://127.0.0.1:8000${item.product.image}`} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-contain dark:mix-blend-normal mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mb-1">{item.product.name}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">Qty: {item.quantity}</span>
                                            <span className="text-sm font-black text-slate-900 dark:text-white">₹{(Number(item.product.price)*item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-3">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400 font-bold text-sm">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'text-emerald-500 dark:text-emerald-400 font-black' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-900 dark:text-white text-2xl font-black pt-4">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            form="checkout-form"
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-10 bg-amber-400 hover:bg-amber-500 text-slate-900 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-slate-900/20 border-t-slate-900 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Complete Order
                                    <ChevronRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                        
                        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-6 font-bold uppercase tracking-widest leading-relaxed">
                            By clicking "Complete Order", you agree to our <br/>
                            <span className="text-slate-600 dark:text-slate-300 underline">Terms of Service</span> and <span className="text-slate-600 dark:text-slate-300 underline">Refund Policy</span>.
                        </p>
                    </div>
                </div>

            </div>
        </div>
        </div>
    );
};

export default Checkout;
