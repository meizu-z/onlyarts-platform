import React, { useState, useEffect } from 'react';
import { Send, Search, Menu, X, ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ChatPage = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'meizzuuuuuuu', avatarUrl: 'https://i.pravatar.cc/150?u=meizzuuuuuuu', online: true, lastMessage: 'Right? By the way, are you going...', unread: 2 },
    { id: 2, name: 'jnorman', avatarUrl: 'https://i.pravatar.cc/150?u=jnorman', online: false, lastMessage: 'Definitely! I wouldn\'t miss it...' },
    { id: 3, name: 'artist1', avatarUrl: 'https://i.pravatar.cc/150?u=artist1', online: true, lastMessage: 'Thanks for the support!' },
    { id: 4, name: 'SarahChen', avatarUrl: 'https://i.pravatar.cc/150?u=SarahChen', online: false, lastMessage: 'See you there.' },
    { id: 5, name: 'MikeJ', avatarUrl: 'https://i.pravatar.cc/150?u=MikeJ', online: true, lastMessage: 'Sounds good.' },
  ]);
  const [activeChat, setActiveChat] = useState(contacts[0]);

  const [messages, setMessages] = useState([
    { id: 1, user: 'meizzuuuuuuu', text: 'Hey, did you see that new digital art piece by @artist1? It\'s amazing!', timestamp: '10:00 AM', isYou: false },
    { id: 2, user: 'jnorman', text: 'Yeah, I saw it! The colors are incredible. I wish I could afford it.', timestamp: '10:01 AM', isYou: true },
    { id: 3, user: 'meizzuuuuuuu', text: 'Right? By the way, are you going to the virtual exhibition next week?', timestamp: '10:02 AM', isYou: false },
    { id: 4, user: 'jnorman', text: 'Definitely! I wouldn\'t miss it for the world. Maybe we can catch up there.', timestamp: '10:03 AM', isYou: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const newMsg = {
      id: messages.length + 1,
      user: 'jnorman',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isYou: true,
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  const handleContactClick = (contact) => {
    setActiveChat(contact);
    setIsSidebarOpen(false); // Close sidebar on mobile when selecting a contact
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd]">Messages</h1>
        {/* Mobile menu toggle - only visible on mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 text-[#f2e9dd] hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Toggle contacts"
        >
          <Menu size={24} />
        </button>
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
            <div className="relative">
              <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
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
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 cursor-pointer border-b border-white/5 transition-colors ${activeChat.id === contact.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
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
          {/* Chat header - mobile back button */}
          <div className="md:hidden flex items-center gap-3 p-3 border-b border-white/10 bg-[#1a1a1a]">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-[#f2e9dd] hover:bg-white/5 rounded-lg transition-colors -ml-2"
              aria-label="Open contacts"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative w-8 h-8 rounded-full flex-shrink-0">
              <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
              {activeChat.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1a1a1a]"></span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-white truncate">{activeChat.name}</p>
              <p className="text-xs text-gray-400">{activeChat.online ? 'Online' : 'Offline'}</p>
            </div>
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
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${activeChat.name}...`}
                className="flex-1 bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-2.5 md:p-3 text-sm md:text-base text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]"
              />
              <Button type="submit" variant="primary" size="icon" className="flex-shrink-0 w-10 h-10 md:w-auto md:h-auto">
                <Send size={18} className="md:w-5 md:h-5" />
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { ChatPage };
