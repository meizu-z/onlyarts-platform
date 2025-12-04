import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { commissionService } from '../services';
import { API_CONFIG } from '../config/api.config';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LoadingPaint } from '../components/ui/LoadingStates';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Calendar,
  DollarSign,
  User,
  Mail,
  Image as ImageIcon,
  MessageCircle,
  Send
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

const CommissionDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchCommissionDetails();
    fetchMessages();
  }, [id]);

  const fetchCommissionDetails = async () => {
    try {
      setLoading(true);
      const response = await commissionService.getCommission(id);
      const commissionData = response.data || response;
      setCommission(commissionData);
    } catch (error) {
      console.error('Error fetching commission details:', error);
      toast.error('Failed to load commission details');
      navigate('/commissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await commissionService.getCommissionMessages?.(id);
      if (response) {
        setMessages(response.data || response || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await commissionService.updateCommissionStatus(id, newStatus);
      setCommission(prev => ({ ...prev, status: newStatus }));
      toast.success(`Commission status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update commission status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await commissionService.addCommissionMessage?.(id, newMessage);
      setNewMessage('');
      await fetchMessages();
      toast.success('Message sent!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: <Clock size={16} />
      },
      accepted: {
        label: 'Accepted',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: <CheckCircle size={16} />
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: <Loader size={16} />
      },
      completed: {
        label: 'Completed',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: <CheckCircle size={16} />
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <XCircle size={16} />
      },
      cancelled: {
        label: 'Cancelled',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: <XCircle size={16} />
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getStatusActions = () => {
    if (commission.artist_id !== user?.id) return null;
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
            onClick={() => handleStatusUpdate(status)}
            disabled={updatingStatus}
            className="capitalize"
          >
            {updatingStatus ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
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

  const isClient = commission?.client_id === user?.id;
  const isArtist = commission?.artist_id === user?.id;
  const otherParty = isClient
    ? {
        name: commission?.artist_name || commission?.artist_username,
        username: commission?.artist_username,
        image: commission?.artist_image,
        email: commission?.artist_email
      }
    : {
        name: commission?.client_name || commission?.client_username,
        username: commission?.client_username,
        image: commission?.client_image,
        email: commission?.client_email
      };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingPaint message="Loading commission details..." />
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-12 text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">Commission Not Found</h2>
          <p className="text-[#f2e9dd]/70 mb-6">This commission doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/commissions')}>Back to Commissions</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/commissions')}
        className="flex items-center gap-2 text-[#f2e9dd]/70 hover:text-[#f2e9dd] mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Commissions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd] mb-2">
                  {commission.title}
                </h1>
                <p className="text-[#f2e9dd]/60">
                  Commission #{commission.id}
                </p>
              </div>
              {getStatusBadge(commission.status)}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-purple-400" />
                <div>
                  <p className="text-xs text-[#f2e9dd]/50">Budget</p>
                  <p className="font-semibold text-[#f2e9dd]">
                    ₱{commission.budget?.toLocaleString()}
                  </p>
                </div>
              </div>
              {commission.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-purple-400" />
                  <div>
                    <p className="text-xs text-[#f2e9dd]/50">Deadline</p>
                    <p className="font-semibold text-[#f2e9dd]">
                      {new Date(commission.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Actions */}
            {getStatusActions()}
          </Card>

          {/* Description Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#f2e9dd] mb-3">Description</h2>
            <p className="text-[#f2e9dd]/70 whitespace-pre-wrap">
              {commission.description}
            </p>
          </Card>

          {/* Reference Images */}
          {commission.reference_images && commission.reference_images.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-[#f2e9dd] mb-3">Reference Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {commission.reference_images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-[#2a2a2a]">
                    <img
                      src={img}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(img, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Messages Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Messages
            </h2>

            {/* Messages List */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-center text-[#f2e9dd]/50 py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender_id === user?.id ? 'flex-row-reverse' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0">
                      {msg.sender_image ? (
                        <img
                          src={getImageUrl(msg.sender_image)}
                          alt={msg.sender_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        msg.sender_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className={`flex-1 ${msg.sender_id === user?.id ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#f2e9dd]">{msg.sender_name}</p>
                        <p className="text-xs text-[#f2e9dd]/40">
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div
                        className={`inline-block p-3 rounded-lg ${
                          msg.sender_id === user?.id
                            ? 'bg-purple-500/20 text-[#f2e9dd]'
                            : 'bg-[#2a2a2a] text-[#f2e9dd]/90'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 bg-[#1e1e1e] border border-white/10 rounded-lg text-[#f2e9dd] placeholder:text-[#f2e9dd]/40 focus:outline-none focus:border-purple-500"
              />
              <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                {sendingMessage ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Other Party Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[#f2e9dd] mb-4">
              {isClient ? 'Artist' : 'Client'}
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg flex-shrink-0">
                {otherParty.image ? (
                  <img
                    src={getImageUrl(otherParty.image)}
                    alt={otherParty.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  otherParty.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#f2e9dd]">{otherParty.name}</p>
                <p className="text-sm text-[#f2e9dd]/60">@{otherParty.username}</p>
              </div>
            </div>
            {otherParty.email && (
              <div className="flex items-center gap-2 text-sm text-[#f2e9dd]/70">
                <Mail size={16} className="text-purple-400" />
                {otherParty.email}
              </div>
            )}
            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => navigate(`/portfolio/${otherParty.username}`)}
            >
              View Profile
            </Button>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-[#f2e9dd] mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-purple-400 mt-0.5" />
                <div>
                  <p className="text-[#f2e9dd]/70">Created</p>
                  <p className="text-[#f2e9dd] font-medium">
                    {new Date(commission.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              {commission.updated_at !== commission.created_at && (
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-[#f2e9dd]/70">Last Updated</p>
                    <p className="text-[#f2e9dd] font-medium">
                      {new Date(commission.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommissionDetailsPage;
