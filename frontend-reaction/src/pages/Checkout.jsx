import React, { useState } from 'react';
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
    Lock
} from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const Checkout = () => {
    const navigate = useNavigate();
    const cartItems = useSelector(state => state.cart.items);
    const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 40;
    const total = subtotal + shipping;

    const [loading, setLoading] = useState(false);
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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const orderData = {
                ...formData,
                total_amount: total,
                items: cartItems.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                }))
            };
            const response = await api.post('/orders/api/', orderData);
            if (response.status === 201) {
                // Success!
                navigate(`/order-success/${response.data.id}`);
            }
        } catch (error) {
            console.error('Order placement failed', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-xl border border-slate-100">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Truck className="w-12 h-12 text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 max-w-xs text-center">Add some premium items before checking out.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-amber-400 text-slate-900 px-10 py-4 rounded-2xl font-black hover:bg-amber-500 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                >
                    Return to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Left: Form */}
                <div className="flex-1 space-y-8">
                    <section className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                                <Truck className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Address</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                    <div className="relative group">
                                        <input 
                                            required
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            type="text" 
                                            placeholder="John"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium"
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input 
                                        required
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                        type="text" 
                                        placeholder="Doe"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <input 
                                            required
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email" 
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <input 
                                            required
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="tel" 
                                            placeholder="+91 9876543210"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium"
                                        />
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                                <div className="relative group">
                                    <input 
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        type="text" 
                                        placeholder="123 Luxury Avenue, Suite 4B"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 pl-12 transition-all outline-none font-medium"
                                    />
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-500" />
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
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 transition-all outline-none font-medium"
                                />
                                <input 
                                    required
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="State"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 transition-all outline-none font-medium"
                                />
                                <input 
                                    required
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    type="text" 
                                    placeholder="Pincode"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-amber-400 focus:bg-white rounded-2xl py-4 px-6 transition-all outline-none font-medium"
                                />
                            </div>
                        </form>
                    </section>

                    <section className="bg-[#131921] text-white rounded-[32px] p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <PaymentIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Payment Method</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border-2 border-amber-500 bg-amber-500/10 p-5 rounded-3xl cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-amber-500 font-black text-sm uppercase tracking-tighter">Gold Secured</div>
                                    <ShieldCheck className="text-amber-500 w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-lg mb-1">Cash on Delivery</h4>
                                <p className="text-xs text-slate-400">Pay directly at your doorstep</p>
                            </div>
                            <div className="border-2 border-white/10 bg-white/5 p-5 rounded-3xl opacity-50 cursor-not-allowed">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-slate-400 font-black text-sm uppercase tracking-tighter">Disabled</div>
                                    <Lock className="text-slate-500 w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-lg mb-1">Card / UPI</h4>
                                <p className="text-xs text-slate-500">Coming soon in next update</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right: Summary */}
                <div className="lg:w-[400px]">
                    <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 sticky top-32">
                        <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Order Summary</h3>
                        
                        <div className="space-y-4 mb-8">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-slate-100">
                                        <img 
                                            src={item.product.image?.includes('://') ? item.product.image : `http://127.0.0.1:8080${item.product.image}`} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{item.product.name}</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Qty: {item.quantity}</span>
                                            <span className="text-sm font-black text-slate-900">₹{(Number(item.product.price)*item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-slate-100 pt-6 space-y-3">
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'text-emerald-500 font-bold' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-900 text-2xl font-black pt-4">
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
                        
                        <p className="text-[10px] text-center text-slate-400 mt-6 font-medium">
                            By clicking "Complete Order", you agree to our <br/>
                            <span className="text-slate-600 underline">Terms of Service</span> and <span className="text-slate-600 underline">Refund Policy</span>.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
