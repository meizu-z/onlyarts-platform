import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { FaDollarSign, FaChartLine, FaCalendar, FaArrowLeft, FaChartBar } from 'react-icons/fa';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getRevenueAnalytics({ days: timeRange });
      setAnalytics(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = analytics?.total_revenue || 0;
  const revenueByCategory = analytics?.revenue_by_category || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-4 transition-colors"
        >
          <FaArrowLeft />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-gray-700 dark:text-gray-400">Revenue insights and performance metrics</p>
      </div>

      {/* Time Range Filter */}
      <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 mb-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendar className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Time Range</h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setTimeRange('7')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === '7'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === '30'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === '90'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Last 90 Days
          </button>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 mb-6 text-white border border-purple-500/30">
        <div className="flex items-center gap-3 mb-2">
          <FaDollarSign className="text-4xl" />
          <h2 className="text-2xl font-bold">Total Revenue</h2>
        </div>
        <p className="text-5xl font-bold mb-2">${parseFloat(totalRevenue).toFixed(2)}</p>
        <p className="text-purple-200">Last {timeRange} days</p>
      </div>

      {/* Revenue by Category */}
      <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 mb-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2 mb-6">
          <FaChartLine className="text-purple-600 dark:text-purple-400 text-xl" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue by Category</h2>
        </div>

        {revenueByCategory.length > 0 ? (
          <div className="space-y-4">
            {revenueByCategory.map((item, index) => {
              const percentage = totalRevenue > 0 ? (parseFloat(item.revenue) / parseFloat(totalRevenue)) * 100 : 0;
              return (
                <div key={index} className="border border-white/5 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{item.category}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.order_count} order{item.order_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">${parseFloat(item.revenue).toFixed(2)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaChartBar className="mx-auto text-5xl mb-4 opacity-50" />
            <p>No revenue data available for this time period</p>
          </div>
        )}
      </div>

      {/* Additional Metrics (Placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-white/5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Artists</h3>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Coming soon...</p>
          </div>
        </div>
        <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-white/5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trends</h3>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Chart visualization coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
