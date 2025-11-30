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
        price: plan.price, // Price is already in pesos
        title: plan.name.toUpperCase(),
        popular: plan.id === 'basic',
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
          name: 'basic',
          price: 149,
          title: 'BASIC',
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
            fan: ['Everything in Basic', 'Exclusive content access', 'VIP badge', 'Premium exhibitions'],
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
        {plans.map((plan, idx) => {
          // Define gradient styles for each plan
          const gradientStyles = {
            free: 'bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]',
            basic: 'bg-gradient-to-br from-[#7C5FFF]/20 via-[#1a1a1a] to-[#FF5F9E]/20',
            premium: 'bg-gradient-to-br from-[#7C5FFF]/30 via-[#B15FFF]/20 to-[#FF5F9E]/30'
          };

          const borderStyles = {
            free: 'border-white/10',
            basic: 'border-[#7C5FFF]/50 shadow-xl shadow-[#7C5FFF]/20',
            premium: 'border-[#FF5F9E]/50 shadow-xl shadow-[#FF5F9E]/20'
          };

          return (
            <Card
              key={plan.name}
              className={`
                ${gradientStyles[plan.name]}
                border-2 ${borderStyles[plan.name]}
                p-6 md:p-8
                transform hover:scale-105 hover:-translate-y-2
                transition-all duration-300 animate-fadeIn
                relative overflow-hidden
                flex flex-col h-full
              `}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                {plan.popular && (
                  <div className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-4 self-start shadow-lg shadow-[#7C5FFF]/50 animate-pulse">
                    <Sparkles size={14} /> MOST POPULAR
                  </div>
                )}

                <h3 className="text-2xl md:text-3xl font-bold text-[#f2e9dd] mb-2">{plan.title}</h3>

                <div className="mb-6">
                  {plan.price === 0 ? (
                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                        ₱{billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price}
                      </span>
                      <span className="text-[#f2e9dd]/50 text-lg">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                      {billingCycle === 'yearly' && (
                        <div className="text-xs text-[#f2e9dd]/50 mt-1">
                          ₱{Math.round(plan.price * 12 * 0.8 / 12)}/month
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features section with flex-grow to push button to bottom */}
                <div className="space-y-4 mb-6 flex-grow">
                  <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm font-bold text-[#B15FFF] mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#B15FFF] animate-pulse" />
                      Fan Access
                    </p>
                    {plan.features.fan.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-2">
                        <Check size={16} className="text-[#B15FFF] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#f2e9dd]/80">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-sm font-bold text-[#FF5F9E] mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF5F9E] animate-pulse" />
                      Artist Benefits
                    </p>
                    {plan.features.artist.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-2">
                        <Check size={16} className="text-[#FF5F9E] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#f2e9dd]/80">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button at the bottom */}
                <Button
                  className={`w-full transform hover:scale-105 transition-all duration-200 mt-auto ${
                    user?.subscription === plan.name
                      ? 'bg-white/10 text-[#f2e9dd] border border-white/20'
                      : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 border-0'
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
                    <>
                      Get Started <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-[#f2e9dd]/50">
        🔒 Secure payment • Cancel anytime
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Complete Your Upgrade">
        <div className="space-y-4 md:space-y-6">
          <div className="bg-gradient-to-r from-[#7C5FFF]/10 to-[#FF5F9E]/10 border border-[#7C5FFF]/30 rounded-lg p-3 md:p-4">
            <p className="text-sm md:text-base text-[#f2e9dd] mb-1">
              Selected Plan: <span className="font-bold capitalize">{selectedPlan?.name}</span> ({billingCycle})
            </p>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
              ₱{billingCycle === 'yearly' ? Math.round(selectedPlan?.price * 12 * 0.8) : selectedPlan?.price}/{billingCycle === 'yearly' ? 'year' : 'month'}
            </p>
            {billingCycle === 'yearly' && (
              <p className="text-xs text-[#f2e9dd]/70 mt-1">
                Save ₱{Math.round(selectedPlan?.price * 12 * 0.2)} compared to monthly
              </p>
            )}
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
              <span className="text-[#f2e9dd]">₱{billingCycle === 'yearly' ? Math.round(selectedPlan?.price * 12 * 0.8) : selectedPlan?.price}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm md:text-base">
              <span className="text-[#f2e9dd]/70">Tax (12%):</span>
              <span className="text-[#f2e9dd]">₱{Math.round((billingCycle === 'yearly' ? selectedPlan?.price * 12 * 0.8 : selectedPlan?.price) * 0.12)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between text-sm md:text-base">
              <span className="font-bold text-[#f2e9dd]">Total:</span>
              <span className="font-bold text-[#f2e9dd]">₱{Math.round((billingCycle === 'yearly' ? selectedPlan?.price * 12 * 0.8 : selectedPlan?.price) * 1.12)}</span>
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