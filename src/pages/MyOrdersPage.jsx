import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { ShoppingBag, Download, Eye, Calendar, DollarSign, Package, ArrowLeft } from 'lucide-react';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const userOrders = savedOrders.filter(order => order.userId === user?.id);
    setOrders(userOrders);
  }, [user]);

  const handleDownload = (item) => {
    // Simulate download
    alert(`Downloading ${item.artwork?.title || item.title}...\n\nHigh-resolution file would be downloaded here.`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'processing':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'shipped':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] flex items-center gap-3">
            <ShoppingBag size={32} />
            My Orders
          </h1>
        </div>

        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">No Orders Yet</h2>
          <p className="text-[#f2e9dd]/70 mb-6">
            You haven't made any purchases yet. Start exploring amazing artworks!
          </p>
          <Button
            onClick={() => navigate('/explore')}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Explore Artworks
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] flex items-center gap-3">
            <ShoppingBag size={32} />
            My Orders
          </h1>
          <div className="text-right">
            <p className="text-[#f2e9dd]/60 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-[#f2e9dd]">{orders.length}</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <Card
              key={order.id}
              className="p-4 md:p-6 animate-fadeIn hover:border-purple-500/50 transition-all cursor-pointer"
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Package size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#f2e9dd] text-lg">
                      Order #{order.id}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-[#f2e9dd]/60">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} />
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-[#f2e9dd]/60">Total</p>
                    <p className="text-xl font-bold text-[#f2e9dd]">
                      ₱{order.total.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Order Items - Expandable */}
              {selectedOrder?.id === order.id && (
                <div className="border-t border-white/10 pt-4 animate-slideDown">
                  <div className="space-y-3">
                    {order.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                          {item.artwork?.image || item.image || '🎨'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#f2e9dd] truncate">
                            {item.artwork?.title || item.title}
                          </h4>
                          <p className="text-sm text-[#f2e9dd]/60">
                            by {item.artwork?.artistName || item.artistName}
                          </p>
                          <p className="text-sm font-semibold text-green-400 mt-1">
                            ₱{item.price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex items-center gap-2"
                        >
                          <Download size={16} />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-[#f2e9dd] mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-[#f2e9dd]/70">
                        <span>Subtotal</span>
                        <span>₱{order.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#f2e9dd]/70">
                        <span>Tax</span>
                        <span>₱{order.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#f2e9dd]/70">
                        <span>Shipping</span>
                        <span>₱{order.shipping.toLocaleString()}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Discount</span>
                          <span>-₱{order.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-[#f2e9dd] pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span>₱{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expand/Collapse Indicator */}
              {!selectedOrder || selectedOrder.id !== order.id ? (
                <div className="mt-3 text-center">
                  <button className="text-sm text-[#f2e9dd]/60 hover:text-[#f2e9dd] transition-colors">
                    Click to view details ▼
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-center">
                  <button className="text-sm text-[#f2e9dd]/60 hover:text-[#f2e9dd] transition-colors">
                    Click to collapse ▲
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>
        </div>
    </div>
  );
};

export default MyOrdersPage;
