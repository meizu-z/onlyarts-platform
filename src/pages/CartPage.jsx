import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { cartService, mockCart } from '../services/cart.service';
import { checkoutService } from '../services/checkout.service';
import { useToast } from '../components/ui/Toast';
import { Trash2, ShoppingBag } from 'lucide-react';

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
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchCart();
  }, []);

  // Auto-select all items when cart is loaded
  useEffect(() => {
    if (cart && cart.items && cart.items.length > 0) {
      setSelectedItems(cart.items.map(item => item.id));
    }
  }, [cart?.items?.length]);

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

  // Handle individual item selection
  const handleToggleItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle select all / deselect all
  const handleToggleAll = () => {
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(item => item.id));
    }
  };

  // Calculate totals for selected items only
  const calculateSelectedTotals = () => {
    if (!cart || !cart.items) return { subtotal: 0, tax: 0, total: 0 };

    const selectedCartItems = cart.items.filter(item => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1);
    const shipping = selectedCartItems.length > 0 ? cart.shipping : 0;
    const discount = cart.discount || 0;
    const total = subtotal + tax + shipping - discount;

    return { subtotal, tax, shipping, discount, total, itemCount: selectedCartItems.length };
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

  const handleBuyNow = async () => {
    if (!cart || cart.items.length === 0 || selectedItems.length === 0) {
      toast.error('Please select at least one item to purchase');
      return;
    }

    const selectedTotals = calculateSelectedTotals();

    // For demo mode, show a quick purchase flow
    if (USE_DEMO_MODE) {
      const confirmed = window.confirm(
        `Buy ${selectedTotals.itemCount} selected item(s) for ₱${selectedTotals.total.toLocaleString()}?\n\nThis will use your default payment method.`
      );

      if (confirmed) {
        toast.info('Processing purchase...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get purchased items and ensure they have the correct structure
        const purchasedItems = cart.items
          .filter(item => selectedItems.includes(item.id))
          .map(item => ({
            id: item.id,
            artwork: item.artwork || {
              id: item.id,
              title: item.title,
              artistName: item.artistName,
              image: item.image,
              price: item.price,
            },
            title: item.artwork?.title || item.title,
            artistName: item.artwork?.artistName || item.artistName,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.artwork?.image || item.image,
          }));

        // Prepare order data
        const orderData = {
          items: purchasedItems,
          subtotal: selectedTotals.subtotal,
          tax: selectedTotals.tax,
          shipping: selectedTotals.shipping,
          discount: selectedTotals.discount || 0,
          total: selectedTotals.total,
        };

        console.log('[CartPage] Navigating to order confirmation with data:', orderData);
        console.log('[CartPage] Purchased items:', purchasedItems);

        // Save to sessionStorage as backup (in case state is lost)
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        console.log('[CartPage] Saved order to sessionStorage');

        // Remove purchased items from cart
        const remainingItems = cart.items.filter(item => !selectedItems.includes(item.id));

        if (remainingItems.length === 0) {
          // Clear cart if all items were purchased
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
        } else {
          // Update cart with remaining items
          const newSubtotal = remainingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
          const newTax = Math.round(newSubtotal * 0.1);
          const newTotal = newSubtotal + newTax + cart.shipping - (cart.discount || 0);

          setCart({
            ...cart,
            items: remainingItems,
            subtotal: newSubtotal,
            tax: newTax,
            total: newTotal,
            itemCount: remainingItems.length,
          });
        }

        // Navigate to order confirmation
        navigate('/order-confirmation', { state: { orderData } });
      }
      return;
    }

    // REAL API MODE - Quick checkout with default payment
    try {
      toast.info('Processing purchase...');

      // Create order with selected items only
      const orderData = {
        items: selectedItems,
        paymentMethodId: 'default',
        quickCheckout: true,
      };

      const orderResponse = await checkoutService.createOrder(orderData);
      const order = orderResponse.order || orderResponse;

      // Process payment immediately
      await checkoutService.processPayment(order.id, {
        paymentMethodId: 'default',
      });

      toast.success('Purchase successful! 🎉');

      // Remove purchased items from cart
      for (const itemId of selectedItems) {
        await cartService.removeItem(itemId);
      }

      // Refresh cart
      await fetchCart();
      setSelectedItems([]);
    } catch (err) {
      toast.error(err.message || 'Purchase failed. Please try checkout instead.');
    }
  };

  if (loading) {
    return <LoadingPaint message="Loading your cart..." />;
  }

  if (error) {
    return <APIError error={error} retry={fetchCart} />;
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
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
              {/* Select All Checkbox */}
              <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cart.items.length}
                    onChange={handleToggleAll}
                    className="w-5 h-5 rounded border-2 border-[#f2e9dd]/30 bg-[#1a1a1a] checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 cursor-pointer accent-purple-500"
                  />
                  <span className="text-[#f2e9dd] font-semibold">
                    Select All ({cart.items.length} items)
                  </span>
                  {selectedItems.length > 0 && selectedItems.length < cart.items.length && (
                    <span className="text-[#f2e9dd]/60 text-sm">
                      ({selectedItems.length} selected)
                    </span>
                  )}
                </label>
              </Card>

              {cart.items.map((item) => (
                <Card
                  key={item.id}
                  className={`p-4 transition-all ${
                    selectedItems.includes(item.id)
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Selection Checkbox */}
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-5 h-5 rounded border-2 border-[#f2e9dd]/30 bg-[#1a1a1a] checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 cursor-pointer accent-purple-500"
                      />
                    </div>

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
                        ₱{item.price.toLocaleString()}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[#f2e9dd]/50 text-sm mt-1">
                          Quantity: {item.quantity}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>
                      {selectedItems.includes(item.id) && (
                        <span className="text-xs text-purple-400 font-semibold px-2 py-1 bg-purple-500/20 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold text-[#f2e9dd] mb-4">
                  Order Summary
                  {selectedItems.length > 0 && (
                    <span className="block text-sm font-normal text-purple-400 mt-1">
                      {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
                    </span>
                  )}
                </h2>

                {selectedItems.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm text-center">
                      Please select at least one item to purchase
                    </p>
                  </div>
                )}

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
                  {(() => {
                    const selectedTotals = calculateSelectedTotals();
                    return (
                      <>
                        <div className="flex justify-between text-[#f2e9dd]/70">
                          <span>Subtotal</span>
                          <span>₱{selectedTotals.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[#f2e9dd]/70">
                          <span>Shipping</span>
                          <span>₱{selectedTotals.shipping.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[#f2e9dd]/70">
                          <span>Tax (10%)</span>
                          <span>₱{selectedTotals.tax.toLocaleString()}</span>
                        </div>
                        {selectedTotals.discount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount</span>
                            <span>-₱{selectedTotals.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-[#f2e9dd]/10 pt-3 flex justify-between text-[#f2e9dd] font-bold text-lg">
                          <span>Total</span>
                          <span>₱{selectedTotals.total.toLocaleString()}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <Button
                  onClick={handleBuyNow}
                  disabled={selectedItems.length === 0}
                  className={`w-full mt-6 font-bold flex items-center justify-center gap-2 ${
                    selectedItems.length === 0
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  }`}
                >
                  <ShoppingBag size={20} />
                  {selectedItems.length === 0
                    ? 'Select Items to Buy'
                    : `Buy Now (${selectedItems.length}) - ₱${calculateSelectedTotals().total.toLocaleString()}`}
                </Button>

                <button
                  onClick={() => navigate('/explore')}
                  className="w-full mt-3 text-[#f2e9dd]/60 hover:text-[#f2e9dd] text-sm transition-colors"
                >
                  Continue Shopping
                </button>

                {/* Info Box */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-blue-400 text-xs">
                    ℹ️ Select items by clicking the checkboxes. Only selected items will be purchased.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
    </div>
  );
};

export default CartPage;
