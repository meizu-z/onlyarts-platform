import React from 'react';
import { Crown } from 'lucide-react';

/**
 * PremiumBadge - Badge component for premium/basic users
 * @param {string} tier - Subscription tier ('basic' or 'premium')
 * @param {string} size - Size variant ('sm', 'md', 'lg')
 * @param {boolean} showLabel - Whether to show text label
 * @param {string} className - Additional CSS classes
 */
const PremiumBadge = ({
  tier = 'premium',
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  if (!tier || tier === 'free') return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const colors = {
    basic: {
      bg: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      text: 'text-white',
      label: 'Basic',
      glow: 'shadow-lg shadow-indigo-500/30',
    },
    premium: {
      bg: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400',
      text: 'text-black',
      label: 'Premium',
      glow: 'shadow-lg shadow-amber-500/40',
    },
    vip: {
      bg: 'bg-gradient-to-r from-purple-600 via-pink-500 to-red-500',
      text: 'text-white',
      label: 'VIP',
      glow: 'shadow-lg shadow-pink-500/50 animate-pulse',
    },
  };

  const config = colors[tier] || colors.premium;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-bold
        ${config.bg} ${config.text} ${config.glow}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Crown size={iconSizes[size]} className="fill-current" />
      {showLabel && config.label}
    </span>
  );
};

export default PremiumBadge;
