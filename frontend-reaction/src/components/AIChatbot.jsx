import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import axios from 'axios';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "Hello! I'm Flipko Assistant. I can help you find products, track orders, or show you today's deals. What are you looking for?", 
            products: [],
            quick_replies: ["Today's Deals", "Best Mobiles", "Track My Order", "Laptops"]
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (userMessage) => {
        if (!userMessage.trim()) return;

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:8080/api/chatbot/chat/', {
                message: userMessage
            }, { withCredentials: true });

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.data.message, 
                products: response.data.products || [],
                quick_replies: response.data.quick_replies || [] 
            }]);
        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I'm having trouble connecting to the store database. Are you logged in?",
                products: [],
                quick_replies: ["Login", "Retry"]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const onFormSubmit = (e) => {
        e.preventDefault();
        handleSendMessage(inputValue);
    };

    const handleAddToCart = (e, productId) => {
        e.stopPropagation();
        dispatch(addToCart({ productId, quantity: 1 }));
        // Brief visual feedback could be added here
    };

    const clearChat = () => {
        setMessages([{ 
            role: 'assistant', 
            content: "Chat cleared! How else can I assist you?", 
            products: [],
            quick_replies: ["Today's Deals", "Best Mobiles", "Laptops"]
        }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 h-[550px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-5 flex justify-between items-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                                <svg className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.5a.5.5 0 00.636.636L7 20.662c1.47.851 3.179 1.338 5 1.338 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.455 0-2.834-.367-4.045-1.011a.5.5 0 00-.464-.02L4.05 20.15l1.181-3.441a.5.5 0 00-.064-.476A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm-3.5-9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-base tracking-tight">Flipko Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">AI Powered • Online</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <button onClick={clearChat} title="Clear Chat" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-6 bg-slate-50/30 scrollbar-thin scrollbar-thumb-slate-200">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-200/50' 
                                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                        
                                        {/* Product Suggestions */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="mt-4 grid grid-cols-1 gap-3">
                                                {msg.products.map(product => (
                                                    <div 
                                                        key={product.id}
                                                        onClick={() => { navigate(`/product/${product.id}`); setIsOpen(false); }}
                                                        className="group bg-slate-50 border border-slate-200 p-3 rounded-xl hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer flex gap-3 relative overflow-hidden"
                                                    >
                                                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg hover:bg-slate-900 transition-colors" onClick={(e) => handleAddToCart(e, product.id)}>
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                                            </div>
                                                        </div>
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.name} 
                                                            className="w-14 h-14 object-contain bg-white rounded-lg p-1 border border-slate-100"
                                                        />
                                                        <div className="flex-grow min-w-0">
                                                            <p className="text-[12px] font-bold text-slate-900 truncate group-hover:text-indigo-600">{product.name}</p>
                                                            <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">₹{product.price}</p>
                                                            <button 
                                                                className="mt-2 w-full py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                                                                onClick={(e) => handleAddToCart(e, product.id)}
                                                            >
                                                                Add to Cart
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Quick Replies from Assistant */}
                                {msg.role === 'assistant' && msg.quick_replies && msg.quick_replies.length > 0 && idx === messages.length - 1 && (
                                    <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-left-2 duration-300">
                                        {msg.quick_replies.map((reply, ridx) => (
                                            <button 
                                                key={ridx}
                                                onClick={() => handleSendMessage(reply)}
                                                className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                                            >
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-5 bg-white border-t border-slate-100 relative">
                        <form onSubmit={onFormSubmit} className="relative flex items-center">
                            <input 
                                type="text" 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Find products, track orders..."
                                className="w-full pl-5 pr-14 py-3.5 bg-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 transition-all focus:bg-white border border-transparent focus:border-indigo-100"
                            />
                            <button 
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="absolute right-2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-lg shadow-slate-200"
                            >
                                <svg className="w-5 h-5 translate-x-0.5 -translate-y-0.5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`group relative w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden ${
                    isOpen ? 'bg-slate-900 rotate-[360deg]' : 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-black'
                }`}
            >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {isOpen ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <div className="relative flex flex-col items-center">
                        <svg className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.1 21.5a.5.5 0 00.636.636L7 20.662c1.47.851 3.179 1.338 5 1.338 5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.455 0-2.834-.367-4.045-1.011a.5.5 0 00-.464-.02L4.05 20.15l1.181-3.441a.5.5 0 00-.064-.476A7.954 7.954 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm-3.5-9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm7 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-md"></div>
                    </div>
                )}
            </button>
        </div>
    );
};

export default AIChatbot;
