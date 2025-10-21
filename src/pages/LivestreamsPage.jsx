import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Users, Calendar } from 'lucide-react';

const LivestreamsPage = () => { 
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');
  const [selectedStream, setSelectedStream] = useState(null);

  // Updated primary streams with custom content/usernames
  const streams = [
    {
      artist: 'meizzuuuuuuu', // YOUR USERNAME
      title: 'Digital Painting Process',
      viewers: 987,
      live: true,
      thumbnail: '💻',
      profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
      followers: '2.1M',
      description: 'Join me as I create a new digital masterpiece from scratch!'
    },
    {
      artist: 'jnorman', // YOUR USERNAME
      title: 'Sculpting in VR',
      viewers: 654,
      live: true,
      thumbnail: '🗿',
      profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg',
      followers: '950K',
      description: 'Exploring new forms and textures in virtual reality.'
    },
    { artist: 'AbstractFlow', title: 'Watercolor Tutorial', viewers: 234, live: false, scheduled: 'Tomorrow 8PM', thumbnail: '💧', profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg', followers: '300K' },
    { artist: 'ArtistThree', title: 'Abstract Painting', viewers: 789, live: true, thumbnail: '🖌️', profilePicture: 'https://randomuser.me/api/portraits/men/47.jpg', followers: '500K' },
  ];

  // The 'newStreams' array is now merged into the main 'streams' array for simplicity,
  // making the final mapping logic cleaner.
  
  // Filter streams based on the active tab (Live vs. Scheduled)
  const displayStreams = streams.filter(s => activeTab === 'live' ? s.live : !s.live);

  return (
    <div className="flex-1">
      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-8">Livestreams</h1>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-white/10 mb-8">
        {[
          { key: 'live', label: 'Live Now' },
          { key: 'scheduled', label: 'Scheduled' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-4 text-lg transition-all duration-300 ${
              activeTab === tab.key
                ? 'text-[#f2e9dd]'
                : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
            )}
          </button>
        ))}
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayStreams.map((stream, idx) => (
          <Card
            key={idx}
            hover
            className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
            onClick={() => setSelectedStream(stream)}
          >
            <div className="relative overflow-hidden rounded-t-2xl">
              <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl">
                {/* Fallback emoji thumbnail */}
                {!stream.live && stream.thumbnail} 
              </div>
              {stream.live && (
                <>
                  <img 
                    src={stream.profilePicture} 
                    alt={`${stream.artist}'s profile`} 
                    className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-50" />
                  
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    LIVE
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-lg">
                    <Users size={12} className="animate-pulse" /> {stream.viewers.toLocaleString()}
                  </div>
                </>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                {stream.title}
              </h3>

              <p className="text-sm text-[#f2e9dd]/50 mb-2">@{stream.artist}</p>
              <div className="flex items-center gap-2 text-sm text-[#f2e9dd]/70 mb-2">
                <img src={stream.profilePicture} alt={`${stream.artist}'s profile`} className="w-6 h-6 rounded-full object-cover" />
                <span className="font-medium">@{stream.artist}</span>
                {stream.followers && (
                  <>
                    <span className="text-[#f2e9dd]/30">·</span>
                    <span>{stream.followers} followers</span>
                  </>
                )}
              </div> 
              {stream.scheduled && (
                <p className="text-sm text-[#B15FFF] flex items-center gap-1">
                  <Calendar size={14} /> {stream.scheduled}
                </p>
              )}
              {stream.live && (
                <div 
                  className="w-full mt-3 bg-gradient-to-r from-red-600 to-[#FF5F9E] transform hover:scale-105 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 rounded-lg text-center text-white font-bold py-2"
                  onClick={(e) => { e.stopPropagation(); setSelectedStream(stream); }}
                >
                  Join Stream
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Stream Modal */}
      {selectedStream && (
        <Modal isOpen={!!selectedStream} onClose={() => setSelectedStream(null)} title={`Live: ${selectedStream.title}`}>
          <div className="flex flex-col lg:flex-row min-h-[70vh]">
            {/* Video Section */}
            <div className="flex-1 bg-black relative flex items-center justify-center min-h-[300px]">
              <div className="text-white text-2xl">Mock Video Stream for {selectedStream.artist}</div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <img src={selectedStream.profilePicture} alt={`${selectedStream.artist}'s profile`} className="w-32 h-32 rounded-full object-cover animate-pulse" />
              </div>
            </div>

            {/* Info and Chat Section */}
            <div className="w-full lg:w-80 bg-[#1c1c22] p-4 flex flex-col">
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <img src={selectedStream.profilePicture} alt={`${selectedStream.artist}'s profile`} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xl font-bold text-[#f2e9dd]">@{selectedStream.artist}</h3>
                    <p className="text-sm text-[#f2e9dd]/70">{selectedStream.followers} followers</p>
                  </div>
                </div>
                <p className="text-sm text-[#f2e9dd]/80">{selectedStream.description || selectedStream.title}</p>
              </div>

              {/* Chat Box */}
              <div className="flex-1 flex flex-col bg-[#2a2a35] rounded-lg p-3 mb-4 overflow-y-auto space-y-1">
                <div className="text-xs text-[#f2e9dd]/60 mb-2">Welcome to the chat!</div>
                {/* Mock Messages */}
                <div className="text-sm"><span className="font-semibold text-[#7C5FFF]">User1:</span> Awesome stream!</div>
                <div className="text-sm"><span className="font-semibold text-[#FF5F9E]">User2:</span> Love the colors!</div>
                <div className="text-sm"><span className="font-semibold text-[#f2e9dd]">You:</span> Looking good!</div>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <input type="text" placeholder="Chat..." className="flex-1 bg-[#3b3b4d] text-[#f2e9dd] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]" />
                <Button size="sm" className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E]">Send</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export { LivestreamsPage };
