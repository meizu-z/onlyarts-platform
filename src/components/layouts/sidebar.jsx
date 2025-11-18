import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Tv, Star, User, Settings, Wallet, Sparkles, ShoppingBag, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon, children, isHovered }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={`
        group relative flex items-center
        text-base font-medium transition-all duration-200 ease-out
        ${isHovered ? 'px-4 py-3' : 'px-3 py-3 justify-center'}
        ${isActive
          ? 'bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#7C5FFF] to-[#FF5F9E] rounded-r-full" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 transition-all duration-200 ease-out ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>

      {/* Text - only show when hovered */}
      <span
        className={`whitespace-nowrap transition-all duration-200 ease-out overflow-hidden
        ${isHovered
          ? 'w-auto opacity-100 ml-4'
          : 'w-0 opacity-0 ml-0'
        }`}
      >
        {children}
      </span>

      {/* Tooltip for collapsed state */}
      {!isHovered && (
        <div className="absolute left-full ml-6 px-3 py-2 bg-[#2a2a35] text-white text-sm rounded-lg
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-all duration-200 ease-out
                      shadow-xl border border-white/10 whitespace-nowrap z-50">
          {children}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-[-1px]
                        w-0 h-0 border-t-[6px] border-t-transparent
                        border-r-[6px] border-r-[#2a2a35]
                        border-b-[6px] border-b-transparent" />
        </div>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        hidden md:flex flex-col
        bg-gradient-to-b from-[#1a1a1a] to-[#121212]
        border-r border-white/10 backdrop-blur-xl
        transition-all duration-200 ease-out
        ${isHovered ? 'w-64' : 'w-20'}
        fixed top-16 left-0 bottom-0 z-40
      `}
    >
      {/* Navigation - no logo section */}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-6"
           style={{ scrollbarWidth: 'thin', scrollbarColor: '#7C5FFF #1a1a1a' }}>
        <nav className="space-y-1">
          {/* Main Menu Section */}
          <div className="mb-8">
            <p className={`px-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest
                        transition-all duration-200 ease-out overflow-hidden
                        ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0 mb-0'}`}>
              Menu
            </p>
            <div className="space-y-1">
              <NavItem to="/dashboard" icon={<Home size={20} />} isHovered={isHovered}>Feed</NavItem>
              <NavItem to="/explore" icon={<Compass size={20} />} isHovered={isHovered}>Explore</NavItem>
              <NavItem to="/livestreams" icon={<Tv size={20} />} isHovered={isHovered}>Livestreams</NavItem>
              {user?.role !== 'artist' && user?.role !== 'admin' && (
                <NavItem to="/create-artist" icon={<Sparkles size={20} />} isHovered={isHovered}>Be an Artist</NavItem>
              )}
              <NavItem to="/favorites" icon={<Star size={20} />} isHovered={isHovered}>Favorites</NavItem>
            </div>
          </div>

          {/* Divider */}
          <div className={`transition-all duration-200 ease-out overflow-hidden
                        ${isHovered ? 'h-px mb-6' : 'h-0 my-0'}
                        bg-gradient-to-r from-transparent via-white/10 to-transparent`} />

          {/* Admin Section - Only for admin users */}
          {user?.role === 'admin' && (
            <div className="mb-8">
              <p className={`px-4 mb-4 text-xs font-bold text-red-400 uppercase tracking-widest
                          transition-all duration-200 ease-out overflow-hidden
                          ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0 mb-0'}`}>
                Admin
              </p>
              <div className="space-y-1">
                <NavItem to="/admin" icon={<Shield size={20} />} isHovered={isHovered}>Admin Dashboard</NavItem>
              </div>
            </div>
          )}

          {/* Divider after admin section */}
          {user?.role === 'admin' && (
            <div className={`transition-all duration-200 ease-out overflow-hidden
                          ${isHovered ? 'h-px mb-6' : 'h-0 my-0'}
                          bg-gradient-to-r from-transparent via-white/10 to-transparent`} />
          )}

          {/* Account Section */}
          <div className="mt-2">
            <p className={`px-4 mb-4 mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest
                        transition-all duration-200 ease-out overflow-hidden
                        ${isHovered ? 'opacity-100 h-auto' : 'opacity-0 h-0 mb-0 mt-0'}`}>
              Account
            </p>
            <div className="space-y-1">
              <NavItem to={`/portfolio/${user.username}`} icon={<User size={20} />} isHovered={isHovered}>Portfolio</NavItem>
              <NavItem to="/orders" icon={<ShoppingBag size={20} />} isHovered={isHovered}>My Orders</NavItem>
              <NavItem to="/wallet" icon={<Wallet size={20} />} isHovered={isHovered}>Wallet</NavItem>
              <NavItem to="/settings" icon={<Settings size={20} />} isHovered={isHovered}>Settings</NavItem>
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className={`flex items-center p-4 gap-3 transition-all duration-200 ease-out
                      ${isHovered ? '' : 'justify-center'}`}>
          {/* Profile Picture with ring */}
          <div className="relative flex-shrink-0">
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-10 h-10 rounded-full ring-2 ring-[#7C5FFF]/30 transition-all duration-300 hover:ring-[#7C5FFF] hover:scale-105"
            />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121212] animate-pulse" />
          </div>

          {/* User Info - only show when hovered */}
          <div className={`min-w-0 transition-all duration-200 ease-out overflow-hidden
                        ${isHovered ? 'flex-1 opacity-100' : 'w-0 opacity-0'}`}>
            <p className="font-semibold text-white truncate text-sm">{user.username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-pulse" />
              <p className="text-xs text-gray-400">{user.subscription} Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;