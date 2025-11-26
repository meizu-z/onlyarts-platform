import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Search, Menu, X, ArrowLeft, Video, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { chatService, mockContacts, mockMessages } from '../services/chat.service';
import socketService from '../services/socket.service';
import PremiumBadge from '../components/common/PremiumBadge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { API_CONFIG } from '../config/api.config';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = false;

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const isPremium = user?.subscription === 'premium';

  // Fetch conversations on mount and setup WebSocket
  useEffect(() => {
    fetchConversations();

    // Connect to chat socket if not in demo mode
    if (!USE_DEMO_MODE && user) {
      const token = localStorage.getItem(API_CONFIG.tokenKey);
      if (token) {
        socketService.connectChat(token);

        // Listen for new messages
        socketService.onNewMessage((message) => {
          console.log('New message received:', message);
          setMessages(prev => [...prev, {
            id: message.id,
            senderId: message.sender_id,
            user: message.username,
            text: message.content,
            timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isYou: message.sender_id === user.id
          }]);
        });

        // Listen for typing indicators
        socketService.onUserTyping(({ userId }) => {
          if (activeChat && userId !== user.id) {
            setIsTyping(true);
          }
        });

        socketService.onUserStopTyping(({ userId }) => {
          if (userId !== user.id) {
            setIsTyping(false);
          }
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (!USE_DEMO_MODE) {
        socketService.disconnectChat();
      }
    };
  }, []);

  // Fetch messages when active chat changes and join socket room
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);

      // Join conversation room via WebSocket
      if (!USE_DEMO_MODE) {
        socketService.joinConversation(activeChat.id);
        socketService.markAsRead(activeChat.id);
      }
    }

    // Leave previous conversation room
    return () => {
      if (activeChat && !USE_DEMO_MODE) {
        socketService.leaveConversation(activeChat.id);
      }
    };
  }, [activeChat]);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setContacts(mockContacts);
        // Don't auto-select chat - show conversation list first for privacy
        setActiveChat(null);
        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      const response = await chatService.getConversations();
      const conversations = response.conversations || response;
      setContacts(conversations);
      // Don't auto-select chat - show conversation list first for privacy
      setActiveChat(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setMessages(mockMessages[conversationId] || []);
        return;
      }

      // REAL API MODE: Call backend
      const response = await chatService.getMessages(conversationId);
      const rawMessages = response.messages || response;

      // Transform messages to match UI format
      const transformedMessages = rawMessages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId || msg.sender_id,
        user: msg.senderUsername || msg.sender_username || 'Unknown',
        text: msg.content,  // Backend uses 'content', UI expects 'text'
        timestamp: new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isYou: (msg.senderId || msg.sender_id) === user.id
      }));

      setMessages(transformedMessages);

      // Mark as read
      await chatService.markAsRead(conversationId);

      // Update contact unread count
      setContacts(prev => prev.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ));
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !activeChat) return;

    const tempMessage = {
      id: Date.now(),
      senderId: 'current_user',
      user: 'You',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isYou: true,
    };

    // Optimistic UI update
    setMessages([...messages, tempMessage]);
    const messageText = newMessage;
    setNewMessage('');

    // Stop typing indicator
    if (!USE_DEMO_MODE) {
      socketService.stopTyping(activeChat.id);
    }

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        toast.success('Message sent!');
        return;
      }

      // REAL API MODE: Send via WebSocket
      socketService.sendMessage(activeChat.id, messageText);

    } catch (error) {
      // Revert on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(messageText);
      toast.error('Failed to send message. Please try again.');
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (USE_DEMO_MODE || !activeChat) return;

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    socketService.sendTyping(activeChat.id);

    // Stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      socketService.stopTyping(activeChat.id);
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleContactClick = (contact) => {
    setActiveChat(contact);
    setIsSidebarOpen(false); // Close sidebar on mobile when selecting a contact
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      fetchConversations();
      return;
    }

    try {
      // DEMO MODE: Filter mock data
      if (USE_DEMO_MODE) {
        const filtered = mockContacts.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase())
        );
        setContacts(filtered);
        return;
      }

      // REAL API MODE: Call backend search
      const response = await chatService.searchConversations(query);
      setContacts(response.conversations || response);
    } catch (error) {
      console.error('Error searching conversations:', error);
      toast.error('Failed to search conversations');
    }
  };

  if (loading) {
    return (
      <div className="p-3 md:p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Messages</h1>
        <LoadingPaint message="Loading conversations..." />
        <div className="mt-8">
          <SkeletonGrid count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 md:p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd] mb-4 md:mb-6">Messages</h1>
        <APIError error={error} retry={fetchConversations} />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd]">Messages</h1>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Consultations Button */}
          <Button
            onClick={() => navigate('/consultations')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2"
            size="sm"
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Consultations</span>
          </Button>
          {/* Mobile menu toggle - only visible on mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-[#f2e9dd] hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Toggle contacts"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <Card className="h-[calc(100vh-180px)] md:h-[75vh] flex relative overflow-hidden" noPadding>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Contacts List - Desktop sidebar / Mobile drawer */}
        <div className={`
          fixed md:relative top-0 left-0 h-full md:h-auto
          w-[85%] sm:w-80 md:w-1/3
          bg-[#1a1a1a] md:bg-transparent
          border-r border-white/10 flex flex-col
          transform transition-transform duration-300 ease-in-out z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Mobile drawer header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-[#f2e9dd]">Contacts</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-[#f2e9dd] hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close contacts"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 md:p-4 border-b border-white/10">
            <div className="relative z-10">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-2 pl-9 text-sm md:text-base text-[#f2e9dd] focus:outline-none focus:ring-1 focus:ring-[#7C5FFF]"
              />
            </div>
          </div>

          {/* Contacts list */}
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 cursor-pointer border-b border-white/5 transition-colors ${activeChat?.id === contact.id ? 'bg-white/10' : 'hover:bg-white/5'} relative z-10`}>
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0">
                  <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                  {contact.online && <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 rounded-full border-2 border-[#1a1a1a]"></span>}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-semibold text-sm md:text-base text-white truncate">{contact.name}</p>
                    {contact.unread && <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold flex-shrink-0">{contact.unread}</span>}
                  </div>
                  <p className="text-xs md:text-sm text-gray-400 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChat ? (
            <>
              {/* Chat header - mobile/desktop */}
              <div className="flex items-center justify-between gap-3 p-3 md:p-4 border-b border-white/10 bg-[#1a1a1a] md:bg-transparent">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 text-[#f2e9dd] hover:bg-white/5 rounded-lg transition-colors -ml-2"
                    aria-label="Open contacts"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0">
                    <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
                    {activeChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a1a1a]"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm md:text-base text-white truncate">{activeChat.name}</p>
                      {activeChat.isPremium && <PremiumBadge tier="premium" size="sm" showLabel={false} />}
                    </div>
                    <p className="text-xs text-gray-400">
                      {isTyping ? 'typing...' : activeChat.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* Consultation Button - Premium Only */}
                {isPremium && activeChat.isArtist && (
                  <Button
                    onClick={() => {
                      toast.info('Opening 1v1 Consultations...');
                      setTimeout(() => navigate('/consultations'), 800);
                    }}
                    size="sm"
                    variant="secondary"
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Video size={16} />
                    <span className="hidden sm:inline">Book 1v1</span>
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 md:gap-3 ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isYou &&
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0">
                        <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
                      </div>
                    }
                    <div className={`max-w-[75%] md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-2xl ${msg.isYou ? 'bg-[#3a3a3a] text-gray-200' : 'bg-[#2a2a2a] text-gray-300'}`}>
                      <p className="text-sm md:text-base break-words">{msg.text}</p>
                      <p className="text-xs text-right mt-1 md:mt-2 opacity-50">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message input - fixed at bottom with bottom nav padding */}
              <div className="p-3 md:p-4 border-t border-white/10 bg-[#1a1a1a] md:bg-transparent pb-safe">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 md:gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder={`Message ${activeChat.name}...`}
                    className="flex-1 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-2.5 md:p-3 text-sm md:text-base text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]"
                  />
                  <Button type="submit" variant="primary" size="icon" className="flex-shrink-0 w-10 h-10 md:w-auto md:h-auto">
                    <Send size={18} className="md:w-5 md:h-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#f2e9dd]/50 p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Search size={32} className="text-[#f2e9dd]/30" />
                </div>
                <h3 className="text-xl font-semibold text-[#f2e9dd] mb-2">Your Messages</h3>
                <p className="text-sm text-[#f2e9dd]/60">
                  Select a conversation from the list to start messaging
                </p>
                {contacts.length === 0 && (
                  <p className="text-sm text-[#f2e9dd]/40 mt-4">
                    No conversations yet. Start chatting with artists!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export { ChatPage };
