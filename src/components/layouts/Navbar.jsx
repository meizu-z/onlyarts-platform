import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, ChevronDown, User, Settings, Wallet, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

// ============================================
// ONLYARTS LOGO COMPONENT (Mobile Optimized)
// ============================================
const OnlyArtsLogo = ({ size = 'md', withText = true }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 md:w-10 md:h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center gap-2 md:gap-3 group">
      {/* Pencil "O" Icon */}
      <div className={`${sizes[size]} relative flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
          {/* Pencil tip (peach/tan) */}
          <path d="M 70 15 L 85 30 L 80 35 L 65 20 Z" fill="#D4A574" />
          
          {/* Main pencil body forming "O" */}
          <defs>
            <linearGradient id="pencilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C5FFF" />
              <stop offset="50%" stopColor="#B15FFF" />
              <stop offset="100%" stopColor="#FF5F9E" />
            </linearGradient>
          </defs>
          
          {/* Outer circle of the O */}
          <circle cx="50" cy="50" r="35" fill="none" stroke="url(#pencilGradient)" strokeWidth="14" />
          
          {/* Pencil tip triangle on top */}
          <path d="M 70 15 L 85 30 L 80 35 L 65 20 Z" fill="#D4A574" />
          <path d="M 75 22 L 78 25 L 76 27 L 73 24 Z" fill="#8B6F47" />
        </svg>
      </div>
      
      {/* "only arts" text - SMALLER ON MOBILE */}
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

// ============================================
// NAVBAR COMPONENT
// ============================================
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-all duration-300 ${
      scrolled 
        ? 'bg-[#1a1a1a]/95 border-white/10 shadow-lg' 
        : 'bg-[#1a1a1a]/80 border-white/5'
    }`}>
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 md:gap-8">
            <Link to={isAuthenticated ? "/home" : "/"} className="cursor-pointer">
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

          {/* Right Side */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search - Desktop Only */}
              <div className="hidden md:block relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#f2e9dd]/50 group-focus-within:text-[#7C5FFF] transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search artists, exhibitions..."
                  className="bg-[#121212] border border-white/10 rounded-full pl-10 pr-4 py-2 w-80 text-[#f2e9dd] placeholder:text-[#f2e9dd]/40 focus:outline-none focus:border-[#7C5FFF] focus:ring-2 focus:ring-[#7C5FFF]/20 transition-all duration-200"
                />
              </div>

              {/* Notifications - SMALLER ON MOBILE */}
              <button className="relative p-1.5 md:p-2 text-[#f2e9dd] hover:bg-white/5 rounded-full transition-colors group">
                <Bell size={18} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-[#FF5F9E] rounded-full animate-ping"></span>
                <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-[#FF5F9E] rounded-full"></span>
              </button>

              {/* Messages - HIDDEN ON SMALL MOBILE */}
              <button className="hidden sm:block p-1.5 md:p-2 text-[#f2e9dd] hover:bg-white/5 rounded-full transition-colors group">
                <MessageSquare size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
              </button>

              {/* User Menu - SMALLER ON MOBILE */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-full hover:bg-white/5 transition-colors group"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-white font-bold text-xs md:text-sm ring-2 ring-transparent group-hover:ring-[#7C5FFF]/50 transition-all">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline text-sm md:text-base text-[#f2e9dd]">@{user?.username}</span>
                  <ChevronDown size={14} className={`hidden sm:block md:w-4 md:h-4 text-[#f2e9dd] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
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
                      
                      <Link
                        to={`/profile/${user?.username}`}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group"
                      >
                        <User size={18} className="group-hover:scale-110 transition-transform" /> My Profile
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group"
                      >
                        <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" /> Settings
                      </Link>
                      
                      <Link
                        to="/wallet"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-[#f2e9dd] hover:bg-white/5 flex items-center gap-2 transition-colors group"
                      >
                        <Wallet size={18} className="group-hover:scale-110 transition-transform" /> Wallet
                      </Link>
                      
                      <div className="border-t border-white/10">
                        <Link
                          to="/subscriptions"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-3 text-left text-[#B15FFF] hover:bg-[#7C5FFF]/10 flex items-center gap-2 transition-colors group"
                        >
                          <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /> Upgrade Plan
                        </Link>
                      </div>
                      
                      <div className="border-t border-white/10">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors group"
                        >
                          <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Log Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-1.5 text-[#f2e9dd] hover:bg-white/5 rounded-lg"
              >
                {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/explore">
                <Button variant="ghost" className="text-sm md:text-base px-3 md:px-4">Explore</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="text-sm md:text-base px-3 md:px-4">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] hover:shadow-lg hover:shadow-[#7C5FFF]/30 transition-all text-sm md:text-base px-3 md:px-4">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && isAuthenticated && (
        <div className="md:hidden border-t border-white/10 bg-[#121212] p-4 animate-slideDown">
          <div className="space-y-2">
            <Link
              to="/home"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg"
            >
              Explore
            </Link>
            <Link
              to="/livestreams"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg"
            >
              Livestreams
            </Link>
            <Link
              to="/favorites"
              onClick={() => setShowMobileMenu(false)}
              className="block px-4 py-3 text-[#f2e9dd] hover:bg-white/5 rounded-lg"
            >
              Favorites
            </Link>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;