import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, Calendar } from 'lucide-react';

const LivestreamsPage = () => { 
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('live');

  const streams = [
    { artist: 'ArtistOne', title: 'Creating Digital Landscapes', viewers: 1234, live: true, thumbnail: '🎨' },
    { artist: 'ArtistTwo', title: 'Portrait Drawing Session', viewers: 456, live: true, thumbnail: '✏️' },
    { artist: 'ArtistThree', title: 'Abstract Painting', viewers: 789, live: true, thumbnail: '🖌️' },
    { artist: 'ArtistFour', title: 'Watercolor Tutorial', viewers: 234, live: false, scheduled: 'Tomorrow 8PM', thumbnail: '💧' },
  ];

  const filteredStreams = streams.filter(s => activeTab === 'live' ? s.live : !s.live);

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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStreams.map((stream, idx) => (
          <Card 
            key={idx} 
            hover
            className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="relative overflow-hidden rounded-t-2xl">
              <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl">
                <span className="transform group-hover:scale-110 transition-transform duration-300">
                  {stream.thumbnail}
                </span>
              </div>
              {stream.live && (
                <>
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    LIVE
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1 shadow-lg">
                    <Users size={12} className="animate-pulse" /> {stream.viewers}
                  </div>
                </>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                {stream.title}
              </h3>
              <p className="text-sm text-[#f2e9dd]/50 mb-2">@{stream.artist}</p>
              {stream.scheduled && (
                <p className="text-sm text-[#B15FFF] flex items-center gap-1">
                  <Calendar size={14} /> {stream.scheduled}
                </p>
              )}
              {stream.live && (
                <Button 
                  size="sm" 
                  className="w-full mt-3 bg-gradient-to-r from-red-600 to-[#FF5F9E] transform hover:scale-105 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50" 
                  onClick={() => navigate('/livestreams')}
                >
                  Join Stream
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { LivestreamsPage };