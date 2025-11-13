import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { FaHistory, FaFilter, FaArrowLeft, FaUser, FaImage, FaShoppingCart, FaCog, FaSignInAlt, FaEllipsisH } from 'react-icons/fa';

const AdminHistory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    action_type: searchParams.get('action_type') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 50
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAuditLog(filters);
      setLogs(response.logs || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load activity history');
      console.error('Error fetching audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'user_role_change':
      case 'user_ban':
      case 'user_unban':
        return <FaUser className="text-blue-500" />;
      case 'artwork_feature':
      case 'artwork_unfeature':
      case 'artwork_delete':
        return <FaImage className="text-purple-500" />;
      case 'order_view':
        return <FaShoppingCart className="text-green-500" />;
      case 'settings_change':
        return <FaCog className="text-orange-500" />;
      case 'login':
        return <FaSignInAlt className="text-indigo-500" />;
      default:
        return <FaEllipsisH className="text-gray-500" />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'user_role_change':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'user_ban':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'user_unban':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'artwork_feature':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      case 'artwork_unfeature':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
      case 'artwork_delete':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'order_view':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'settings_change':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400';
      case 'login':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400';
    }
  };

  const formatActionType = (actionType) => {
    return actionType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;

    return date.toLocaleString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-400">Loading activity history...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Activity History</h1>
        <p className="text-gray-700 dark:text-gray-400">Track all administrative actions and changes</p>
      </div>

      {/* Filters */}
      <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 mb-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action Type</label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Actions</option>
              <option value="user_role_change">User Role Change</option>
              <option value="user_ban">User Ban</option>
              <option value="user_unban">User Unban</option>
              <option value="artwork_feature">Artwork Feature</option>
              <option value="artwork_unfeature">Artwork Unfeature</option>
              <option value="artwork_delete">Artwork Delete</option>
              <option value="order_view">Order View</option>
              <option value="settings_change">Settings Change</option>
              <option value="login">Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9f4ed] dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="bg-[#fdf8f3] dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f5ede3] dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={log.admin_image || '/default-avatar.png'}
                        alt={log.admin_name}
                        className="w-10 h-10 rounded-full object-cover mr-3 ring-2 ring-purple-500/30"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{log.admin_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">@{log.admin_username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action_type)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action_type)}`}>
                        {formatActionType(log.action_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 dark:text-gray-300">{log.description}</p>
                    {log.target_type && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Target: {log.target_type} #{log.target_id}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaHistory className="mx-auto text-5xl mb-4 opacity-50" />
            <p>No activity history found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-[#f9f4ed] dark:bg-gray-700/50 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} activities
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistory;
