import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Tv, Star, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const BottomNavItem = ({ to, icon: Icon, label }) => {
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        <BottomNavItem to="/dashboard" icon={Home} label="Feed" />
        <BottomNavItem to="/explore" icon={Compass} label="Explore" />
        <BottomNavItem to="/livestreams" icon={Tv} label="Live" />
        <BottomNavItem to="/favorites" icon={Star} label="Favorites" />
        <BottomNavItem to={`/portfolio/${user?.username}`} icon={User} label="Profile" />
      </div>

      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-pb {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
