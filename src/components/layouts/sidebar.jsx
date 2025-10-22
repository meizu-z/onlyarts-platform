import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Tv, Star, User, Settings, Wallet, PlusSquare, ChevronsLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NavItem = ({ to, icon, children, isCollapsed, delay }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
      className={`
        opacity-0 animate-fadeIn
        flex items-center rounded-lg
        text-lg font-medium transition-all duration-300 ease-in-out
        transform hover:scale-105
        ${isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'}
        ${isActive
          ? 'bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 text-white shadow-inner-purple'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      {icon}
      <span
        className={`whitespace-nowrap overflow-hidden transition-all duration-300
        ${isCollapsed ? 'w-0 opacity-0' : 'flex-1 w-full opacity-100 ml-4'}`}
      >
        {children}
      </span>
    </NavLink>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { to: '/dashboard', icon: <Home size={24} />, label: 'Feed' },
    { to: '/explore', icon: <Compass size={24} />, label: 'Explore' },
    { to: '/livestreams', icon: <Tv size={24} />, label: 'Livestreams' },
    { to: '/exhibition', icon: <PlusSquare size={24} />, label: 'Exhibition' },
    { to: '/favorites', icon: <Star size={24} />, label: 'Favorites' },
  ];

  const accountItems = [
    { to: `/portfolio/${user.username}`, icon: <User size={24} />, label: 'Portfolio' },
    { to: '/wallet', icon: <Wallet size={24} />, label: 'Wallet' },
    { to: '/settings', icon: <Settings size={24} />, label: 'Settings' },
  ];

  return (
    <aside
      className={`
        h-screen flex flex-col
        bg-gradient-to-b from-[#1a1a1a] to-[#121212]
        border-r border-white/10
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-24' : 'w-72'}
      `}
    >
      <div className={`p-4 flex items-center mb-8 ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronsLeft
            size={24}
            className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4" style={{ scrollbarWidth: 'none', 'msOverflowStyle': 'none' }}>
        <nav className="space-y-3">
          <div>
            <p className={`px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>Menu</p>
            {menuItems.map((item, index) => (
              <NavItem key={item.to} to={item.to} icon={item.icon} isCollapsed={isCollapsed} delay={index * 0.05}>
                {item.label}
              </NavItem>
            ))}
          </div>

          <div className="pt-6">
            <p className={`px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>Account</p>
            {accountItems.map((item, index) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                isCollapsed={isCollapsed}
                delay={(menuItems.length + index) * 0.05}
              >
                {item.label}
              </NavItem>
            ))}
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10 mt-6">
        <div className={`flex items-center p-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <img src={user.profilePicture} alt={user.username} className="w-12 h-12 rounded-full flex-shrink-0" />
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-0 opacity-0' : 'flex-1 w-full opacity-100 ml-4'}`}>
            <p className="font-semibold text-white truncate">{user.username}</p>
            <p className="text-sm text-gray-400">{user.subscription} Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;