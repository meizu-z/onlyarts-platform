import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useToast } from '../components/ui/Toast';
import { Trash2, ShoppingBag } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/')) {
    const serverBaseUrl = API_CONFIG.baseURL.replace('/api', '');
    return `${serverBaseUrl}${imagePath}`;
  }
  return null;
};

const CartPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { cartItems, removeFromCart, clearCart } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);

  // Auto-select all items when cart changes
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [cartItems.length]);


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
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // Calculate totals for selected items only
  const calculateSelectedTotals = () => {
    if (!cartItems || cartItems.length === 0) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };

    const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = Math.round(subtotal * 0.1);
    const shipping = selectedCartItems.length > 0 ? 500 : 0;
    const total = subtotal + tax + shipping - discount;

    return { subtotal, tax, shipping, discount, total, itemCount: selectedCartItems.length };
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    toast.success('Item removed from cart');
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setApplyingPromo(true);

    // Simulate promo code validation
    setTimeout(() => {
      if (promoCode.toUpperCase() === 'SAVE10') {
        const subtotal = calculateSelectedTotals().subtotal;
        const promoDiscount = Math.round(subtotal * 0.1);
        setDiscount(promoDiscount);
        setAppliedPromoCode(promoCode.toUpperCase());
        toast.success('Promo code applied! 10% discount');
      } else {
        toast.error('Invalid promo code');
      }
      setApplyingPromo(false);
    }, 500);
  };

  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedPromoCode(null);
    setPromoCode('');
    toast.success('Promo code removed');
  };

  const handleClearCart = () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    clearCart();
    setSelectedItems([]);
    setDiscount(0);
    setAppliedPromoCode(null);
    toast.success('Cart cleared');
  };

  const handleBuyNow = async () => {
    if (!cartItems || cartItems.length === 0 || selectedItems.length === 0) {
      toast.error('Please select at least one item to purchase');
      return;
    }

    const selectedTotals = calculateSelectedTotals();

    const confirmed = window.confirm(
      `Buy ${selectedTotals.itemCount} selected item(s) for ₱${selectedTotals.total.toLocaleString()}?\n\nThis will use your default payment method.`
    );

    if (confirmed) {
      toast.info('Processing purchase...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get purchased items and ensure they have the correct structure
      const purchasedItems = cartItems
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          id: item.id,
          artwork: item.artwork || {
            id: item.id,
            title: item.title,
            artistName: item.artistName,
            image: item.image,
            imageUrl: item.imageUrl,
            price: item.price,
          },
          title: item.artwork?.title || item.title,
          artistName: item.artwork?.artistName || item.artistName,
          price: item.price,
          quantity: item.quantity || 1,
          image: item.artwork?.image || item.image,
          imageUrl: item.artwork?.imageUrl || item.imageUrl,
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

      // Save to sessionStorage as backup
      sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));

      // Remove purchased items from cart
      selectedItems.forEach(itemId => removeFromCart(itemId));
      setSelectedItems([]);

      toast.success('Purchase successful! 🎉');

      // Navigate to order confirmation
      navigate('/order-confirmation', { state: { orderData } });
    }
  };

  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd]">
            Shopping Cart {!isEmpty && `(${cartItems.length})`}
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
                    checked={selectedItems.length === cartItems.length}
                    onChange={handleToggleAll}
                    className="w-5 h-5 rounded border-2 border-[#f2e9dd]/30 bg-[#1a1a1a] checked:bg-gradient-to-r checked:from-purple-500 checked:to-pink-500 cursor-pointer accent-purple-500"
                  />
                  <span className="text-[#f2e9dd] font-semibold">
                    Select All ({cartItems.length} items)
                  </span>
                  {selectedItems.length > 0 && selectedItems.length < cartItems.length && (
                    <span className="text-[#f2e9dd]/60 text-sm">
                      ({selectedItems.length} selected)
                    </span>
                  )}
                </label>
              </Card>

              {cartItems.map((item) => (
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
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {getImageUrl(item.artwork?.imageUrl || item.imageUrl) ? (
                        <img
                          src={getImageUrl(item.artwork?.imageUrl || item.imageUrl)}
                          alt={item.artwork?.title || item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl md:text-4xl">{item.artwork?.image || item.image || '🎨'}</span>
                      )}
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
              <Card className="p-6 sticky top-20">
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
                      disabled={appliedPromoCode}
                      className="flex-1 bg-[#1a1a1a] border border-[#f2e9dd]/20 rounded-lg px-3 py-2 text-[#f2e9dd] placeholder-[#f2e9dd]/40 focus:outline-none focus:border-[#f2e9dd]/40 disabled:opacity-50"
                    />
                    {appliedPromoCode ? (
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
                  {appliedPromoCode && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ Code "{appliedPromoCode}" applied
                    </p>
                  )}
                  {!appliedPromoCode && (
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
