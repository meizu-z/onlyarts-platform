import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import MainLayout from '../components/layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { cartService, mockCart } from '../services/cart.service';
import { checkoutService } from '../services/checkout.service';
import { useToast } from '../components/ui/Toast';

const USE_DEMO_MODE = true; // Set to false when backend is ready

const CartPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItems: contextCartItems, removeFromCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setCart(mockCart);
        setLoading(false);
        return;
      }

      // REAL API MODE
      const response = await cartService.getCart();
      setCart(response.cart || response);
    } catch (err) {
      setError(err.message || 'Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Optimistic update
      const oldCart = { ...cart };
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTax = Math.round(newSubtotal * 0.1);
      const newTotal = newSubtotal + newTax + (cart.shipping || 0) - (cart.discount || 0);

      setCart({
        ...cart,
        items: updatedItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
        itemCount: updatedItems.length,
      });

      if (USE_DEMO_MODE) {
        removeFromCart(itemId);
        toast.success('Item removed from cart');
        return;
      }

      // REAL API MODE
      const response = await cartService.removeItem(itemId);
      setCart(response.cart || response);
      removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (err) {
      // Revert on error
      setCart(oldCart);
      toast.error('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    try {
      // Optimistic update
      const oldCart = { ...cart };
      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newTax = Math.round(newSubtotal * 0.1);
      const newTotal = newSubtotal + newTax + (cart.shipping || 0) - (cart.discount || 0);

      setCart({
        ...cart,
        items: updatedItems,
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
      });

      if (USE_DEMO_MODE) {
        toast.success('Quantity updated');
        return;
      }

      // REAL API MODE
      const response = await cartService.updateQuantity(itemId, newQuantity);
      setCart(response.cart || response);
      toast.success('Quantity updated');
    } catch (err) {
      // Revert on error
      setCart(oldCart);
      toast.error('Failed to update quantity. Please try again.');
    }
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    try {
      setApplyingPromo(true);

      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate promo code validation
        if (promoCode.toUpperCase() === 'SAVE10') {
          const discount = Math.round(cart.subtotal * 0.1);
          setCart({
            ...cart,
            discount,
            total: cart.subtotal + cart.tax + cart.shipping - discount,
            promoCode: promoCode.toUpperCase(),
          });
          toast.success('Promo code applied! 10% discount');
        } else {
          toast.error('Invalid promo code');
        }
        setApplyingPromo(false);
        return;
      }

      // REAL API MODE
      const response = await cartService.applyPromoCode(promoCode);
      setCart(response.cart || response);
      toast.success('Promo code applied successfully!');
      setPromoCode('');
    } catch (err) {
      toast.error(err.message || 'Invalid promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    try {
      const oldCart = { ...cart };

      setCart({
        ...cart,
        discount: 0,
        total: cart.subtotal + cart.tax + cart.shipping,
        promoCode: null,
      });

      if (USE_DEMO_MODE) {
        toast.success('Promo code removed');
        return;
      }

      // REAL API MODE
      const response = await cartService.removePromoCode();
      setCart(response.cart || response);
      toast.success('Promo code removed');
    } catch (err) {
      setCart(oldCart);
      toast.error('Failed to remove promo code');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      const oldCart = { ...cart };

      setCart({
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        promoCode: null,
        itemCount: 0,
      });

      if (USE_DEMO_MODE) {
        toast.success('Cart cleared');
        return;
      }

      // REAL API MODE
      await cartService.clearCart();
      toast.success('Cart cleared');
    } catch (err) {
      setCart(oldCart);
      toast.error('Failed to clear cart');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleBuyAllNow = async () => {
    if (!cart || cart.items.length === 0) return;

    // For demo mode, show a quick purchase flow
    if (USE_DEMO_MODE) {
      const confirmed = window.confirm(
        `Buy all ${cart.itemCount} item(s) for $${cart.total.toLocaleString()}?\n\nThis will use your default payment method.`
      );

      if (confirmed) {
        toast.info('Processing purchase...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Purchase successful! 🎉 Your artworks will be delivered shortly.');

        // Clear cart after purchase
        setCart({
          items: [],
          subtotal: 0,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: 0,
          promoCode: null,
          itemCount: 0,
        });
      }
      return;
    }

    // REAL API MODE - Quick checkout with default payment
    try {
      toast.info('Processing purchase...');

      // Create order with default payment method
      const orderData = {
        paymentMethodId: 'default', // Use default payment method
        quickCheckout: true,
      };

      const orderResponse = await checkoutService.createOrder(orderData);
      const order = orderResponse.order || orderResponse;

      // Process payment immediately
      await checkoutService.processPayment(order.id, {
        paymentMethodId: 'default',
      });

      toast.success('Purchase successful! 🎉');

      // Clear cart
      await cartService.clearCart();
      setCart({
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        promoCode: null,
        itemCount: 0,
      });

      // Navigate to orders page or dashboard
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Purchase failed. Please try checkout instead.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingPaint message="Loading your cart..." />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <APIError error={error} retry={fetchCart} />
      </MainLayout>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd]">
            Shopping Cart {!isEmpty && `(${cart.itemCount})`}
          </h1>
          {!isEmpty && (
            <Button
              onClick={handleClearCart}
              className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {isEmpty ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-[#f2e9dd]/70 text-lg mb-6">Your cart is empty</p>
            <Button onClick={() => navigate('/explore')}>
              Explore Artworks
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Artwork Image */}
                    <div className="text-5xl flex-shrink-0">
                      {item.artwork?.image || item.image || '🎨'}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-[#f2e9dd] truncate">
                        {item.artwork?.title || item.title}
                      </h3>
                      <p className="text-[#f2e9dd]/60 text-sm">
                        by {item.artwork?.artistName || item.artistName}
                      </p>
                      <p className="text-[#f2e9dd] font-semibold mt-2">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded bg-[#f2e9dd]/10 hover:bg-[#f2e9dd]/20 text-[#f2e9dd] flex items-center justify-center transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-[#f2e9dd]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded bg-[#f2e9dd]/10 hover:bg-[#f2e9dd]/20 text-[#f2e9dd] flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">Order Summary</h2>

                {/* Promo Code */}
                <form onSubmit={handleApplyPromo} className="mb-4">
                  <label className="block text-[#f2e9dd]/70 text-sm mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      disabled={cart.promoCode}
                      className="flex-1 bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40 disabled:opacity-50"
                    />
                    {cart.promoCode ? (
                      <Button
                        type="button"
                        onClick={handleRemovePromo}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={applyingPromo || !promoCode.trim()}
                      >
                        {applyingPromo ? 'Applying...' : 'Apply'}
                      </Button>
                    )}
                  </div>
                  {cart.promoCode && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ Code "{cart.promoCode}" applied
                    </p>
                  )}
                  {USE_DEMO_MODE && !cart.promoCode && (
                    <p className="text-[#f2e9dd]/40 text-xs mt-2">
                      Try "SAVE10" for 10% off
                    </p>
                  )}
                </form>

                <div className="border-t border-[#f2e9dd]/10 pt-4 space-y-3">
                  <div className="flex justify-between text-[#f2e9dd]/70">
                    <span>Subtotal</span>
                    <span>${cart.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f2e9dd]/70">
                    <span>Shipping</span>
                    <span>${cart.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f2e9dd]/70">
                    <span>Tax (10%)</span>
                    <span>${cart.tax.toLocaleString()}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-${cart.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-[#f2e9dd]/10 pt-3 flex justify-between text-[#f2e9dd] font-bold text-lg">
                    <span>Total</span>
                    <span>${cart.total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBuyAllNow}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bold"
                >
                  💳 Buy All Now - ${cart.total.toLocaleString()}
                </Button>

                <Button
                  onClick={handleCheckout}
                  className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Proceed to Checkout
                </Button>

                <button
                  onClick={() => navigate('/explore')}
                  className="w-full mt-3 text-[#f2e9dd]/60 hover:text-[#f2e9dd] text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
