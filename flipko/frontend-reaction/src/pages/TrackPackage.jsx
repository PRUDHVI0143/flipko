import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, CheckCircle2, Truck, MapPin, Clock, ArrowLeft,
    Home, Star, Phone, Calendar, AlertCircle, Navigation
} from 'lucide-react';
import api from '../api/axios';

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const truckIcon = L.divIcon({
    className: '',
    html: `<div style="background:#f59e0b;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 15px rgba(245,158,11,0.6);font-size:18px;">🚚</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const warehouseIcon = L.divIcon({
    className: '',
    html: `<div style="background:#6366f1;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 15px rgba(99,102,241,0.5);font-size:16px;">🏭</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const homeIcon = L.divIcon({
    className: '',
    html: `<div style="background:#10b981;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 15px rgba(16,185,129,0.5);font-size:16px;">🏠</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

// Smoothly pan map to position
function MapAnimator({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.panTo(position, { animate: true, duration: 1 });
    }, [position, map]);
    return null;
}

// Interpolate between two lat/lng points
function lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Generate a random FLK tracking ID
function genTrackingId() {
    return 'FLK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
}

const STATUSES = [
    { label: 'Order Confirmed',    icon: CheckCircle2, color: 'emerald', desc: 'Your order has been confirmed and is being prepared.' },
    { label: 'Packed & Dispatched',icon: Package,      color: 'indigo',  desc: 'Order packed and dispatched from fulfillment center.' },
    { label: 'In Transit',         icon: Truck,        color: 'amber',   desc: 'Your package is on the way to the sorting hub.' },
    { label: 'Out for Delivery',   icon: Navigation,   color: 'orange',  desc: 'Your package is out for delivery. Expect it today!' },
    { label: 'Delivered',          icon: Home,         color: 'green',   desc: 'Package delivered successfully. Enjoy your order!' },
];

export default function TrackPackage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const trackingId = useRef(genTrackingId()).current;

    const [route, setRoute] = useState(null);
    const [step, setStep] = useState(0);       // current route checkpoint index
    const [progress, setProgress] = useState(0); // 0..1 between step and step+1
    const [truckPos, setTruckPos] = useState([19.076, 72.877]); // Default Mumbai

    // Total duration for the delivery simulation: 2 days (48 hours) in real time
    const TOTAL_DURATION = 2 * 24 * 60 * 60 * 1000; 

    // Fetch order
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${orderId}/`);
                setOrder(res.data);
            } catch { setOrder(null); }
            finally { setLoading(false); }
        };
        if (orderId) fetchOrder();
        else setLoading(false);
    }, [orderId]);

    // Build dynamic route based on destination city
    useEffect(() => {
        if (!order) return;

        const setupRoute = async () => {
            let destCoords = { lat: 12.972, lng: 77.594 }; // Fallback to Bengaluru
            try {
                // First try Pincode - this is the most accurate way to pin the exact neighborhood in OSM
                let query = encodeURIComponent(`${order.pincode}, India`);
                let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                let data = await res.json();
                
                // If Pincode fails, try full address
                if (!data || data.length === 0) {
                    query = encodeURIComponent(`${order.address}, ${order.city}, ${order.state || ''}, India`);
                    res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                    data = await res.json();
                }

                // If full address fails, fallback to just City and State
                if (!data || data.length === 0) {
                    query = encodeURIComponent(`${order.city}, ${order.state || ''}, India`);
                    res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                    data = await res.json();
                }

                if (data && data.length > 0) {
                    destCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                }
            } catch (e) {
                console.error("Geocoding failed", e);
            }

            const start = { lat: 19.076, lng: 72.877, label: 'Mumbai Fulfillment Center', type: 'warehouse' };
            const end = { lat: destCoords.lat, lng: destCoords.lng, label: `Home Delivery: ${order.address}`, type: 'home' };
            
            // Add intermediate transit hubs to make the journey realistic
            const p1 = {
                lat: start.lat + (end.lat - start.lat) * 0.33,
                lng: start.lng + (end.lng - start.lng) * 0.33,
                label: 'National Transit Hub',
                type: 'hub'
            };
            const p2 = {
                lat: start.lat + (end.lat - start.lat) * 0.66,
                lng: start.lng + (end.lng - start.lng) * 0.66,
                label: `${order.state || 'Regional'} Sorting Facility`,
                type: 'hub'
            };

            setRoute([start, p1, p2, end]);
            setTruckPos([start.lat, start.lng]);
        };

        setupRoute();
    }, [order]);

    // Simulate live movement based on real elapsed time
    useEffect(() => {
        if (!route) return;

        // Get placedAt from localStorage or use current time as fallback
        const orderMeta = JSON.parse(localStorage.getItem('flipko_order_meta') || '{}')[orderId] || {};
        const placedAt = orderMeta.placedAt || new Date(order?.created_at).getTime() || Date.now();

        let animFrame;
        const animate = () => {
            const now = Date.now();
            let elapsed = now - placedAt;
            if (elapsed < 0) elapsed = 0;

            let tTotal = Math.min(elapsed / TOTAL_DURATION, 1);
            const numSegments = route.length - 1;
            const segmentT = tTotal * numSegments;

            const currentStep = Math.min(Math.floor(segmentT), numSegments - 1);
            const tSegment = segmentT - currentStep;

            setStep(currentStep);
            setProgress(tSegment);

            const from = [route[currentStep].lat, route[currentStep].lng];
            const to = [route[currentStep + 1].lat, route[currentStep + 1].lng];
            setTruckPos(lerp(from, to, tSegment));

            if (tTotal < 1) {
                animFrame = requestAnimationFrame(animate);
            }
        };

        animFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animFrame);
    }, [route, order, orderId]);

    const statusIdx = Math.min(step + 1, STATUSES.length - 1);

    const eta = new Date();
    eta.setDate(eta.getDate() + 2);
    const etaStr = eta.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
        </div>
    );

    if (!route) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-500 animate-bounce" />
                <span className="font-bold text-slate-500">Locating destination...</span>
            </div>
        </div>
    );

    const polylinePoints = route.map(r => [r.lat, r.lng]);
    const travelledPoints = [
        ...route.slice(0, step + 1).map(r => [r.lat, r.lng]),
        truckPos,
    ];

    return (
        <div className="min-h-screen bg-transparent dark:bg-dark-900 pb-20">
            <div className="max-w-[1100px] mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/orders')} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Track Package</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                            Tracking ID: <span className="font-black text-amber-500">{trackingId}</span>
                        </p>
                    </div>
                </div>

                {/* Live Status Banner */}
                <motion.div
                    key={statusIdx}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl p-5 flex items-center gap-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30"
                >
                    <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-400/30">
                        <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="font-black text-amber-700 dark:text-amber-400 text-lg">{STATUSES[statusIdx].label}</p>
                        <p className="text-amber-600 dark:text-amber-500 text-sm font-medium">{STATUSES[statusIdx].desc}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Est. Delivery</p>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{etaStr}</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* LEFT: Map */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-dark-800 rounded-[28px] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700">
                            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                                <h2 className="font-black text-slate-800 dark:text-white text-lg">Live Location</h2>
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                                    LIVE
                                </span>
                            </div>
                            <div style={{ height: '400px', width: '100%' }}>
                                <MapContainer
                                    center={truckPos}
                                    zoom={6}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {/* Full route (grey) */}
                                    <Polyline positions={polylinePoints} color="#cbd5e1" weight={3} dashArray="8 6" />
                                    {/* Travelled route (amber) */}
                                    <Polyline positions={travelledPoints} color="#f59e0b" weight={4} />
                                    {/* Warehouse */}
                                    <Marker position={[route[0].lat, route[0].lng]} icon={warehouseIcon}>
                                        <Popup><strong>📦 {route[0].label}</strong><br />Origin warehouse</Popup>
                                    </Marker>
                                    {/* Destination */}
                                    <Marker position={[route[route.length-1].lat, route[route.length-1].lng]} icon={homeIcon}>
                                        <Popup><strong>🏠 {route[route.length-1].label}</strong><br />Delivery destination</Popup>
                                    </Marker>
                                    {/* Truck */}
                                    <Marker position={truckPos} icon={truckIcon}>
                                        <Popup><strong>🚚 Your Package</strong><br />{STATUSES[statusIdx].label}</Popup>
                                    </Marker>
                                    <MapAnimator position={truckPos} />
                                </MapContainer>
                            </div>
                            {/* Current location label */}
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Location</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {step < route.length - 1
                                            ? `En route: ${route[step].label} → ${route[step+1].label}`
                                            : route[route.length-1].label}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Details Card */}
                        {order && (
                            <div className="bg-white dark:bg-dark-800 rounded-[28px] p-6 shadow-xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700">
                                <h2 className="font-black text-slate-800 dark:text-white text-lg mb-5">Order Details</h2>
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Order ID</p>
                                        <p className="font-black text-slate-800 dark:text-white">#{order.id}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Total</p>
                                        <p className="font-black text-slate-800 dark:text-white">₹{Number(order.total_amount).toFixed(2)}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Ship To</p>
                                        <p className="font-black text-slate-800 dark:text-white">{order.first_name} {order.last_name}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Payment</p>
                                        <p className="font-black text-emerald-600 dark:text-emerald-400">Cash on Delivery</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-dark-900 rounded-2xl p-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Delivery Address</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300">{order.address}, {order.city}, {order.state} — {order.pincode}</p>
                                </div>

                                {/* Items */}
                                {order.items?.length > 0 && (
                                    <div className="mt-5 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Items in this order</p>
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-dark-900 rounded-2xl p-3">
                                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.product?.image?.includes('://') ? item.product.image : `http://127.0.0.1:8000${item.product?.image}`}
                                                        alt={item.product?.name}
                                                        className="w-full h-full object-contain"
                                                        onError={e => { e.target.src='https://placehold.co/100'; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{item.product?.name || item.product_name || 'Product'}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">Qty: {item.quantity} · ₹{item.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Tracking Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-dark-800 rounded-[28px] p-6 shadow-2xl shadow-slate-200/50 dark:shadow-dark-900/50 border border-slate-100 dark:border-slate-700 sticky top-28">
                            <h2 className="font-black text-slate-800 dark:text-white text-lg mb-6">Tracking Timeline</h2>
                            <div className="relative">
                                {/* vertical line */}
                                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-dark-700" />

                                <div className="space-y-0">
                                    {STATUSES.map((s, i) => {
                                        const done = i <= statusIdx;
                                        const active = i === statusIdx;
                                        const Icon = s.icon;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className={`relative flex gap-4 pb-8 last:pb-0`}
                                            >
                                                {/* Circle */}
                                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                                                    active ? 'bg-amber-400 shadow-lg shadow-amber-400/40 scale-110' :
                                                    done  ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' :
                                                    'bg-slate-100 dark:bg-dark-700'
                                                }`}>
                                                    {active && (
                                                        <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-50" />
                                                    )}
                                                    <Icon className={`w-4 h-4 ${active || done ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="pt-1.5 flex-1">
                                                    <p className={`font-black text-sm ${active ? 'text-amber-600 dark:text-amber-400' : done ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'}`}>
                                                        {s.label}
                                                    </p>
                                                    {(done || active) && (
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{s.desc}</p>
                                                    )}
                                                    {active && (
                                                        <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                                                            In Progress
                                                        </span>
                                                    )}
                                                    {done && !active && (
                                                        <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">✓ Done</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Route checkpoints */}
                            <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Route Checkpoints</p>
                                <div className="space-y-3">
                                    {route.map((r, i) => (
                                        <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i <= step ? 'opacity-100' : 'opacity-30'}`}>
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${i <= step ? 'bg-amber-400' : 'bg-slate-200 dark:bg-dark-600'}`} />
                                            <span className={`font-bold ${i === step ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>{r.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact support */}
                            <div className="mt-6 bg-slate-50 dark:bg-dark-900 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-700 dark:text-slate-200 text-sm">Need help?</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Call 1800-123-4567 (Free)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
