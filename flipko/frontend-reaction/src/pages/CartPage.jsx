import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, updateCartItem } from '../features/cart/cartSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';

const CartPage = () => {
  const { items, loading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  const handleUpdateQuantity = (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity > 0) {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-slate-50 dark:bg-dark-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-dark-900 pb-20 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Cart</h1>
        <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-bold flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Continue Shopping
        </Link>
      </div>
      
      {items.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-dark-800 rounded-[40px] shadow-xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700"
        >
          <div className="w-24 h-24 bg-slate-50 dark:bg-dark-900 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Your cart feels lonely</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto text-lg leading-relaxed font-medium">
            Looks like you haven't added anything to your cart yet. Explore our latest products and find something you love!
          </p>
          <Link to="/" className="bg-slate-900 dark:bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-indigo-500 transition-all shadow-xl shadow-slate-900/10 dark:shadow-indigo-900/40 hover:-translate-y-1 inline-block">
            Explore Collection
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.id} 
                    className="flex flex-col sm:flex-row gap-6 bg-white dark:bg-dark-800 p-6 rounded-[32px] shadow-sm hover:shadow-xl dark:hover:shadow-dark-900/50 transition-all duration-500 border border-slate-100 dark:border-slate-700 group"
                >
                  {/* Item Image */}
                  <div className="w-full sm:w-40 h-40 bg-slate-50 dark:bg-dark-900 rounded-2xl flex items-center justify-center p-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-200/20 dark:to-dark-900/50"></div>
                    {item.product.image ? (
                       <img 
                        src={item.product.image?.includes('://') ? item.product.image : `${import.meta.env.VITE_MEDIA_URL || ''}${item.product.image}`} 
                        alt={item.product.name} 
                        className="object-contain w-full h-full transform transition-transform duration-500 group-hover:scale-110 dark:mix-blend-normal mix-blend-multiply" 
                       />
                    ) : (
                      <span className="text-slate-300 dark:text-slate-700 font-bold opacity-30 text-xs">NO IMAGE</span>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                         <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight line-clamp-2">{item.product.name}</h3>
                         <div className="text-2xl font-black text-slate-900 dark:text-white">₹{(item.product.price * item.quantity).toFixed(0)}</div>
                      </div>
                      <div className="text-primary-500 dark:text-primary-400 font-bold text-xs uppercase tracking-widest mb-4">
                        {item.product.category?.name || 'Standard Edition'}
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 text-sm italic font-medium">Unit Price: ₹{item.product.price}</div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center bg-slate-50 dark:bg-dark-900 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-700">
                        <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                            className="p-2 hover:bg-white dark:hover:bg-dark-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-5 font-black text-slate-900 dark:text-white min-w-[50px] text-center">{item.quantity}</span>
                        <button 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                            className="p-2 hover:bg-white dark:hover:bg-dark-800 rounded-xl text-slate-600 dark:text-slate-300 transition-all active:scale-90"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-2xl hover:bg-rose-500 hover:text-white transition-all group-hover:shadow-lg dark:group-hover:shadow-rose-900/50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Checkout Column */}
          <div className="w-full xl:w-[400px]">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 dark:bg-dark-800 text-white p-8 rounded-[40px] shadow-2xl shadow-slate-900/20 dark:shadow-dark-900/50 sticky top-24 border border-white/5"
            >
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary-400" />
                Order Summary
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-medium">Subtotal</span>
                  <span className="text-white font-bold">₹{totalAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-b border-white/10 pb-6">
                  <span className="font-medium">Shipping</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Free Delivery</span>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <span className="text-2xl font-bold">Total</span>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">VAT Included</p>
                  </div>
                  <span className="text-4xl font-black text-primary-400">₹{totalAmount.toFixed(0)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 py-5 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
              >
                Proceed to Checkout
                <ShoppingBag className="w-5 h-5" />
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-4 text-white/40 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default CartPage;

