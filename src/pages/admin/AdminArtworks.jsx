import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import adminService from '../../services/admin.service';
import { FaStar, FaTrash, FaFilter, FaEye, FaRegStar, FaArrowLeft, FaHeart, FaImage } from 'react-icons/fa';

const AdminArtworks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    featured: searchParams.get('featured') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20
  });

  useEffect(() => {
    fetchArtworks();
  }, [filters]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllArtworks(filters);
      setArtworks(response.artworks || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError(err.message || 'Failed to load artworks');
      console.error('Error fetching artworks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (artworkId, isFeatured) => {
    try {
      if (isFeatured) {
        await adminService.unfeatureArtwork(artworkId);
      } else {
        await adminService.featureArtwork(artworkId);
      }
      fetchArtworks();
    } catch (err) {
      alert(err.message || 'Failed to update featured status');
    }
  };

  const handleDelete = async (artworkId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    try {
      await adminService.deleteArtwork(artworkId);
      fetchArtworks();
    } catch (err) {
      alert(err.message || 'Failed to delete artwork');
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

  if (loading && artworks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-400">Loading artworks...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Artwork Management</h1>
        <p className="text-gray-700 dark:text-gray-400">Manage platform artworks, feature content, and moderation</p>
      </div>

      {/* Filters */}
      <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 mb-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="painting">Painting</option>
              <option value="digital">Digital Art</option>
              <option value="sculpture">Sculpture</option>
              <option value="photography">Photography</option>
              <option value="illustration">Illustration</option>
              <option value="mixed-media">Mixed Media</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured</label>
            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
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

      {/* Artworks Grid */}
      <div className="bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <div key={artwork.id} className="border border-gray-200 dark:border-white/5 bg-[#fdf8f3] dark:bg-[#121212] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
              {/* Image */}
              <Link to={`/artwork/${artwork.id}`} className="block">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                  <img
                    src={artwork.primary_image || '/placeholder-artwork.png'}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  {artwork.is_featured && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <FaStar /> Featured
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium capitalize">
                    {artwork.category}
                  </div>
                </div>
              </Link>

              {/* Details */}
              <div className="p-4">
                <Link to={`/artwork/${artwork.id}`} className="block mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {artwork.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={artwork.artist_image || '/default-avatar.png'}
                    alt={artwork.artist_name}
                    className="w-6 h-6 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                  <Link to={`/artist/${artwork.artist_id}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 truncate transition-colors">
                    {artwork.artist_name}
                  </Link>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-purple-600 dark:text-purple-400">${parseFloat(artwork.price).toFixed(2)}</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    artwork.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    artwork.status === 'draft' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400' :
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                  }`}>
                    {artwork.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <FaEye className="text-purple-500" /> {artwork.view_count || 0}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <FaHeart className="text-red-500" /> {artwork.like_count || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeatureToggle(artwork.id, artwork.is_featured)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      artwork.is_featured
                        ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50'
                        : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                    }`}
                  >
                    {artwork.is_featured ? <><FaRegStar className="inline mr-1" />Unfeature</> : <><FaStar className="inline mr-1" />Feature</>}
                  </button>
                  <button
                    onClick={() => handleDelete(artwork.id, artwork.title)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-sm font-medium transition-all"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {artworks.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FaImage className="mx-auto text-5xl mb-4 opacity-50" />
            <p>No artworks found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} artworks
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

export default AdminArtworks;
