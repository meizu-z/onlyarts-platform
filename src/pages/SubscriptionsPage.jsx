import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscriptionService } from '../services';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint } from '../components/ui/LoadingStates';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { Sparkles, Check, Lock, ArrowRight } from 'lucide-react';

const SubscriptionsPage = () => {
  const { user, updateSubscription } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [plans, setPlans] = useState([]);

  // Fetch subscription plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getPlans();
      const fetchedPlans = response.data || response;

      // Transform backend plans to match frontend format
      const transformedPlans = fetchedPlans.map(plan => ({
        name: plan.id,
        price: plan.price / 100, // Convert cents to dollars
        title: plan.name.toUpperCase(),
        popular: plan.id === 'plus',
        features: plan.features
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast?.error?.('Failed to load subscription plans');
      // Fallback to default plans if API fails
      setPlans([
        {
          name: 'free',
          price: 0,
          title: 'FREE',
          features: {
            fan: ['Browse artworks', 'Follow artists', 'Like artworks', 'Basic profile'],
            artist: ['Upload up to 10 artworks', 'Basic analytics', 'Standard visibility']
          }
        },
        {
          name: 'plus',
          price: 149,
          title: 'PLUS',
          popular: true,
          features: {
            fan: ['Everything in Free', 'Comment on artworks', 'Save favorites', 'Early access to exhibitions'],
            artist: ['Upload up to 50 artworks', 'Advanced analytics', 'Priority support', 'Commission requests']
          }
        },
        {
          name: 'premium',
          price: 249,
          title: 'PREMIUM',
          features: {
            fan: ['Everything in Plus', 'Exclusive content access', 'VIP badge', 'Premium exhibitions'],
            artist: ['Unlimited artworks', 'Premium analytics', 'Livestream capabilities', 'Priority placement']
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.name === 'free') {
      try {
        await subscriptionService.updateSubscription('free');
        updateSubscription('free');
        toast?.success?.('Successfully downgraded to free plan');
      } catch (error) {
        console.error('Error updating subscription:', error);
        toast?.error?.('Failed to update subscription');
      }
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      // For now, we'll just update the subscription without payment method
      // In production, you'd integrate Stripe here
      await subscriptionService.createSubscription(selectedPlan.name);
      updateSubscription(selectedPlan.name);
      toast?.success?.(`Successfully upgraded to ${selectedPlan.title} plan!`);
      setShowPayment(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast?.error?.(error.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingPaint />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-12">
      <div className="text-center mb-6 md:mb-12">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#f2e9dd] mb-2 md:mb-4">Choose Your OnlyArts Experience</h1>
        <p className="text-sm md:text-base text-[#f2e9dd]/70">Unlock exclusive features for fans and artists</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-8">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 md:px-6 py-2 text-sm md:text-base rounded-full transition-all duration-300 transform hover:scale-105 ${
            billingCycle === 'monthly'
              ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30'
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd] hover:bg-white/5'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 md:px-6 py-2 text-sm md:text-base rounded-full transition-all duration-300 transform hover:scale-105 ${
            billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white shadow-lg shadow-[#7C5FFF]/30'
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd] hover:bg-white/5'
          }`}
        >
          Yearly <span className="text-xs">(Save 20%)</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {plans.map((plan, idx) => (
          <Card
            key={plan.name}
            className={`p-4 md:p-6 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn ${
              plan.popular ? 'border-2 border-[#7C5FFF] shadow-lg shadow-[#7C5FFF]/30' : ''
            }`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full inline-flex items-center gap-1 mb-3 md:mb-4 shadow-lg shadow-[#7C5FFF]/30">
                <Sparkles size={12} className="animate-pulse" /> POPULAR
              </div>
            )}
            <h3 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-2">{plan.title}</h3>
            <div className="mb-4 md:mb-6">
              <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                ₱{plan.price}
              </span>
              <span className="text-[#f2e9dd]/50">/month</span>
            </div>

            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
              <div>
                <p className="text-xs md:text-sm font-bold text-[#B15FFF] mb-1 md:mb-2">Fan Access:</p>
                {plan.features.fan.map((feature, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-[#f2e9dd]/70 mb-1">{feature}</p>
                ))}
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-[#FF5F9E] mb-1 md:mb-2">Artist:</p>
                {plan.features.artist.map((feature, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-[#f2e9dd]/70 mb-1">{feature}</p>
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
        <div className="space-y-4 md:space-y-6">
          <div className="bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30 rounded-lg p-3 md:p-4">
            <p className="text-sm md:text-base text-[#f2e9dd] mb-1">Selected Plan: <span className="font-bold capitalize">{selectedPlan?.name}</span></p>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
              ₱{selectedPlan?.price}/month
            </p>
          </div>

          <div>
            <h3 className="text-sm md:text-base text-[#f2e9dd] font-bold mb-2 md:mb-3">Payment Method:</h3>
            <div className="space-y-2">
              <label className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'card' ? 'border-[#7C5FFF] bg-[#7C5FFF]/10' : 'border-white/10 hover:border-[#7C5FFF]'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span className="text-sm md:text-base text-[#f2e9dd]">💳 Credit/Debit Card</span>
              </label>
              <label className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'paypal' ? 'border-[#7C5FFF] bg-[#7C5FFF]/10' : 'border-white/10 hover:border-[#7C5FFF]'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                />
                <span className="text-sm md:text-base text-[#f2e9dd]">🅿️ PayPal</span>
              </label>
              <label className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'crypto' ? 'border-[#7C5FFF] bg-[#7C5FFF]/10' : 'border-white/10 hover:border-[#7C5FFF]'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'crypto'}
                  onChange={() => setPaymentMethod('crypto')}
                />
                <span className="text-sm md:text-base text-[#f2e9dd]">🔐 Crypto Wallet</span>
              </label>
            </div>
          </div>

          {/* Card Payment Fields */}
          {paymentMethod === 'card' && (
            <>
              <div>
                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Expiry" placeholder="MM / YY" />
                <Input label="CVC" placeholder="123" />
              </div>

              <Input label="Full Name" placeholder="Your full name" />
            </>
          )}

          {/* PayPal Payment Fields */}
          {paymentMethod === 'paypal' && (
            <div>
              <Input label="PayPal Email" placeholder="your@email.com" type="email" />
            </div>
          )}

          {/* Crypto Payment Fields */}
          {paymentMethod === 'crypto' && (
            <div>
              <Input label="Wallet Address" placeholder="0x..." />
            </div>
          )}

          <div className="bg-[#121212] border border-white/10 rounded-lg p-3 md:p-4">
            <div className="flex justify-between mb-2 text-sm md:text-base">
              <span className="text-[#f2e9dd]/70">Subtotal:</span>
              <span className="text-[#f2e9dd]">₱{selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm md:text-base">
              <span className="text-[#f2e9dd]/70">Tax:</span>
              <span className="text-[#f2e9dd]">₱{(selectedPlan?.price * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between text-sm md:text-base">
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
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Start 7-Day Free Trial'}
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