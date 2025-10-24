import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Tv, Star, User, Settings, Wallet, Sparkles, ChevronsLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon, children, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={`
        group relative flex items-center rounded-xl
        text-lg font-medium transition-all duration-500 ease-out
        ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
        ${isActive
          ? 'bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 text-white shadow-lg shadow-[#7C5FFF]/10'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#7C5FFF] to-[#FF5F9E] rounded-r-full animate-fadeIn" />
      )}
      
      {/* Icon with smooth scale */}
      <div className={`transition-all duration-500 ease-out ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      
      {/* Text with smooth fade and slide */}
      <span
        className={`whitespace-nowrap transition-all duration-500 ease-out
        ${isCollapsed 
          ? 'w-0 opacity-0 ml-0 translate-x-4' 
          : 'flex-1 w-full opacity-100 ml-4 translate-x-0'
        }`}
      >
        {children}
      </span>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-6 px-3 py-2 bg-[#2a2a35] text-white text-sm rounded-lg 
                      opacity-0 group-hover:opacity-100 pointer-events-none
                      transition-all duration-300 ease-out
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`
        hidden md:flex h-screen flex-col
        bg-gradient-to-b from-[#1a1a1a] to-[#121212]
        border-r border-white/10 backdrop-blur-xl
        transition-all duration-500 ease-out
        rounded-br-3xl
        ${isCollapsed ? 'w-24' : 'w-72'}
      `}
    >
      {/* Toggle Section */}
      <div className={`p-4 flex items-center mb-8 transition-all duration-500 ease-out ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white 
                   transition-all duration-300 ease-out hover:scale-110 active:scale-95
                   group"
        >
          <ChevronsLeft
            size={20}
            className={`transform transition-all duration-500 ease-out
                     ${isCollapsed ? 'rotate-180' : 'rotate-0'}
                     group-hover:scale-110`}
          />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 pb-4" 
           style={{ scrollbarWidth: 'thin', scrollbarColor: '#7C5FFF #1a1a1a' }}>
        <nav className="space-y-2">
          {/* Main Menu Section */}
          <div className="mb-6">
            <p className={`px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest
                        transition-all duration-500 ease-out
                        ${isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100 h-auto'}`}>
              Menu
            </p>
            <div className="space-y-1">
              <NavItem to="/dashboard" icon={<Home size={22} />} isCollapsed={isCollapsed}>Feed</NavItem>
              <NavItem to="/explore" icon={<Compass size={22} />} isCollapsed={isCollapsed}>Explore</NavItem>
              <NavItem to="/livestreams" icon={<Tv size={22} />} isCollapsed={isCollapsed}>Livestreams</NavItem>
              {user?.role !== 'artist' && (
                <NavItem to="/create-artist" icon={<Sparkles size={22} />} isCollapsed={isCollapsed}>Be an Artist</NavItem>
              )}
              <NavItem to="/favorites" icon={<Star size={22} />} isCollapsed={isCollapsed}>Favorites</NavItem>
            </div>
          </div>

          {/* Divider */}
          <div className={`transition-all duration-500 ease-out overflow-hidden
                        ${isCollapsed ? 'h-0 my-0' : 'h-px my-6'}
                        bg-gradient-to-r from-transparent via-white/10 to-transparent`} />

          {/* Account Section */}
          <div>
            <p className={`px-4 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest
                        transition-all duration-500 ease-out
                        ${isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100 h-auto'}`}>
              Account
            </p>
            <div className="space-y-1">
              <NavItem to={`/portfolio/${user.username}`} icon={<User size={22} />} isCollapsed={isCollapsed}>Portfolio</NavItem>
              <NavItem to="/wallet" icon={<Wallet size={22} />} isCollapsed={isCollapsed}>Wallet</NavItem>
              <NavItem to="/settings" icon={<Settings size={22} />} isCollapsed={isCollapsed}>Settings</NavItem>
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm rounded-br-3xl overflow-hidden">
        <div className={`flex items-center p-5 gap-3 transition-all duration-500 ease-out
                      ${isCollapsed ? 'justify-center' : ''}`}>
          {/* Profile Picture with ring */}
          <div className="relative flex-shrink-0">
            <img 
              src={user.profilePicture} 
              alt={user.username} 
              className="w-11 h-11 rounded-full ring-2 ring-[#7C5FFF]/30 transition-all duration-300 hover:ring-[#7C5FFF] hover:scale-105" 
            />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#121212] animate-pulse" />
          </div>

          {/* User Info */}
          <div className={`min-w-0 transition-all duration-500 ease-out
                        ${isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100'}`}>
            <p className="font-semibold text-white truncate text-sm">{user.username}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-pulse" />
              <p className="text-xs text-gray-400">{user.subscription} Plan</p>
            </div>
          </div>

          {/* Settings quick access - only show when expanded */}
          <button 
            className={`p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white
                     transition-all duration-500 ease-out hover:rotate-90
                     ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;