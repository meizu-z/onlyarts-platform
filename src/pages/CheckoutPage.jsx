import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { cartService, mockCart } from '../services/cart.service';
import { checkoutService, mockPaymentMethods, mockOrder } from '../services/checkout.service';
import { useToast } from '../components/ui/Toast';

const USE_DEMO_MODE = true; // Set to false when backend is ready

const CheckoutPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [cart, setCart] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const [step, setStep] = useState(1); // 1: Review, 2: Payment, 3: Confirmation

  // Shipping information
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
  });

  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCart(mockCart);
        setPaymentMethods(mockPaymentMethods);
        setSelectedPaymentMethod(mockPaymentMethods[0].id);
        setLoading(false);
        return;
      }

      // REAL API MODE - Parallel fetching
      const [cartData, paymentMethodsData] = await Promise.all([
        cartService.getCart(),
        checkoutService.getPaymentMethods(),
      ]);

      setCart(cartData.cart || cartData);
      setPaymentMethods(paymentMethodsData.paymentMethods || paymentMethodsData);

      // Select default payment method
      const defaultMethod = (paymentMethodsData.paymentMethods || paymentMethodsData).find(pm => pm.isDefault);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.street || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zip) {
      toast.error('Please fill in all shipping information');
      return false;
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateShipping()) return;
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setProcessing(true);

      const orderData = {
        paymentMethodId: selectedPaymentMethod,
        shippingAddress: shippingInfo,
        billingAddress: sameAsBilling ? shippingInfo : shippingInfo, // Simplified for demo
      };

      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Order placed successfully! 🎉');
        setStep(3);
        setProcessing(false);
        return;
      }

      // REAL API MODE
      const orderResponse = await checkoutService.createOrder(orderData);
      const order = orderResponse.order || orderResponse;

      // Process payment
      await checkoutService.processPayment(order.id, {
        paymentMethodId: selectedPaymentMethod,
      });

      toast.success('Order placed successfully! 🎉');
      setStep(3);

      // Clear cart
      await cartService.clearCart();
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingPaint message="Loading checkout..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <APIError error={error} retry={fetchCheckoutData} />
      </MainLayout>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  if (isEmpty && step !== 3) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-[#f2e9dd]/70 text-lg mb-6">Your cart is empty</p>
            <Button onClick={() => navigate('/explore')}>
              Explore Artworks
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-[#f2e9dd]/10 text-[#f2e9dd]/40'
                  }`}
                >
                  {s}
                </div>
                <p className="text-xs text-[#f2e9dd]/60 mt-2">
                  {s === 1 ? 'Shipping' : s === 2 ? 'Payment' : 'Confirmation'}
                </p>
              </div>
              {s < 3 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                    step > s ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-[#f2e9dd]/10'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Shipping Information */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#f2e9dd]/70 text-sm mb-2">Full Name</label>
                      <input
                        type="text"
                        value={shippingInfo.name}
                        onChange={(e) => handleShippingChange('name', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[#f2e9dd]/70 text-sm mb-2">Email</label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#f2e9dd]/70 text-sm mb-2">Street Address</label>
                    <input
                      type="text"
                      value={shippingInfo.street}
                      onChange={(e) => handleShippingChange('street', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#f2e9dd]/70 text-sm mb-2">City</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-[#f2e9dd]/70 text-sm mb-2">State</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-[#f2e9dd]/70 text-sm mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={shippingInfo.zip}
                        onChange={(e) => handleShippingChange('zip', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleContinueToPayment}
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Continue to Payment
                </Button>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="text-3xl flex-shrink-0">{item.artwork?.image || '🎨'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f2e9dd] text-sm truncate">{item.artwork?.title || item.title}</p>
                        <p className="text-[#f2e9dd]/60 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[#f2e9dd] text-sm">${item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#f2e9dd]/10 pt-4 space-y-2">
                  <div className="flex justify-between text-[#f2e9dd]/70 text-sm">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f2e9dd]/70 text-sm">
                    <span>Shipping</span>
                    <span>${cart.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f2e9dd]/70 text-sm">
                    <span>Tax</span>
                    <span>${cart.tax.toLocaleString()}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Discount</span>
                      <span>-${cart.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-[#f2e9dd]/10 pt-2 flex justify-between text-[#f2e9dd] font-bold">
                    <span>Total</span>
                    <span>${cart.total.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-[#f2e9dd]/20 hover:border-[#f2e9dd]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">💳</div>
                          <div>
                            <p className="text-[#f2e9dd] font-medium">
                              {method.details.brand} •••• {method.details.last4}
                            </p>
                            <p className="text-[#f2e9dd]/60 text-sm">
                              Expires {method.details.expiryMonth}/{method.details.expiryYear}
                            </p>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-[#f2e9dd]/10 hover:bg-[#f2e9dd]/20 text-[#f2e9dd]"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {processing ? 'Processing...' : `Place Order ($${cart.total.toLocaleString()})`}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Order Summary Sidebar (same as step 1) */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="text-3xl flex-shrink-0">{item.artwork?.image || '🎨'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f2e9dd] text-sm truncate">{item.artwork?.title || item.title}</p>
                        <p className="text-[#f2e9dd]/60 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[#f2e9dd] text-sm">${item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#f2e9dd]/10 pt-4 space-y-2">
                  <div className="flex justify-between text-[#f2e9dd]/70 text-sm">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f2e9dd]/70 text-sm">
                    <span>Shipping</span>
                    <span>${cart.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f2e9dd]/70 text-sm">
                    <span>Tax</span>
                    <span>${cart.tax.toLocaleString()}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Discount</span>
                      <span>-${cart.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-[#f2e9dd]/10 pt-2 flex justify-between text-[#f2e9dd] font-bold">
                    <span>Total</span>
                    <span>${cart.total.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">Order Confirmed!</h2>
              <p className="text-[#f2e9dd]/70 mb-6">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
              <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
                <p className="text-[#f2e9dd]/60 text-sm">Order Number</p>
                <p className="text-[#f2e9dd] font-bold text-lg">{mockOrder.orderNumber}</p>
              </div>
              <p className="text-[#f2e9dd]/60 text-sm mb-6">
                A confirmation email has been sent to {shippingInfo.email}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/explore')}
                  className="flex-1 bg-[#f2e9dd]/10 hover:bg-[#f2e9dd]/20 text-[#f2e9dd]"
                >
                  Continue Shopping
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
