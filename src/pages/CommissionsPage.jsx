import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { commissionService } from '../services';
import { API_CONFIG } from '../config/api.config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPaint } from '../components/ui/LoadingStates';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Calendar,
  DollarSign,
  User,
  Image as ImageIcon
} from 'lucide-react';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const serverBaseUrl = API_CONFIG.baseURL.replace('/api', '');
  return `${serverBaseUrl}${imagePath}`;
};

const CommissionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Default to 'received' for artists, 'sent' for others
  const defaultTab = (user?.role === 'artist' || user?.isAdmin) ? 'received' : 'sent';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchCommissions();
  }, [activeTab]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      let response;

      if (activeTab === 'sent') {
        // Commissions sent by the user (as client)
        response = await commissionService.getMyCommissions();
      } else {
        // Commissions received by the user (as artist)
        response = await commissionService.getCommissionRequests();
      }

      const commissionsData = response.data?.commissions || response.commissions || [];
      setCommissions(commissionsData);
    } catch (error) {
      console.error('Error fetching commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (commissionId, newStatus) => {
    try {
      setUpdatingStatus(commissionId);
      await commissionService.updateCommissionStatus(commissionId, newStatus);

      // Update local state
      setCommissions(prev =>
        prev.map(c =>
          c.id === commissionId ? { ...c, status: newStatus } : c
        )
      );

      toast.success(`Commission status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating commission status:', error);
      toast.error('Failed to update commission status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: <Clock size={14} />
      },
      accepted: {
        label: 'Accepted',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <CheckCircle size={14} />
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: <Briefcase size={14} />
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: <CheckCircle size={14} />
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <XCircle size={14} />
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <XCircle size={14} />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getStatusActions = (commission) => {
    if (activeTab !== 'received') return null;
    if (commission.status === 'completed' || commission.status === 'cancelled' || commission.status === 'rejected') return null;

    const statusFlow = {
      pending: ['accepted', 'rejected'],
      accepted: ['in_progress'],
      in_progress: ['completed']
    };

    const nextStatuses = statusFlow[commission.status] || [];

    return (
      <div className="flex gap-2 mt-4">
        {nextStatuses.map(status => (
          <Button
            key={status}
            size="sm"
            onClick={() => handleStatusUpdate(commission.id, status)}
            disabled={updatingStatus === commission.id}
            className="capitalize"
          >
            {updatingStatus === commission.id ? (
              <>
                <Loader size={14} className="animate-spin mr-1" />
                Updating...
              </>
            ) : (
              <>Move to {status.replace('_', ' ')}</>
            )}
          </Button>
        ))}
      </div>
    );
  };

  const filteredCommissions = commissions.filter(commission => {
    // Filter by status
    if (statusFilter !== 'all' && commission.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = commission.title?.toLowerCase() || '';
      const description = commission.description?.toLowerCase() || '';
      const artistName = commission.artist_name?.toLowerCase() || '';
      const clientName = commission.client_name?.toLowerCase() || '';

      return title.includes(query) ||
             description.includes(query) ||
             artistName.includes(query) ||
             clientName.includes(query);
    }

    return true;
  });

  const getStatusCount = (status) => {
    if (status === 'all') return commissions.length;
    return commissions.filter(c => c.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingPaint message="Loading commissions..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#f2e9dd] mb-2">
          My Commissions
        </h1>
        <p className="text-[#f2e9dd]/70">
          Manage your commission requests and track their progress
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        {(user?.role === 'artist' || user?.isAdmin) && (
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 px-4 font-semibold transition-all ${
              activeTab === 'received'
                ? 'text-[#f2e9dd] border-b-2 border-purple-500'
                : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
            }`}
          >
            Received ({activeTab === 'received' ? commissions.length : '...'})
          </button>
        )}
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 font-semibold transition-all ${
            activeTab === 'sent'
              ? 'text-[#f2e9dd] border-b-2 border-purple-500'
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          Sent ({activeTab === 'sent' ? commissions.length : '...'})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f2e9dd]/40" size={18} />
          <input
            type="text"
            placeholder="Search commissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1e1e1e] border border-white/10 rounded-lg text-[#f2e9dd] placeholder:text-[#f2e9dd]/40 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'accepted', 'in_progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#1e1e1e] text-[#f2e9dd]/70 hover:bg-[#2a2a2a]'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ')} ({getStatusCount(status)})
            </button>
          ))}
        </div>
      </div>

      {/* Commissions List */}
      {filteredCommissions.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-[#f2e9dd]/30" />
          <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">
            No commissions found
          </h3>
          <p className="text-[#f2e9dd]/70 mb-6">
            {statusFilter !== 'all'
              ? `No ${statusFilter.replace('_', ' ')} commissions`
              : activeTab === 'received'
              ? "You haven't received any commission requests yet"
              : "You haven't sent any commission requests yet"}
          </p>
          {activeTab === 'sent' && (
            <Button onClick={() => navigate('/explore')}>
              Browse Artists
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCommissions.map((commission) => (
            <Card key={commission.id} className="p-6 hover:border-purple-500/50 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl flex-shrink-0">
                    {activeTab === 'received' ? (
                      commission.client_image ? (
                        <img
                          src={getImageUrl(commission.client_image)}
                          alt={commission.client_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        commission.client_name?.charAt(0) || 'U'
                      )
                    ) : (
                      commission.artist_image ? (
                        <img
                          src={getImageUrl(commission.artist_image)}
                          alt={commission.artist_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        commission.artist_name?.charAt(0) || 'A'
                      )
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#f2e9dd] mb-1">{commission.title}</h3>
                    <p className="text-sm text-[#f2e9dd]/60">
                      {activeTab === 'received'
                        ? `From ${commission.client_name || 'Unknown'}`
                        : `To ${commission.artist_name || 'Unknown'}`}
                    </p>
                  </div>
                </div>
                {getStatusBadge(commission.status)}
              </div>

              {/* Description */}
              <p className="text-sm text-[#f2e9dd]/70 mb-4 line-clamp-2">
                {commission.description}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign size={16} className="text-purple-400" />
                  <span className="text-[#f2e9dd]/70">
                    ₱{commission.budget?.toLocaleString()}
                  </span>
                </div>
                {commission.deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-purple-400" />
                    <span className="text-[#f2e9dd]/70">
                      {new Date(commission.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Reference Images */}
              {commission.reference_images && commission.reference_images.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {commission.reference_images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded bg-[#2a2a2a] flex-shrink-0 overflow-hidden">
                      <img
                        src={img}
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {commission.reference_images.length > 3 && (
                    <div className="w-16 h-16 rounded bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center text-xs text-[#f2e9dd]/50">
                      +{commission.reference_images.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Status Actions (for artists) */}
              {getStatusActions(commission)}

              {/* View Details Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/commissions/${commission.id}`)}
                className="w-full mt-4"
              >
                View Details
                <ArrowRight size={14} className="ml-2" />
              </Button>

              {/* Timestamp */}
              <p className="text-xs text-[#f2e9dd]/40 mt-3">
                {new Date(commission.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommissionsPage;
