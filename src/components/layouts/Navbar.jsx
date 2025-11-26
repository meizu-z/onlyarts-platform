import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, ChevronDown, User, Settings, Wallet, Sparkles, LogOut, Menu, X, Heart, MessageCircle, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../ui/Toast';
import Button from '../common/Button';
import NotificationDropdown from '../common/NotificationDropdown';
import onlyArtsLogo from '../../assets/onlyartslogo.png';
import { API_CONFIG } from '../../config/api.config';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const serverBaseUrl = API_CONFIG.baseURL.replace('/api', '');
  return `${serverBaseUrl}${imagePath}`;
};

const OnlyArtsLogo = ({ size = 'md', withText = true }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8 md:w-10 md:h-10',
        lg: 'w-16 h-16',
    };
    return (
        <div className="flex items-center gap-2 md:gap-3 group">
            <div className={`${sizes[size]} relative flex-shrink-0`}>
                <img src={onlyArtsLogo} alt="OnlyArts Logo" className="w-full h-full transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
            </div>
            {withText && (
                <div className="text-lg md:text-2xl font-bold text-[#7C5FFF] flex items-center gap-1" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive' }}>
                    <span className="relative">
                        only
                        <svg className="absolute -bottom-1 left-0 w-full h-2 hidden md:block" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M 0 5 Q 25 0 50 5 T 100 5" stroke="#FF5F9E" strokeWidth="2" fill="none" />
                        </svg>
                    </span>
                    <span className="text-[#FF5F9E]">arts</span>
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartItems, removeFromCart, clearCart } = useCart(); // Destructure removeFromCart and clearCart
    const navigate = useNavigate();
    const toast = useToast();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false); // New state for cart dropdown
    const [scrolled, setScrolled] = useState(false);
    const [hasChatNotification, setHasChatNotification] = useState(true);
    const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/landing');
        setShowUserMenu(false);
    };

    const handleChatClick = () => {
        setHasChatNotification(false);
        navigate('/chat');
    };

    // Toggle cart dropdown instead of navigating
    const handleCartClick = () => {
        setShowCartDropdown(prev => !prev);
        // If the cart dropdown is about to be shown, close other dropdowns
        if (!showCartDropdown) {
            setShowUserMenu(false);
        }
    };

    const calculateCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleBuyNow = async () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        const total = calculateCartTotal();
        const tax = Math.round(total * 0.1);
        const shipping = 500;
        const grandTotal = total + tax + shipping;

        const confirmed = window.confirm(
            `Buy all ${cartItems.length} item(s) for ₱${grandTotal.toLocaleString()}?\n\nThis will use your default payment method.`
        );

        if (confirmed) {
            setIsProcessingPurchase(true);
            toast.info('Processing purchase...');

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Purchase successful! 🎉 Your artworks will be delivered shortly.');
            clearCart();
            setShowCartDropdown(false);
            setIsProcessingPurchase(false);
        }
    };

    return (
        <nav className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${scrolled ? 'bg-[#1a1a1a]/95 shadow-lg dark:shadow-black/20' : 'bg-[#1a1a1a]/80 dark:shadow-black/10'} dark:bg-[#1a1a1a]/95 light:bg-white/95 light:shadow-gray-200/50`}>
            {/* Gradient border bottom - stylish fade effect */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/10 light:via-[#7C5FFF]/30" />
            <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 md:ml-20">
                <div className="flex items-center justify-between h-14 md:h-16">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Link to={isAuthenticated ? "/dashboard" : "/"} className="cursor-pointer">
                            <OnlyArtsLogo size="md" withText={true} />
                        </Link>
                        {isAuthenticated && (
                            <div className="hidden md:flex items-center gap-1">
                                <Link to="/explore" className="px-4 py-2 text-[#f2e9dd]/70 hover:text-[#f2e9dd] transition-colors rounded-lg hover:bg-white/5">
                                    Explore
                                </Link>
                                <Link to="/livestreams" className="relative px-4 py-2 text-[#f2e9dd]/70 hover:text-[#f2e9dd] transition-colors rounded-lg hover:bg-white/5">
                                    Live
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-2 md:gap-4">
                            <div className="hidden md:block relative group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#f2e9dd]/50 group-focus-within:text-[#7C5FFF] transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search artists, exhibitions..."
                                    className="bg-[#121212] border border-white/10 rounded-full pl-10 pr-4 py-2 w-80 text-[#f2e9dd] placeholder:text-[#f2e9dd]/40 focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 transition-all duration-200"
                                />
                            </div>

                            <NotificationDropdown />

                            <button onClick={handleChatClick} className="hidden sm:block relative p-1.5 md:p-2 text-[#f2e9dd] hover:bg-white/5 rounded-full transition-colors group">
                                <MessageSquare size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                {hasChatNotification && (
                                    <>
                                        <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                        <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </>
                                )}
                            </button>

                            {/* Cart Dropdown */} 
                            <div className="relative">
                                <button onClick={handleCartClick} className="hidden sm:block relative p-1.5 md:p-2 text-[#f2e9dd] hover:bg-white/5 rounded-full transition-colors group">
                                    <ShoppingCart size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                    {cartItems.length > 0 && (
                                        <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </button>

                                {showCartDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowCartDropdown(false)}></div>
                                        <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-xl z-50 animate-slideDown">
                                            <div className="p-3 border-b border-white/10">
                                                <h3 className="font-bold text-white">Your Cart ({cartItems.length})</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                                {cartItems.length > 0 ? (
                                                    cartItems.map(item => (
                                                        <div key={item.id} className="flex items-center gap-3 p-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                                                                {(item.artwork?.imageUrl || item.imageUrl) ? (
                                                                    <img
                                                                        src={`http://localhost:5000${item.artwork?.imageUrl || item.imageUrl}`}
                                                                        alt={item.artwork?.title || item.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-2xl">{item.artwork?.image || item.image || '🎨'}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <p className="text-sm text-gray-200 font-semibold truncate">
                                                                    {item.artwork?.title || item.title || item.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {item.artwork?.artistName || item.artistName || 'Unknown Artist'}
                                                                </p>
                                                                <p className="text-xs text-green-400 font-semibold">
                                                                    ₱{item.price.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                                title="Remove from cart"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="p-4 text-sm text-gray-400 text-center">Your cart is empty.</p>
                                                )}
                                            </div>
                                            {cartItems.length > 0 && (
                                                <div className="p-3 border-t border-white/10">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-gray-400 text-sm">Subtotal:</span>
                                                        <span className="text-white text-sm">₱{calculateCartTotal().toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-gray-400 text-sm">Tax (10%):</span>
                                                        <span className="text-white text-sm">₱{Math.round(calculateCartTotal() * 0.1).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                                                        <span className="text-gray-400 text-sm">Shipping:</span>
                                                        <span className="text-white text-sm">₱500</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-white font-bold">Total:</span>
                                                        <span className="text-white font-bold">₱{(calculateCartTotal() + Math.round(calculateCartTotal() * 0.1) + 500).toLocaleString()}</span>
                                                    </div>
                                                    <Button
                                                        onClick={handleBuyNow}
                                                        disabled={isProcessingPurchase}
                                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 transition-all font-bold flex items-center justify-center gap-2"
                                                    >
                                                        <ShoppingBag size={18} />
                                                        {isProcessingPurchase ? 'Processing...' : 'Buy Now'}
                                                    </Button>
                                                    <button
                                                        onClick={() => { navigate('/cart'); setShowCartDropdown(false); }}
                                                        className="w-full mt-2 text-[#f2e9dd]/60 hover:text-[#f2e9dd] text-sm transition-colors py-2"
                                                    >
                                                        View Cart Details
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    if (!showUserMenu) {
                                        setShowCartDropdown(false);
                                    }
                                }} className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-full hover:bg-white/5 transition-colors group">
                                    {getImageUrl(user?.profileImage || user?.profile_image) ? (
                                        <img
                                            src={getImageUrl(user?.profileImage || user?.profile_image)}
                                            alt={user.username}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#7C5FFF]/50 transition-all"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-white font-bold text-xs md:text-sm ring-2 ring-transparent group-hover:ring-[#7C5FFF]/50 transition-all">
                                            {user?.username?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="hidden sm:inline text-sm md:text-base text-[#f2e9dd]">@{user?.username}</span>
                                    <ChevronDown size={14} className={`hidden sm:block md:w-4 md:h-4 text-[#f2e9dd] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>
                                {showUserMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                        <div className="absolute right-0 mt-2 w-64 bg-[#121212] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-slideDown">
                                            <div className="p-4 border-b border-white/10 bg-gradient-to-br from-[#7C5FFF]/10 to-[#FF5F9E]/10">
                                                <p className="font-bold text-[#f2e9dd]">@{user?.username}</p>
                                                <p className="text-sm text-[#f2e9dd]/50">{user?.email}</p>
                                                {user?.subscription && (
                                                    <span className="inline-block mt-2 px-2 py-1 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 rounded-full text-xs text-[#B15FFF] capitalize">
                                                        {user.subscription} Member
                                                    </span>
                                                )}
                                            </div>
                                            <Link to={`/portfolio/${user?.username}`} onClick={() => setShowUserMenu(false)} className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group">
                                                <User size={18} className="group-hover:scale-110 transition-transform" /> My Profile
                                            </Link>
                                            {/* Cart - only show on mobile/tablet, hidden on desktop since cart icon is in navbar */}
                                            <Link to="/cart" onClick={() => setShowUserMenu(false)} className="md:hidden w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group">
                                                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                                                <span className="flex-1">Cart</span>
                                                {cartItems.length > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                        {cartItems.length}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link to="/orders" onClick={() => setShowUserMenu(false)} className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group">
                                                <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" /> My Orders
                                            </Link>
                                            <div className="border-t border-white/10"></div>
                                            <Link to="/settings" onClick={() => setShowUserMenu(false)} className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group">
                                                <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Settings
                                            </Link>
                                            <Link to="/wallet" onClick={() => setShowUserMenu(false)} className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group">
                                                <Wallet size={18} className="group-hover:scale-110 transition-transform" /> Wallet
                                            </Link>
                                            <div className="border-t border-white/10">
                                                <Link to="/subscriptions" onClick={() => setShowUserMenu(false)} className="w-full px-4 py-3 text-left text-[#B15FFF] hover:bg-[#7C5FFF]/10 flex items-center gap-2 transition-colors group">
                                                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /> Upgrade Plan
                                                </Link>
                                            </div>
                                            <div className="border-t border-white/10">
                                                <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors group">
                                                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Log Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 md:gap-4">
                            <Link to="/explore"><Button variant="ghost" className="text-sm md:text-base px-3 md:px-4">Explore</Button></Link>
                            <Link to="/login"><Button variant="ghost" className="text-sm md:text-base px-3 md:px-4">Login</Button></Link>
                            <Link to="/register"><Button className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] hover:shadow-lg hover:shadow-[#7C5FFF]/30 transition-all text-sm md:text-base px-3 md:px-4">Get Started</Button></Link>
                        </div>
                    )}
                </div>
            </div>


            <style>{`
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a4a4a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5a5a5a; }
            `}</style>
        </nav>
    );
};

export default Navbar;
