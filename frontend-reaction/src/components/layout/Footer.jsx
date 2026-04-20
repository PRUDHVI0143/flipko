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
        <footer className="bg-[#232f3e] text-white">
            {/* Back to top */}
            <button 
                onClick={scrollToTop}
                className="w-full bg-[#37475a] py-4 text-sm font-bold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
                <ChevronUp className="w-4 h-4" /> Back to top
            </button>

            {/* Main Footer Links */}
            <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 px-8 py-14">
                <div className="space-y-4">
                    <h4 className="font-bold text-base">Get to Know Us</h4>
                    <ul className="text-sm text-slate-300 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer">About Flipko</li>
                        <li className="hover:underline cursor-pointer">Careers</li>
                        <li className="hover:underline cursor-pointer">Press Releases</li>
                        <li className="hover:underline cursor-pointer">Corporate Responsibility</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-base">Connect with Us</h4>
                    <ul className="text-sm text-slate-300 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer flex items-center gap-2">Twitter</li>
                        <li className="hover:underline cursor-pointer flex items-center gap-2">Instagram</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-base">Make Money with Us</h4>
                    <ul className="text-sm text-slate-300 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer">Sell on Flipko</li>
                        <li className="hover:underline cursor-pointer">Supply to Flipko</li>
                        <li className="hover:underline cursor-pointer">Become an Affiliate</li>
                        <li className="hover:underline cursor-pointer">Fulfilment by Flipko</li>
                    </ul>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-base">Let Us Help You</h4>
                    <ul className="text-sm text-slate-300 space-y-2 font-medium">
                        <li className="hover:underline cursor-pointer">Your Account</li>
                        <li className="hover:underline cursor-pointer">Returns Centre</li>
                        <li className="hover:underline cursor-pointer">100% Purchase Protection</li>
                        <li className="hover:underline cursor-pointer">Help</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-700 py-10 flex flex-col items-center gap-8">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-2">
                         <Box className="w-6 h-6 text-amber-500" />
                         <span className="text-2xl font-black italic tracking-tighter">FLIPKO</span>
                    </Link>
                    <button className="flex items-center gap-2 border border-slate-500 px-4 py-2 rounded-md text-xs font-medium hover:border-white transition-all">
                        <Globe className="w-4 h-4" /> English
                    </button>
                    <div className="flex gap-2 text-xs font-bold text-slate-400">
                        <span>India</span>
                        <span>China</span>
                        <span>United Kingdom</span>
                        <span>United States</span>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <div className="flex justify-center gap-5 text-[11px] font-medium text-slate-300">
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
