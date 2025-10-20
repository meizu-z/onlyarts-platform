import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const LockedState = ({ 
  title = 'Locked Content',
  description = 'Upgrade to access this feature',
  requiredTier = 'plus',
  features = [],
  variant = 'overlay', // 'overlay', 'card', 'inline'
  className = ''
}) => {
  const navigate = useNavigate();

  const tierInfo = {
    plus: {
      name: 'Plus',
      price: '₱149/mo',
      color: 'from-purple-600 to-pink-600'
    },
    premium: {
      name: 'Premium',
      price: '₱249/mo',
      color: 'from-pink-600 to-purple-600'
    }
  };

  const tier = tierInfo[requiredTier];

  if (variant === 'overlay') {
    return (
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-md z-20 flex items-center justify-center rounded-2xl ${className}`}>
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
            <Lock className="text-[#f2e9dd]/70" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">{title}</h3>
          <p className="text-[#f2e9dd]/70 mb-4">{description}</p>
          <Button 
            onClick={() => navigate('/subscriptions')}
            size="sm"
          >
            Upgrade to {tier.name}
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/30 rounded-2xl p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center flex-shrink-0">
            <Lock className="text-purple-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#f2e9dd] mb-2">{title}</h3>
            <p className="text-[#f2e9dd]/70 text-sm mb-4">{description}</p>
            
            {features.length > 0 && (
              <ul className="space-y-2 mb-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-[#f2e9dd]/80">
                    <span className="text-purple-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            
            <Button 
              onClick={() => navigate('/subscriptions')}
              size="sm"
            >
              Upgrade to {tier.name} - {tier.price}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // inline variant
  return (
    <div className={`flex items-center gap-3 p-4 bg-orange-600/10 border border-orange-500/30 rounded-lg ${className}`}>
      <Lock className="text-orange-400 flex-shrink-0" size={20} />
      <div className="flex-1">
        <p className="text-[#f2e9dd] font-medium">{title}</p>
        <p className="text-[#f2e9dd]/70 text-sm">{description}</p>
      </div>
      <Button 
        onClick={() => navigate('/subscriptions')}
        variant="secondary"
        size="sm"
      >
        Upgrade
      </Button>
    </div>
  );
};

export default LockedState;

