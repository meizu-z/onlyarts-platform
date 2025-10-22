import React, { useState } from 'react';
import { Send, Search } from 'lucide-react';
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#f2e9dd] mb-6">Messages</h1>
      <Card className="h-[75vh] flex" noPadding>
        {/* Contacts List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
             <div className="relative">
                <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search contacts..." 
                  className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-2 pl-10 text-[#f2e9dd] focus:outline-none focus:ring-1 focus:ring-[#7C5FFF]" 
                />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map(contact => (
              <div 
                key={contact.id}
                onClick={() => setActiveChat(contact)}
                className={`flex items-center gap-4 p-4 cursor-pointer border-b border-white/5 ${activeChat.id === contact.id ? 'bg-white/5' : 'hover:bg-white/5'}`}>
                <div className="relative w-12 h-12 rounded-full flex-shrink-0">
                  <img src={contact.avatarUrl} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                  {contact.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1e1e1e]"></span>}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white truncate">{contact.name}</p>
                    {contact.unread && <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">{contact.unread}</span>}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.isYou ? 'justify-end' : 'justify-start'}`}>
                 {!msg.isYou && 
                    <div className="w-8 h-8 rounded-full flex-shrink-0">
                        <img src={activeChat.avatarUrl} alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                 } 
                 <div className={`max-w-md px-4 py-3 rounded-2xl ${msg.isYou ? 'bg-[#3a3a3a] text-gray-200' : 'bg-[#2a2a2a] text-gray-300'}`}>
                  <p>{msg.text}</p>
                  <p className="text-xs text-right mt-2 opacity-50">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${activeChat.name}...`}
                className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]"
              />
              <Button type="submit" variant="primary" size="icon">
                <Send size={20} />
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { ChatPage };
