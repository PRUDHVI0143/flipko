import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Shield, Package, Heart, LogOut, Settings, 
  CreditCard, MapPin, Bell, Key, Plus, Trash2, Edit2, 
  Check, Smartphone, Landmark, Globe, Award, ChevronRight, 
  Save, X, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const Account = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('access_token');
    const username = localStorage.getItem('username') || 'Guest';
    const [userStats, setUserStats] = useState({ orders: 0, wishlist: 0 });
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Toast notifications
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Load state from localStorage or defaults
    const [profile, setProfile] = useState(() => {
        const saved = localStorage.getItem('user_profile');
        if (saved) return JSON.parse(saved);
        
        const isEmail = username.includes('@');
        const defaultEmail = isEmail ? username : `${username.toLowerCase()}@example.com`;
        const namePart = isEmail ? username.split('@')[0] : username;
        const defaultDisplayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        
        return {
            displayName: defaultDisplayName,
            email: defaultEmail,
            phone: '+1 (555) 234-5678',
            bio: 'Avid tech shopper & gadget enthusiast.',
            avatarGradient: 'from-indigo-500 to-purple-600',
            tier: 'Platinum Club Member'
        };
    });

    const [addresses, setAddresses] = useState(() => {
        const saved = localStorage.getItem('user_addresses');
        return saved ? JSON.parse(saved) : [
            { id: 1, type: 'Home', name: 'John Doe', phone: '+1 (555) 234-5678', street: '128 Broadway Ave', city: 'New York', state: 'NY', zip: '10005' },
            { id: 2, type: 'Office', name: 'John Doe (Work)', phone: '+1 (555) 987-6543', street: '450 Lexington Ave, Fl 12', city: 'New York', state: 'NY', zip: '10017' }
        ];
    });

    const [cards, setCards] = useState(() => {
        const saved = localStorage.getItem('user_cards');
        return saved ? JSON.parse(saved) : [
            { id: 1, type: 'Visa', number: '4532 7812 9012 4242', holder: username.toUpperCase(), expiry: '12/28', bank: 'Chase Premium', color: 'from-slate-900 via-indigo-950 to-slate-900' },
            { id: 2, type: 'Mastercard', number: '5412 8823 4456 9918', holder: username.toUpperCase(), expiry: '06/27', bank: 'Capital One', color: 'from-amber-600 to-red-600' }
        ];
    });

    const [security, setSecurity] = useState(() => {
        const saved = localStorage.getItem('user_security');
        return saved ? JSON.parse(saved) : {
            mfa: false,
            loginAlerts: true,
            biometrics: false
        };
    });

    const [notifPrefs, setNotifPrefs] = useState(() => {
        const saved = localStorage.getItem('user_notifications');
        return saved ? JSON.parse(saved) : {
            orderUpdates: true,
            priceDrops: true,
            promotional: false,
            newsletter: false
        };
    });

    // Address & Card Modal States
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showCardModal, setShowCardModal] = useState(false);
    const [newAddress, setNewAddress] = useState({ type: 'Home', name: '', phone: '', street: '', city: '', state: '', zip: '' });
    const [newCard, setNewCard] = useState({ type: 'Visa', number: '', holder: '', expiry: '', bank: 'Global Bank', color: 'from-blue-600 to-cyan-500' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        
        const fetchStats = async () => {
            try {
                const wlRes = await api.get('/wishlist/');
                const ordersRes = await api.get('/orders/');
                setUserStats({
                    wishlist: wlRes.data?.items?.length || 0,
                    orders: ordersRes.data?.length || 0
                });
            } catch (error) {
                console.error("Failed to fetch user stats", error);
            }
        };
        fetchStats();
    }, [isLoggedIn, navigate]);

    // Persist states
    useEffect(() => {
        localStorage.setItem('user_profile', JSON.stringify(profile));
    }, [profile]);

    useEffect(() => {
        localStorage.setItem('user_addresses', JSON.stringify(addresses));
    }, [addresses]);

    useEffect(() => {
        localStorage.setItem('user_cards', JSON.stringify(cards));
    }, [cards]);

    useEffect(() => {
        localStorage.setItem('user_security', JSON.stringify(security));
    }, [security]);

    useEffect(() => {
        localStorage.setItem('user_notifications', JSON.stringify(notifPrefs));
    }, [notifPrefs]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('user_profile', JSON.stringify(profile));
        window.dispatchEvent(new Event('profileUpdate'));
        showToast('Profile settings saved successfully!');
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast('New passwords do not match.', 'error');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            return;
        }
        showToast('Password updated successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.zip) {
            showToast('Please fill out all required fields.', 'error');
            return;
        }
        const added = { ...newAddress, id: Date.now() };
        setAddresses([...addresses, added]);
        setShowAddressModal(false);
        setNewAddress({ type: 'Home', name: '', phone: '', street: '', city: '', state: '', zip: '' });
        showToast('New address added!');
    };

    const handleDeleteAddress = (id) => {
        setAddresses(addresses.filter(a => a.id !== id));
        showToast('Address removed.');
    };

    const handleAddCard = (e) => {
        e.preventDefault();
        if (!newCard.number || !newCard.holder || !newCard.expiry) {
            showToast('Please fill out all required fields.', 'error');
            return;
        }
        // Basic format checks
        const cleanedNum = newCard.number.replace(/\s+/g, '');
        if (cleanedNum.length < 15 || cleanedNum.length > 16) {
            showToast('Invalid card number length.', 'error');
            return;
        }
        // Format with groups of 4
        const formattedNum = cleanedNum.replace(/(\d{4})/g, '$1 ').trim();

        const added = { 
            ...newCard, 
            number: formattedNum, 
            id: Date.now() 
        };
        setCards([...cards, added]);
        setShowCardModal(false);
        setNewCard({ type: 'Visa', number: '', holder: '', expiry: '', bank: 'Global Bank', color: 'from-blue-600 to-cyan-500' });
        showToast('New payment card linked!');
    };

    const handleDeleteCard = (id) => {
        setCards(cards.filter(c => c.id !== id));
        showToast('Payment card unlinked.');
    };

    const toggleSecurity = (field) => {
        setSecurity(prev => ({ ...prev, [field]: !prev[field] }));
        showToast(`${field === 'mfa' ? '2-Step Verification' : field === 'loginAlerts' ? 'Login Alerts' : 'Biometric Login'} toggled.`);
    };

    const toggleNotif = (field) => {
        setNotifPrefs(prev => ({ ...prev, [field]: !prev[field] }));
        showToast('Notification preferences updated.');
    };

    if (!isLoggedIn) return null;

    // Available Avatar Gradients
    const gradients = [
        { name: 'Indigo Dream', value: 'from-indigo-500 to-purple-600' },
        { name: 'Sunset Orange', value: 'from-orange-500 to-rose-600' },
        { name: 'Emerald Cyan', value: 'from-emerald-400 to-teal-600' },
        { name: 'Nordic Frost', value: 'from-sky-400 to-blue-600' },
        { name: 'Midnight Charcoal', value: 'from-slate-700 to-slate-900' },
        { name: 'Berry Velvet', value: 'from-fuchsia-600 to-pink-500' }
    ];

    // Card Background Gradients
    const cardGradients = [
        { name: 'Space Black', value: 'from-slate-900 via-indigo-950 to-slate-900' },
        { name: 'Corporate Blue', value: 'from-blue-600 to-cyan-500' },
        { name: 'Gold Velvet', value: 'from-amber-500 via-yellow-600 to-orange-600' },
        { name: 'Royal Crimson', value: 'from-rose-700 via-red-800 to-purple-900' },
        { name: 'Neon Forest', value: 'from-emerald-600 to-teal-800' }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-dark-950 font-sans pb-24 pt-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 border text-sm font-bold text-white ${
                                toast.type === 'error' 
                                    ? 'bg-rose-600 border-rose-500' 
                                    : 'bg-emerald-600 border-emerald-500'
                            }`}
                        >
                            <Check className="w-4 h-4" />
                            {toast.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            Account Hub
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Configure your credentials, shipping setup, and preferences.
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="self-start sm:self-center px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-extrabold rounded-2xl flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all border border-rose-100 dark:border-rose-900/20 active:scale-95"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sidebar Menu */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white/80 dark:bg-dark-800/60 backdrop-blur-md rounded-3xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center text-center relative overflow-hidden">
                            {/* Avatar Picker Widget */}
                            <div className="relative group mb-4">
                                <div className={`w-28 h-28 bg-gradient-to-tr ${profile.avatarGradient} rounded-full flex items-center justify-center text-white text-5xl font-black shadow-xl shadow-indigo-500/10 cursor-pointer transition-transform duration-300 group-hover:scale-105`}>
                                    {profile.displayName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark-900 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 cursor-pointer">
                                    <SparklesIcon className="w-4 h-4" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-2">{profile.displayName}</h2>
                            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{profile.tier}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm italic max-w-xs mb-6">"{profile.bio}"</p>

                            {/* Mini stats quickview */}
                            <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 dark:bg-dark-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                                <div className="text-center border-r border-slate-200 dark:border-slate-800">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Orders</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{userStats.orders}</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Wishlist</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-white">{userStats.wishlist}</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Menu */}
                        <div className="bg-white/80 dark:bg-dark-800/60 backdrop-blur-md rounded-3xl p-3 border border-slate-100 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                            <nav className="space-y-1">
                                {[
                                    { id: 'dashboard', label: 'Dashboard', icon: Award, desc: 'Overview & benefits' },
                                    { id: 'profile', label: 'Personal Details', icon: User, desc: 'Name, email, gradient' },
                                    { id: 'addresses', label: 'Delivery Addresses', icon: MapPin, desc: 'Manage checkout addresses' },
                                    { id: 'payments', label: 'Saved Cards', icon: CreditCard, desc: 'Link debit & credit cards' },
                                    { id: 'security', label: 'Security & Options', icon: Shield, desc: 'MFA & active sessions' }
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveTab(item.id)}
                                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all ${
                                                isActive 
                                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 dark:border-indigo-400 font-extrabold'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-900/40 hover:text-slate-900 dark:hover:text-white font-semibold'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-dark-900'}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm leading-tight">{item.label}</span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{item.desc}</span>
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'translate-x-1 text-indigo-600' : 'text-slate-400'}`} />
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Right Side Content Pane */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/80 dark:bg-dark-800/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[500px]">
                            
                            {/* OVERVIEW / DASHBOARD TAB */}
                            {activeTab === 'dashboard' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Welcome Back, {profile.displayName}!</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here is a summary of your loyalty rewards and statistics.</p>
                                    </div>

                                    {/* Loyalty Card Visual */}
                                    <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-yellow-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-orange-500/20">
                                        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100 opacity-90">Preferred Loyalty Level</span>
                                                <h4 className="text-2xl font-black tracking-wider mt-1">FLIPKO VIP PLUS</h4>
                                            </div>
                                            <Award className="w-10 h-10 text-yellow-200 animate-pulse" />
                                        </div>
                                        
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                                            <div>
                                                <p className="text-xs text-amber-100 opacity-90">Member Since</p>
                                                <p className="font-bold text-sm">May 2026</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-amber-100 opacity-90 text-right sm:text-left">Flipko Cash Earned</p>
                                                <p className="font-black text-xl text-yellow-100 text-right sm:text-left">4,250 Points</p>
                                            </div>
                                            <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-sm self-start sm:self-auto text-xs font-bold">
                                                ★ Platinum Benefits Active
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Stats Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { title: 'My Orders', value: userStats.orders, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20', desc: 'Track deliveries', path: '/orders' },
                                            { title: 'My Wishlist', value: userStats.wishlist, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20', desc: 'Saved list', path: '/wishlist' },
                                            { title: 'Linked Cards', value: cards.length, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', desc: 'Manage payment', action: () => setActiveTab('payments') },
                                            { title: 'Addresses', value: addresses.length, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', desc: 'Shipping locales', action: () => setActiveTab('addresses') },
                                        ].map((card, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={card.path ? () => navigate(card.path) : card.action}
                                                className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.03]"
                                            >
                                                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{card.title}</span>
                                                <span className={`block text-3xl font-black mt-2 ${card.color}`}>{card.value}</span>
                                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium">{card.desc}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Loyalty Perks Banner */}
                                    <div className="bg-slate-50 dark:bg-dark-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60">
                                        <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-sm uppercase tracking-widest">Active Loyalty Perks</h4>
                                        <div className="space-y-3">
                                            {[
                                                'Free express shipping on orders over $500',
                                                'Early access to weekly flash sale inventories',
                                                'Dedicated 24/7 priority customer helpline',
                                                'No-questions-asked refund processing within 7 days'
                                            ].map((perk, i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                    <span>{perk}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PERSONAL PROFILE TAB */}
                            {activeTab === 'profile' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Personal Details</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Customize your public credentials and styling.</p>
                                    </div>

                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        {/* Avatar picker gradients list */}
                                        <div>
                                            <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">Profile Theme Color</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                                                {gradients.map((g) => {
                                                    const isSelected = profile.avatarGradient === g.value;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={g.name}
                                                            onClick={() => setProfile(prev => ({ ...prev, avatarGradient: g.value }))}
                                                            className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all ${
                                                                isSelected 
                                                                    ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 scale-105' 
                                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-dark-900'
                                                            }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${g.value} shadow-md`}></div>
                                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[80px]">{g.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={profile.displayName}
                                                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Contact Email</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={profile.phone}
                                                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                                                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-semibold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Membership Status</label>
                                                <input
                                                    type="text"
                                                    value={profile.tier}
                                                    disabled
                                                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-dark-900/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl text-slate-400 dark:text-slate-500 text-sm font-bold cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">Bio / Shopping Tagline</label>
                                            <textarea
                                                rows="3"
                                                value={profile.bio}
                                                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-semibold resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
                                        >
                                            <Save className="w-4 h-4" /> Save Profile Details
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* DELIVERY ADDRESSES TAB */}
                            {activeTab === 'addresses' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Delivery Addresses</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Link your shipping information for streamlined checkouts.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAddressModal(true)}
                                            className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-extrabold rounded-2xl flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-sm active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Add Address
                                        </button>
                                    </div>

                                    {/* Address Cards Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <div 
                                                key={addr.id}
                                                className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm relative group flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            addr.type === 'Home' 
                                                                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                                                                : addr.type === 'Office'
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                            {addr.type}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                                                            title="Delete address"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <h4 className="font-extrabold text-slate-800 dark:text-white text-base">{addr.name}</h4>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{addr.street}</p>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                                                </div>
                                                <div className="border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3 text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1">
                                                    <Smartphone className="w-3.5 h-3.5" />
                                                    <span>{addr.phone}</span>
                                                </div>
                                            </div>
                                        ))}

                                        {addresses.length === 0 && (
                                            <div className="md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-500 font-bold">
                                                No saved delivery addresses found. Add one above!
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* SAVED CARDS TAB */}
                            {activeTab === 'payments' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Saved Cards</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage linked credit and debit card methods.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowCardModal(true)}
                                            className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-extrabold rounded-2xl flex items-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all text-sm active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Link New Card
                                        </button>
                                    </div>

                                    {/* Cards Row/Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {cards.map((card) => (
                                            <div 
                                                key={card.id}
                                                className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-48 border border-white/10 group hover:scale-[1.02] transition-transform`}
                                            >
                                                <div className="absolute right-4 top-4 bg-white/10 rounded-full blur-xl w-24 h-24"></div>
                                                <div className="flex justify-between items-start z-10">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-white/70">{card.bank}</span>
                                                        <h4 className="text-sm font-extrabold mt-0.5">{card.type}</h4>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteCard(card.id)}
                                                        className="text-white/60 hover:text-rose-300 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                                        title="Delete Card"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="my-auto z-10">
                                                    <span className="text-lg font-bold tracking-widest font-mono block">
                                                        {card.number}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-end z-10">
                                                    <div>
                                                        <span className="block text-[8px] font-bold text-white/60 uppercase">Card Holder</span>
                                                        <span className="text-xs font-black tracking-wide">{card.holder}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-[8px] font-bold text-white/60 uppercase">Expires</span>
                                                        <span className="text-xs font-black font-mono">{card.expiry}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {cards.length === 0 && (
                                            <div className="md:col-span-2 text-center py-12 text-slate-400 dark:text-slate-500 font-bold">
                                                No linked payment methods found. Add one above!
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* SECURITY & PRIVACY TAB */}
                            {activeTab === 'security' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Security Center</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your login credentials and security alerts.</p>
                                    </div>

                                    {/* Security Switch Toggles */}
                                    <div className="bg-slate-50 dark:bg-dark-900/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60 space-y-4">
                                        <h4 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4">Account Safeguards</h4>
                                        
                                        {[
                                            { key: 'mfa', label: '2-Step Verification', desc: 'Require a secure one-time passcode upon sign-in attempts.' },
                                            { key: 'loginAlerts', label: 'Real-time Login Notifications', desc: 'Receive instant alerts on new device configurations.' },
                                            { key: 'biometrics', label: 'Biometric Touch/Face ID Sync', desc: 'Secure local storage checkout via hardware keys.' }
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-200/40 dark:border-slate-800/60 last:border-0 last:pb-0">
                                                <div className="max-w-md">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.label}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleSecurity(item.key)}
                                                    className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 relative flex items-center ${
                                                        security[item.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                >
                                                    <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                                        security[item.key] ? 'translate-x-5.5' : 'translate-x-0'
                                                    }`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Password Change Widget */}
                                    <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
                                        <h4 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Key className="w-4 h-4 text-indigo-500" /> Modify Password
                                        </h4>
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1.5">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                        required
                                                        placeholder="••••••••"
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800/60 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1.5">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                        required
                                                        placeholder="••••••••"
                                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-slate-800/60 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-md text-xs active:scale-95 transition-all"
                                            >
                                                Update Password
                                            </button>
                                        </form>
                                    </div>

                                    {/* Active Sessions Widget */}
                                    <div className="bg-slate-50 dark:bg-dark-900/60 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/60">
                                        <h4 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-amber-500 animate-bounce" /> Active Login Sessions
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                { device: 'Windows PC • Chrome Browser', location: 'New York, USA', status: 'Active Now', ip: '192.168.1.45', current: true },
                                                { device: 'Apple iPhone 15 Pro • Safari App', location: 'London, UK', status: '2 hours ago', ip: '82.165.97.108', current: false }
                                            ].map((session, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs py-2 border-b border-slate-200/40 dark:border-slate-800/40 last:border-0 last:pb-0">
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-200">{session.device}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{session.location} • IP: {session.ip}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full font-black uppercase text-[8px] ${
                                                        session.current 
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 animate-pulse'
                                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                        {session.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>

                </div>

            </div>

            {/* ADD ADDRESS MODAL */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-dark-800 rounded-3xl p-6 w-full max-w-lg border border-slate-100 dark:border-slate-700 shadow-2xl relative"
                    >
                        <button 
                            onClick={() => setShowAddressModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Add Shipping Address</h3>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {['Home', 'Office', 'Other'].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setNewAddress(prev => ({ ...prev, type }))}
                                        className={`py-2 rounded-xl border text-xs font-black transition-all ${
                                            newAddress.type === type
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                : 'bg-slate-50 dark:bg-dark-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.name}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="+1 (555) 012-3456"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Street Address</label>
                                <input
                                    type="text"
                                    required
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="123 Main St, Apt 4B"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">State</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="NY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">ZIP Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAddress.zip}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, zip: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider"
                                >
                                    Confirm Address
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* LINK CARD MODAL */}
            {showCardModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-dark-800 rounded-3xl p-6 w-full max-w-lg border border-slate-100 dark:border-slate-700 shadow-2xl relative"
                    >
                        <button 
                            onClick={() => setShowCardModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4">Link Payment Card</h3>
                        <form onSubmit={handleAddCard} className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {['Visa', 'Mastercard'].map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => setNewCard(prev => ({ ...prev, type }))}
                                        className={`py-2 rounded-xl border text-xs font-black transition-all ${
                                            newCard.type === type
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                : 'bg-slate-50 dark:bg-dark-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Card Network Theme</label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {cardGradients.map(cg => (
                                        <button
                                            type="button"
                                            key={cg.name}
                                            onClick={() => setNewCard(prev => ({ ...prev, color: cg.value }))}
                                            className={`h-8 rounded-lg bg-gradient-to-br ${cg.value} border-2 ${
                                                newCard.color === cg.value ? 'border-indigo-600 scale-105' : 'border-transparent'
                                            }`}
                                            title={cg.name}
                                        ></button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Card Number (16 Digits)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="19"
                                    value={newCard.number}
                                    onChange={(e) => {
                                        // Auto-space format
                                        const clean = e.target.value.replace(/\D/g, '');
                                        const parts = [];
                                        for (let i = 0; i < clean.length; i += 4) {
                                            parts.push(clean.substring(i, i + 4));
                                        }
                                        setNewCard(prev => ({ ...prev, number: parts.join(' ') }));
                                    }}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono tracking-widest"
                                    placeholder="4532 7812 9012 4242"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Card Holder</label>
                                    <input
                                        type="text"
                                        required
                                        value={newCard.holder}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, holder: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="JOHN DOE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-1">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength="5"
                                        value={newCard.expiry}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length > 2) {
                                                val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                            }
                                            setNewCard(prev => ({ ...prev, expiry: val }));
                                        }}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800/80 rounded-xl text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                                        placeholder="MM/YY"
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider"
                                >
                                    Confirm Card Setup
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Internal mini component for general sparkles icon if Sparkles isn't showing properly
const SparklesIcon = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={props.className}
    >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"/>
        <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>
    </svg>
);

export default Account;
