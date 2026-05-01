import React from 'react';
import { 
    Globe, 
    ChevronUp,
    Box
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-amber-50 dark:bg-dark-950 text-orange-900 dark:text-white transition-colors duration-300 border-t border-orange-100 dark:border-white/5">
            {/* Back to top */}
            <button 
                onClick={scrollToTop}
                className="w-full bg-orange-100 dark:bg-dark-900 py-4 text-sm font-bold text-orange-800 dark:text-white hover:bg-orange-200 dark:hover:bg-dark-800 transition-colors flex items-center justify-center gap-2"
            >
                <ChevronUp className="w-4 h-4" /> Back to top
            </button>

            {/* Main Footer Links */}
            <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 px-8 py-14">
                <div className="space-y-4">
                    <h4 className="font-bold text-base text-orange-950 dark:text-white">Get to Know Us</h4>
                    <ul className="text-sm text-orange-800/80 dark:text-slate-400 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer">About Flipko</li>
                        <li className="hover:underline cursor-pointer">Careers</li>
                        <li className="hover:underline cursor-pointer">Press Releases</li>
                        <li className="hover:underline cursor-pointer">Corporate Responsibility</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-base text-orange-950 dark:text-white">Connect with Us</h4>
                    <ul className="text-sm text-orange-800/80 dark:text-slate-400 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer flex items-center gap-2">Twitter</li>
                        <li className="hover:underline cursor-pointer flex items-center gap-2">Instagram</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-base text-orange-950 dark:text-white">Make Money with Us</h4>
                    <ul className="text-sm text-orange-800/80 dark:text-slate-400 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer">Sell on Flipko</li>
                        <li className="hover:underline cursor-pointer">Supply to Flipko</li>
                        <li className="hover:underline cursor-pointer">Become an Affiliate</li>
                        <li className="hover:underline cursor-pointer">Fulfilment by Flipko</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-base text-orange-950 dark:text-white">Let Us Help You</h4>
                    <ul className="text-sm text-orange-800/80 dark:text-slate-400 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer">Your Account</li>
                        <li className="hover:underline cursor-pointer">Returns Centre</li>
                        <li className="hover:underline cursor-pointer">100% Purchase Protection</li>
                        <li className="hover:underline cursor-pointer">Help</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-200 dark:border-white/10 py-10 flex flex-col items-center gap-8">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <Link to="/" className="flex items-center gap-2">
                         <Box className="w-6 h-6 text-amber-500" />
                         <span className="text-2xl font-black italic tracking-tighter text-slate-900 dark:text-white">FLIPKO</span>
                    </Link>
                    <button className="flex items-center gap-2 border border-slate-300 dark:border-slate-500 px-4 py-2 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-white transition-all">
                        <Globe className="w-4 h-4 text-indigo-500" /> English
                    </button>
                    <div className="flex gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>India</span>
                        <span>China</span>
                        <span>UK</span>
                        <span>USA</span>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <div className="flex flex-col md:flex-row justify-center gap-5 text-[11px] font-medium text-slate-500 dark:text-slate-500">
                        <span className="hover:underline cursor-pointer">Conditions of Use</span>
                        <span className="hover:underline cursor-pointer">Privacy Notice</span>
                        <span className="hover:underline cursor-pointer">Ads Privacy Choices</span>
                        <span>© 1996-2026, Flipko.com, Inc. or its affiliates</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
