import React from 'react';
import { 
    X, 
    ChevronRight, 
    UserCircle, 
    Globe, 
    Settings,
    HelpCircle,
    Flag,
    LogOut,
    Home,
    TrendingUp,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, categories }) => {
    const navigate = useNavigate();
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                    />

                    {/* Sidebar Content */}
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed top-0 left-0 bottom-0 w-[360px] bg-white z-[101] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-[#232f3e] text-white p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UserCircle className="w-8 h-8" />
                                <h3 className="text-xl font-bold">Hello, Sign in</h3>
                            </div>
                            <button onClick={onClose} className="hover:rotate-90 transition-transform">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Scrollable List */}
                        <div className="flex-1 overflow-y-auto pt-4 pb-10">
                            {/* Trending Section */}
                            <section className="border-b border-slate-100 pb-4 mb-4">
                                <h4 className="px-8 py-2 text-lg font-bold text-slate-800">Trending</h4>
                                <ul className="text-sm">
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">Best Sellers</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">New Releases</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">Movers and Shakers</li>
                                </ul>
                            </section>

                            {/* Shop By Category */}
                            <section className="border-b border-slate-100 pb-4 mb-4">
                                <h4 className="px-8 py-2 text-lg font-bold text-slate-800">Shop By Category</h4>
                                <ul className="text-sm">
                                    {categories.map(cat => (
                                        <li 
                                            key={cat.slug} 
                                            onClick={() => {
                                                navigate(`/?category=${cat.slug}`);
                                                onClose();
                                            }}
                                            className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors flex justify-between items-center group"
                                        >
                                            {cat.name}
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Programs & Features */}
                            <section className="border-b border-slate-100 pb-4 mb-4">
                                <h4 className="px-8 py-2 text-lg font-bold text-slate-800">Programs & Features</h4>
                                <ul className="text-sm">
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors flex justify-between items-center group">
                                        Flipko Prime
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
                                    </li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">Launchpad</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">Gift Cards</li>
                                </ul>
                            </section>

                            {/* Help & Settings */}
                            <section className="pb-4">
                                <h4 className="px-8 py-2 text-lg font-bold text-slate-800">Help & Settings</h4>
                                <ul className="text-sm">
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">Your Account</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors flex items-center gap-3"><Globe className="w-4 h-4" /> English</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors flex items-center gap-3"><Flag className="w-4 h-4" /> India</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">Customer Service</li>
                                    <li className="px-8 py-3 hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors font-bold text-rose-600">Sign In</li>
                                </ul>
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
