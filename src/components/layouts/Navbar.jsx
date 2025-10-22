import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, ChevronDown, User, Settings, Wallet, Sparkles, LogOut, Menu, X, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import onlyArtsLogo from '../../assets/onlyartslogo.png';

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
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hasChatNotification, setHasChatNotification] = useState(true);

    const mockNotifications = [
        { id: 1, type: 'like', text: 'meizzuuuuuuu liked your artwork Cosmic Dreams.', time: '2 hours ago', read: false },
        { id: 2, type: 'comment', text: 'jnorman commented on your artwork Sunset Dreams.', time: '4 hours ago', read: false },
        { id: 3, type: 'follow', text: 'artist1 started following you.', time: '1 day ago', read: true },
    ];

    const [notifications, setNotifications] = useState(mockNotifications);

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

    const handleNotificationsClick = () => {
        setShowNotifications(prev => !prev);
        if (!showNotifications) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like': return <Heart className="w-5 h-5 text-red-500" />;
            case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
            case 'follow': return <User className="w-5 h-5 text-green-500" />;
            default: return <Sparkles className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <nav className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${scrolled ? 'bg-[#1a1a1a]/95 border-white/10 shadow-lg' : 'bg-[#1a1a1a]/80 border-white/5'}`}>
            <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8">
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

                            <div className="relative">
                                <button onClick={handleNotificationsClick} className="relative p-1.5 md:p-2 text-[#f2e9dd] hover:bg-white/5 rounded-full transition-colors group">
                                    <Bell size={18} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                                    {unreadCount > 0 && (
                                        <>
                                            <span className={`absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-[#FF5F9E] rounded-full ${!showNotifications ? 'animate-ping' : ''}`}></span>
                                            <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-[#FF5F9E] rounded-full"></span>
                                        </>
                                    )}
                                </button>
                                {showNotifications && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                                        <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-xl z-50 animate-slideDown">
                                            <div className="p-3 border-b border-white/10">
                                                <h3 className="font-bold text-white">Notifications</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map(notification => (
                                                    <div key={notification.id} className={`flex items-start gap-3 p-3 border-b border-white/5 ${!notification.read ? 'bg-white/5' : ''}`}>
                                                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                                                        <div>
                                                            <p className="text-sm text-gray-200" dangerouslySetInnerHTML={{ __html: notification.text }}></p>
                                                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button onClick={handleChatClick} className="hidden sm:block relative p-1.5 md:p-2 text-[#f2e9dd] hover:bg-white/5 rounded-full transition-colors group">
                                <MessageSquare size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                {hasChatNotification && (
                                    <>
                                        <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                        <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </>
                                )}
                            </button>

                            <div className="relative">
                                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-full hover:bg-white/5 transition-colors group">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-white font-bold text-xs md:text-sm ring-2 ring-transparent group-hover:ring-[#7C5FFF]/50 transition-all">
                                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                                    </div>
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

                            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-1.5 text-[#f2e9dd] hover:bg-white/5 rounded-lg">
                                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                            </button>
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

            {showMobileMenu && isAuthenticated && (
                <div className="md:hidden border-t border-white/10 bg-[#121212] p-4 animate-slideDown">
                    <div className="space-y-2">
                        <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg">Dashboard</Link>
                        <Link to="/explore" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg">Explore</Link>
                        <Link to="/livestreams" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg">Livestreams</Link>
                        <Link to="/chat" onClick={() => { setShowMobileMenu(false); handleChatClick(); }} className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg">Messages</Link>
                        <Link to="/favorites" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg">Favorites</Link>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
            `}</style>
        </nav>
    );
};

export default Navbar;
