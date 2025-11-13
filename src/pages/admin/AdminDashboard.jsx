import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service';
import {
  FaUsers,
  FaPalette,
  FaShoppingCart,
  FaDollarSign,
  FaClock,
  FaUserPlus,
  FaStar,
  FaChartLine,
  FaUsersCog,
  FaImages,
  FaBoxOpen,
  FaChartBar,
  FaHistory
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-400">Loading dashboard...</p>
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
            onClick={fetchStats}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FaUsers,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-blue-500 dark:to-blue-600',
      iconColor: 'text-blue-600 dark:text-white',
      link: '/admin/users'
    },
    {
      title: 'Artists',
      value: stats?.totalArtists || 0,
      icon: FaPalette,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-purple-500 dark:to-purple-600',
      iconColor: 'text-purple-600 dark:text-white',
      link: '/admin/users?role=artist'
    },
    {
      title: 'Artworks',
      value: stats?.totalArtworks || 0,
      icon: FaPalette,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-pink-500 dark:to-pink-600',
      iconColor: 'text-pink-600 dark:text-white',
      link: '/admin/artworks'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-green-500 dark:to-green-600',
      iconColor: 'text-green-600 dark:text-white',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `$${parseFloat(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: FaDollarSign,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-emerald-500 dark:to-emerald-600',
      iconColor: 'text-emerald-600 dark:text-white',
      link: '/admin/analytics'
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: FaClock,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-orange-500 dark:to-orange-600',
      iconColor: 'text-orange-600 dark:text-white',
      link: '/admin/orders?status=pending'
    },
    {
      title: 'New Users (7d)',
      value: stats?.newUsersLast7Days || 0,
      icon: FaUserPlus,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-cyan-500 dark:to-cyan-600',
      iconColor: 'text-cyan-600 dark:text-white',
      link: '/admin/users'
    },
    {
      title: 'Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: FaStar,
      color: 'bg-white/50 dark:bg-gradient-to-br dark:from-yellow-500 dark:to-yellow-600',
      iconColor: 'text-yellow-600 dark:text-white',
      link: '/admin/users?subscription=plus,premium'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-700 dark:text-gray-300">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-[#fdf8f3] dark:bg-[#0f0f0f] rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-white/5 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-transparent`}>
                  <Icon className={`${stat.iconColor} text-2xl`} />
                </div>
              </div>
              <h3 className="text-gray-800 dark:text-gray-300 text-sm font-semibold mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#fdf8f3] dark:bg-[#0f0f0f] rounded-2xl shadow-md p-6 mb-8 border border-gray-200 dark:border-white/5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="flex items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
          >
            <FaUsersCog className="mr-2 text-lg" />
            Manage Users
          </Link>
          <Link
            to="/admin/artworks"
            className="flex items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors font-medium"
          >
            <FaImages className="mr-2 text-lg" />
            Manage Artworks
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center justify-center px-4 py-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium"
          >
            <FaBoxOpen className="mr-2 text-lg" />
            View Orders
          </Link>
          <Link
            to="/admin/analytics"
            className="flex items-center justify-center px-4 py-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors font-medium"
          >
            <FaChartBar className="mr-2 text-lg" />
            Analytics
          </Link>
          <Link
            to="/admin/history"
            className="flex items-center justify-center px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium"
          >
            <FaHistory className="mr-2 text-lg" />
            Activity History
          </Link>
        </div>
      </div>

      {/* Recent Activity Section (placeholder) */}
      <div className="bg-[#fdf8f3] dark:bg-[#0f0f0f] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-white/5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="text-center text-gray-500 dark:text-gray-300 py-8">
          <p>Recent activity tracking coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
