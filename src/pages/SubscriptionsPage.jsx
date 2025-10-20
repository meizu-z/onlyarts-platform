import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { Sparkles, Check, Lock, ArrowRight } from 'lucide-react';

const SubscriptionsPage = () => {
  const { user, updateSubscription } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'free',
      price: 0,
      title: 'FREE',
      features: {
        fan: [
          'Browse exhibitions (preview mode)',
          'Follow artists',
          'Basic messages',
          '❌ No auction bidding',
          '❌ No commission requests',
          '❌ No badges'
        ],
        artist: [
          '❌ No exhibition hosting',
          'Basic profile views only'  // REMOVED NFT MINTING
        ]
      }
    },
    {
      name: 'plus',
      price: 149,
      title: 'PLUS',
      popular: true,
      features: {
        fan: [
          '✓ All Free perks',
          '✓ Monthly free commission coupon',
          '✓ Auction bidding access',
          '✓ Supporter badges',
          '✓ Direct artist engagement'
        ],
        artist: [
          '✓ All Free artist perks',
          '✓ Featured slots in group exhibitions',
          '✓ Expanded analytics (fans, revenue)',
          '✓ AI content strategy (early access)'
        ]
      }
    },
    {
      name: 'premium',
      price: 249,
      title: 'PREMIUM',
      features: {
        fan: [
          '✓ All Plus perks',
          '✓ Priority bidding access',
          '✓ VIP-only showcases',
          '✓ Exclusive NFTs & badges',
          '✓ 1-on-1 with artists'
        ],
        artist: [
          '✓ All Plus artist perks',
          '✓ Host solo exhibitions',
          '✓ Premium Explore placement',
          '✓ Full audience insights',
          '✓ Event collaborations'
        ]
      }
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.name === 'free') {
      updateSubscription('free');
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePayment = () => {
    updateSubscription(selectedPlan.name);
    setShowPayment(false);
    setSelectedPlan(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#f2e9dd] mb-4">Choose Your OnlyArts Experience</h1>
        <p className="text-[#f2e9dd]/70">Unlock exclusive features for fans and artists</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
            billingCycle === 'monthly' 
              ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd] hover:bg-white/5'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
            billingCycle === 'yearly' 
              ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd] hover:bg-white/5'
          }`}
        >
          Yearly <span className="text-xs">(Save 20%)</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, idx) => (
          <Card 
            key={plan.name} 
            className={`p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn ${
              plan.popular ? 'border-2 border-[#7C5FFF] shadow-lg shadow-[#7C5FFF]/30' : ''
            }`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white text-sm font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 mb-4 shadow-lg shadow-[#7C5FFF]/30">
                <Sparkles size={12} className="animate-pulse" /> POPULAR
              </div>
            )}
            <h3 className="text-2xl font-bold text-[#f2e9dd] mb-2">{plan.title}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                ₱{plan.price}
              </span>
              <span className="text-[#f2e9dd]/50">/month</span>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-bold text-[#B15FFF] mb-2">Fan Access:</p>
                {plan.features.fan.map((feature, idx) => (
                  <p key={idx} className="text-sm text-[#f2e9dd]/70 mb-1">{feature}</p>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-[#FF5F9E] mb-2">Artist:</p>
                {plan.features.artist.map((feature, idx) => (
                  <p key={idx} className="text-sm text-[#f2e9dd]/70 mb-1">{feature}</p>
                ))}
              </div>
            </div>

            <Button
              className={`w-full transform hover:scale-105 transition-all duration-200 ${
                user?.subscription === plan.name 
                  ? '' 
                  : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50'
              }`}
              variant={user?.subscription === plan.name ? 'ghost' : 'primary'}
              onClick={() => handleSelectPlan(plan)}
              disabled={user?.subscription === plan.name}
            >
              {user?.subscription === plan.name ? (
                <>
                  <Check size={16} className="mr-2" /> Current Plan
                </>
              ) : (
                'Select Plan'
              )}
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-[#f2e9dd]/50">
        🔒 Secure payment • Cancel anytime
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Complete Your Upgrade">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30 rounded-lg p-4">
            <p className="text-[#f2e9dd] mb-1">Selected Plan: <span className="font-bold capitalize">{selectedPlan?.name}</span></p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
              ₱{selectedPlan?.price}/month
            </p>
          </div>

          <div>
            <h3 className="text-[#f2e9dd] font-bold mb-3">Payment Method:</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-[#7C5FFF] transition-colors">
                <input type="radio" name="payment" defaultChecked />
                <span className="text-[#f2e9dd]">Credit/Debit Card</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-[#7C5FFF] transition-colors">
                <input type="radio" name="payment" />
                <span className="text-[#f2e9dd]">PayPal</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-white/10 rounded-lg cursor-pointer hover:border-[#7C5FFF] transition-colors">
                <input type="radio" name="payment" />
                <span className="text-[#f2e9dd]">Crypto Wallet</span>
              </label>
            </div>
          </div>

          <div>
            <Input label="Card Number" placeholder="1234 5678 9012 3456" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry" placeholder="MM / YY" />
            <Input label="CVC" placeholder="123" />
          </div>

          <Input label="Full Name" placeholder="Your full name" />

          <div className="bg-[#121212] border border-white/10 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-[#f2e9dd]/70">Subtotal:</span>
              <span className="text-[#f2e9dd]">₱{selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[#f2e9dd]/70">Tax:</span>
              <span className="text-[#f2e9dd]">₱{(selectedPlan?.price * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="font-bold text-[#f2e9dd]">Total:</span>
              <span className="font-bold text-[#f2e9dd]">₱{(selectedPlan?.price * 1.1).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-[#f2e9dd]/50 text-center">
            By continuing, you agree to our Terms of Service
          </p>

          <Button 
            className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300" 
            size="lg" 
            onClick={handlePayment}
          >
            Start 7-Day Free Trial
          </Button>

          <p className="text-xs text-center text-[#f2e9dd]/50">
            🔒 Secured by Stripe • No charge until Oct 26, 2025
          </p>
        </div>
      </Modal>
    </div>
  );
};

export { SubscriptionsPage };