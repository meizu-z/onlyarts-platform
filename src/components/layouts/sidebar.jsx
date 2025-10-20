import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Video, Star, User, Sparkles, Settings, Wallet, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Video, label: 'Livestreams', path: '/livestreams' },
    { icon: Star, label: 'Favorites', path: '/favorites' },
    { 
      icon: user?.isArtist ? Palette : User, 
      label: user?.isArtist ? 'My Artist Page' : 'Create Artist Page', 
      path: user?.isArtist ? `/portfolio/${user?.username}` : '/create-artist'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden lg:block w-64 bg-[#121212] border-r border-white/10 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-2">
        {/* Main Menu */}
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl 
              transition-all duration-200
              ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-[#f2e9dd] border border-purple-500/30'
                  : 'text-[#f2e9dd]/70 hover:bg-white/5 hover:text-[#f2e9dd]'
              }
            `}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Divider */}
        <div className="pt-4 border-t border-white/10 mt-4">
          <Link
            to="/subscriptions"
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl 
              transition-all duration-200
              ${
                isActive('/subscriptions')
                  ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-purple-400 hover:bg-purple-500/10'
              }
            `}
          >
            <Sparkles size={20} />
            <span className="font-medium">Upgrade</span>
          </Link>
        </div>

        {/* Settings Section */}
        <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
          <Link
            to="/settings"
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl 
              transition-all duration-200
              ${
                isActive('/settings')
                  ? 'bg-white/5 text-[#f2e9dd]'
                  : 'text-[#f2e9dd]/70 hover:bg-white/5 hover:text-[#f2e9dd]'
              }
            `}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>

          <Link
            to="/wallet"
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl 
              transition-all duration-200
              ${
                isActive('/wallet')
                  ? 'bg-white/5 text-[#f2e9dd]'
                  : 'text-[#f2e9dd]/70 hover:bg-white/5 hover:text-[#f2e9dd]'
              }
            `}
          >
            <Wallet size={20} />
            <span className="font-medium">Wallet</span>
          </Link>
        </div>

        {/* User Subscription Badge */}
        {user?.subscription && user.subscription !== 'free' && (
          <div className="mt-6 p-4 bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-sm font-bold text-purple-400 capitalize">
                {user.subscription} Member
              </span>
            </div>
            <p className="text-xs text-[#f2e9dd]/70">
              Enjoying premium features
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;