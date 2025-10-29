import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, MessageCircle, Star, Tv, Menu, X, Palette, Video, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomNavItem = ({ to, icon: Icon, label, badge }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={`
        flex flex-col items-center justify-center flex-1 py-2
        transition-all duration-300 ease-out
        ${isActive ? 'text-[#7C5FFF]' : 'text-gray-400'}
      `}
    >
      <div className={`
        relative transition-all duration-300
        ${isActive ? 'scale-110' : 'scale-100'}
      `}>
        <Icon size={24} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {isActive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#7C5FFF] rounded-full" />
        )}
      </div>
      <span className={`
        text-xs mt-1 font-medium
        ${isActive ? 'text-[#7C5FFF]' : 'text-gray-400'}
      `}>
        {label}
      </span>
    </NavLink>
  );
};

const BottomNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          <BottomNavItem to="/dashboard" icon={Home} label="Feed" />
          <BottomNavItem to="/explore" icon={Compass} label="Explore" />
          <BottomNavItem to="/chat" icon={MessageCircle} label="Chat" />
          <BottomNavItem to="/livestreams" icon={Tv} label="Live" />
          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-400"
          >
            <Menu size={24} />
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
        </div>

        <style>{`
          @supports (padding-bottom: env(safe-area-inset-bottom)) {
            .safe-area-pb {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        `}</style>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl border-t border-white/10 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-[#f2e9dd]">More</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              <NavLink
                to="/favorites"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#f2e9dd]"
              >
                <Star size={20} />
                <span className="font-medium">Favorites</span>
              </NavLink>

              <NavLink
                to="/exhibition"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#f2e9dd]"
              >
                <Palette size={20} />
                <span className="font-medium">Exhibitions</span>
              </NavLink>

              <NavLink
                to="/create-artwork"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#f2e9dd]"
              >
                <Palette size={20} />
                <span className="font-medium">Create Artwork</span>
              </NavLink>

              <NavLink
                to="/start-live"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#f2e9dd]"
              >
                <Video size={20} />
                <span className="font-medium">Start Livestream</span>
              </NavLink>

              <NavLink
                to="/request-commission"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#f2e9dd]"
              >
                <Briefcase size={20} />
                <span className="font-medium">Request Commission</span>
              </NavLink>

              <NavLink
                to="/consultations"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-[#f2e9dd]"
              >
                <MessageCircle size={20} />
                <span className="font-medium">Consultations</span>
              </NavLink>

              <NavLink
                to="/subscriptions"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-500/10 transition-colors text-purple-400"
              >
                <Star size={20} />
                <span className="font-medium">Upgrade Plan</span>
              </NavLink>
            </div>

            {/* Safe area padding for devices with notch */}
            <div className="h-[env(safe-area-inset-bottom)]"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default BottomNav;
