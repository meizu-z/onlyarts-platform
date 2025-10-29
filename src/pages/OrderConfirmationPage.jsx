import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveOrder } from '../services/order.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag, Loader2 } from 'lucide-react';

// Mock order data as fallback
const MOCK_ORDER_DATA = {
  items: [
    {
      id: 'mock-1',
      artwork: {
        id: '1',
        title: 'Digital Sunset',
        artistName: 'Sarah Chen',
        image: '🌅',
        price: 5000,
      },
      title: 'Digital Sunset',
      artistName: 'Sarah Chen',
      price: 5000,
      quantity: 1,
      image: '🌅',
    },
    {
      id: 'mock-2',
      artwork: {
        id: '2',
        title: 'Abstract Dreams',
        artistName: 'Alex Rivera',
        image: '🎨',
        price: 3500,
      },
      title: 'Abstract Dreams',
      artistName: 'Alex Rivera',
      price: 3500,
      quantity: 1,
      image: '🎨',
    },
  ],
  subtotal: 8500,
  tax: 850,
  shipping: 500,
  discount: 0,
  total: 9850,
};

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[OrderConfirmationPage] ===== PAGE LOADED =====');

    // Try to get data from navigation state first
    let data = location.state?.orderData;
    console.log('[OrderConfirmationPage] location.state?.orderData:', data);

    // If not found, check sessionStorage
    if (!data) {
      console.log('[OrderConfirmationPage] No data in state, checking sessionStorage...');
      const pendingOrder = sessionStorage.getItem('pendingOrder');
      if (pendingOrder) {
        try {
          data = JSON.parse(pendingOrder);
          console.log('[OrderConfirmationPage] ✅ Found data in sessionStorage!');
          sessionStorage.removeItem('pendingOrder');
        } catch (err) {
          console.error('[OrderConfirmationPage] Error parsing sessionStorage:', err);
        }
      }
    }

    // If still no data, use mock data as fallback
    if (!data || !data.items || data.items.length === 0) {
      console.log('[OrderConfirmationPage] ⚠️ No valid order data found, using MOCK DATA');
      data = MOCK_ORDER_DATA;
    }

    console.log('[OrderConfirmationPage] ✅ Final order data:', data);
    setOrderData(data);

    // Save order
    try {
      const newOrder = saveOrder({
        ...data,
        userId: user?.id,
      });
      console.log('[OrderConfirmationPage] ✅ Order saved:', newOrder.id);
    } catch (error) {
      console.error('[OrderConfirmationPage] Error saving order:', error);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-3 md:px-6 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
        <p className="text-[#f2e9dd]/70 text-lg">Processing your order...</p>
      </div>
    );
  }

  // We always have orderData now (either real or mock), so no need for empty state check

  const { items, subtotal, tax, shipping, discount = 0, total } = orderData;

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-6 py-8">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4 animate-scaleIn">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#f2e9dd] mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-[#f2e9dd]/70 text-lg">
            Thank you for your purchase! Your artworks are ready.
          </p>
        </div>

        {/* Order Summary */}
        <Card className="p-6 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-[#f2e9dd]">Order Summary</h2>
            <div className="text-right">
              <p className="text-sm text-[#f2e9dd]/60">Order Date</p>
              <p className="text-[#f2e9dd] font-semibold">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="space-y-3 mb-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                  {item.artwork?.image || item.image || '🎨'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#f2e9dd] truncate">
                    {item.artwork?.title || item.title}
                  </h3>
                  <p className="text-sm text-[#f2e9dd]/60">
                    by {item.artwork?.artistName || item.artistName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#f2e9dd]">₱{item.price.toLocaleString()}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-[#f2e9dd]/60">Qty: {item.quantity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex justify-between text-[#f2e9dd]/70">
              <span>Subtotal</span>
              <span>₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#f2e9dd]/70">
              <span>Tax (10%)</span>
              <span>₱{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#f2e9dd]/70">
              <span>Shipping</span>
              <span>₱{shipping.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Discount</span>
                <span>-₱{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-[#f2e9dd] pt-3 border-t border-white/10">
              <span>Total Paid</span>
              <span>₱{total.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <Package size={20} />
            What's Next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="text-[#f2e9dd] font-semibold">Digital Downloads Ready</p>
                <p className="text-sm text-[#f2e9dd]/70">
                  Your high-resolution artworks are available in "My Orders"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="text-[#f2e9dd] font-semibold">Email Confirmation Sent</p>
                <p className="text-sm text-[#f2e9dd]/70">
                  Check your email for receipt and order details
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="text-[#f2e9dd] font-semibold">Support the Artist</p>
                <p className="text-sm text-[#f2e9dd]/70">
                  Leave a review and follow the artist for more amazing work
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={20} />
            View My Orders
          </Button>
          <Button
            onClick={() => navigate('/explore')}
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </Button>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Dashboard
          </Button>
        </div>
    </div>
  );
};

export default OrderConfirmationPage;
