import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layouts/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Package, ArrowLeft, Eye } from 'lucide-react';

const SalesDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    thisMonth: 0,
    lastMonth: 0,
  });

  useEffect(() => {
    // Load all orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');

    // Filter sales where this user is the artist
    const artistSales = [];
    allOrders.forEach(order => {
      order.items.forEach(item => {
        // Check if current user is the artist (simplified check)
        if (item.artwork?.artistName || item.artistName) {
          artistSales.push({
            orderId: order.id,
            orderDate: order.createdAt,
            buyerId: order.userId,
            artwork: item.artwork || item,
            price: item.price,
            status: order.status,
          });
        }
      });
    });

    setSales(artistSales);

    // Calculate stats
    const totalRevenue = artistSales.reduce((sum, sale) => sum + sale.price, 0);
    const thisMonth = artistSales
      .filter(sale => {
        const saleDate = new Date(sale.orderDate);
        const now = new Date();
        return saleDate.getMonth() === now.getMonth() &&
               saleDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, sale) => sum + sale.price, 0);

    const lastMonth = artistSales
      .filter(sale => {
        const saleDate = new Date(sale.orderDate);
        const now = new Date();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return saleDate.getMonth() === lastMonthDate.getMonth() &&
               saleDate.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((sum, sale) => sum + sale.price, 0);

    setStats({
      totalRevenue,
      totalSales: artistSales.length,
      thisMonth,
      lastMonth,
    });
  }, [user]);

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

  const growthPercentage = stats.lastMonth > 0
    ? (((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100).toFixed(1)
    : 0;

  if (!user?.role && user?.subscription !== 'premium') {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-3 md:px-6 py-8">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">Artist Access Required</h2>
            <p className="text-[#f2e9dd]/70 mb-6">
              This feature is only available for artists. Become an artist to start selling your work!
            </p>
            <Button
              onClick={() => navigate('/create-artist')}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Become an Artist
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd] flex items-center gap-3">
            <TrendingUp size={32} />
            Sales Dashboard
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} className="text-green-400" />
              <span className={`text-sm font-semibold ${
                growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#f2e9dd]">
              ₱{stats.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-[#f2e9dd]/60">Total Revenue</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <ShoppingBag size={24} className="text-blue-400" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#f2e9dd]">
              {stats.totalSales}
            </p>
            <p className="text-sm text-[#f2e9dd]/60">Total Sales</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <Calendar size={24} className="text-purple-400" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#f2e9dd]">
              ₱{stats.thisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-[#f2e9dd]/60">This Month</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-orange-400" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#f2e9dd]">
              ₱{stats.lastMonth.toLocaleString()}
            </p>
            <p className="text-sm text-[#f2e9dd]/60">Last Month</p>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="p-6 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
            <Package size={24} />
            Recent Sales
          </h2>

          {sales.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">No Sales Yet</h3>
              <p className="text-[#f2e9dd]/70 mb-6">
                Your artworks haven't been purchased yet. Keep creating amazing art!
              </p>
              <Button
                onClick={() => navigate('/create-artwork')}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Upload New Artwork
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sales.slice(0, 10).map((sale, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {/* Artwork Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                      {sale.artwork.image || '🎨'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#f2e9dd] truncate">
                        {sale.artwork.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[#f2e9dd]/60">
                        <Calendar size={14} />
                        {new Date(sale.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Sale Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        ₱{sale.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-[#f2e9dd]/50">Order #{sale.orderId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(sale.status)}`}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}

              {sales.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-[#f2e9dd]/60">
                    Showing 10 of {sales.length} sales
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

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
    </MainLayout>
  );
};

export default SalesDashboardPage;
