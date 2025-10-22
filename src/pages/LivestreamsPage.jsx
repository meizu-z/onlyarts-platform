import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Users, Clock, ArrowLeft } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const LivestreamsPage = () => {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedStream, setSelectedStream] = useState(null);
  const [comments, setComments] = useState([
    {
      user: 'ArtLover_22',
      comment: 'This is breathtaking!',
      profilePicture: 'https://randomuser.me/api/portraits/women/11.jpg',
    },
    {
      user: 'NFTCollector_1',
      comment: 'bids $500',
      isBid: true,
      profilePicture: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  const streams = [
    {
      artist: 'meizzuuuuuuu',
      title: 'Digital Painting Process',
      viewers: 987,
      live: true,
      auction: true,
      thumbnail: '💻',
      profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg',
      followers: '2.1M',
      description: 'Join me as I create a new digital masterpiece from scratch!',
    },
    {
      artist: 'jnorman',
      title: 'Sculpting in VR',
      viewers: 654,
      live: true,
      auction: false,
      thumbnail: '🗿',
      profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg',
      followers: '950K',
      description: 'Exploring new forms and textures in virtual reality.',
    },
    {
      artist: 'AbstractFlow',
      title: 'Watercolor Tutorial',
      viewers: 234,
      live: false,
      scheduled: 'Tomorrow 8PM',
      thumbnail: '💧',
      profilePicture: 'https://randomuser.me/api/portraits/women/68.jpg',
      followers: '300K',
    },
    {
      artist: 'ArtistThree',
      title: 'Abstract Painting',
      viewers: 789,
      live: true,
      auction: true,
      thumbnail: '🖌️',
      profilePicture: 'https://randomuser.me/api/portraits/men/47.jpg',
      followers: '500K',
    },
  ];

  const displayStreams = streams.filter(s => (activeTab === 'live' ? s.live : !s.live));

  const handleCommentSubmit = e => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          user: 'You',
          comment: newComment,
          profilePicture: 'https://randomuser.me/api/portraits/lego/1.jpg',
        },
      ]);
      setNewComment('');
    }
  };

  const handleBidSubmit = e => {
    e.preventDefault();
    if (bidAmount.trim() && !isNaN(bidAmount)) {
      const newBid = {
        user: 'You',
        comment: `bids $${bidAmount}`,
        isBid: true,
        profilePicture: 'https://randomuser.me/api/portraits/lego/1.jpg',
      };
      setComments([...comments, newBid]);
      setBidAmount('');
      setIsBidding(false);
    }
  };

  if (selectedStream) {
    return (
      <div className="flex-1 animate-fadeIn">
        <Button onClick={() => setSelectedStream(null)} className="mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Livestreams
        </Button>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3">
            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center text-8xl text-white mb-4">
              {selectedStream.thumbnail}
            </div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-[#f2e9dd]">
                {selectedStream.title}
              </h1>
              {selectedStream.auction && (
                <Button
                  onClick={() => setIsBidding(true)}
                  className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg hover:scale-105"
                >
                  Place Bid
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <img
                src={selectedStream.profilePicture}
                alt={selectedStream.artist}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-semibold text-lg text-[#f2e9dd]">
                  {selectedStream.artist}
                </p>
                <p className="text-sm text-[#f2e9dd]/60">
                  {selectedStream.followers} Followers
                </p>
              </div>
            </div>
            <p className="text-[#f2e9dd]/70 mt-4">
              {selectedStream.description}
            </p>
          </div>

          <div className="lg:w-1/3">
            <Card className="h-full flex flex-col">
              <h2 className="text-2xl font-bold text-[#f2e9dd] mb-4 border-b border-white/10 pb-3">
                Live Chat & Bids
              </h2>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-2 rounded-lg ${comment.isBid ? 'bg-yellow-500/10' : ''
                      }`}
                  >
                    <img
                      src={comment.profilePicture}
                      alt={comment.user}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm text-[#f2e9dd]">
                        {comment.user}
                        {comment.isBid && (
                          <span className="ml-2 text-xs font-bold text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded-md">
                            BIDDER
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-sm ${
                          comment.isBid
                            ? 'text-yellow-300 font-bold'
                            : 'text-[#f2e9dd]/80'
                          }`}
                      >
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Say something..."
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-white/20 rounded-md text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF]"
                />
                <Button type="submit" size="sm">
                  Send
                </Button>
              </form>
            </Card>
          </div>
        </div>
        {selectedStream.auction && isBidding && (
          <Modal
            isOpen={isBidding}
            onClose={() => setIsBidding(false)}
            title="Place Your Bid"
          >
            <form onSubmit={handleBidSubmit}>
              <input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder="Enter bid amount"
                className="w-full px-4 py-2 bg-[#1e1e1e] border border-white/20 rounded-md text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF]"
              />
              <Button type="submit" className="mt-4 w-full">
                Submit Bid
              </Button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h1 className="text-4xl font-bold text-[#f2e9dd] mb-8">Livestreams</h1>

      <div className="flex border-b border-white/10 mb-6">
        <button
          className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${
            activeTab === 'live'
              ? 'text-[#f2e9dd] border-b-2 border-[#7C5FFF]'
              : 'text-[#f2e9dd]/60 hover:text-[#f2e9dd]'
            }`}
          onClick={() => setActiveTab('live')}
        >
          Live
        </button>
        <button
          className={`px-6 py-3 text-lg font-medium transition-colors duration-300 ${
            activeTab === 'scheduled'
              ? 'text-[#f2e9dd] border-b-2 border-[#7C5FFF]'
              : 'text-[#f2e9dd]/60 hover:text-[#f2e9dd]'
            }`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayStreams.map((stream, idx) => (
          <Card
            key={idx}
            hover
            noPadding
            className="group cursor-pointer"
            onClick={() => setSelectedStream(stream)}
          >
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-teal-600/20 flex items-center justify-center text-6xl">
                {stream.thumbnail}
              </div>
              <div className="absolute top-2 left-2 flex gap-2">
                {stream.live ? (
                  <>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold flex items-center gap-1">
                      <Wifi size={12} />
                      LIVE
                    </span>
                    <span className="px-2 py-0.5 bg-black/50 text-white rounded-md text-xs font-bold flex items-center gap-1">
                      <Users size={12} />
                      {stream.viewers}
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold flex items-center gap-1">
                    <Clock size={12} />
                    {stream.scheduled}
                  </span>
                )}
              </div>
              {stream.auction && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#7C5FFF] text-white rounded-md text-xs font-bold">
                  AUCTION
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#f2e9dd] mb-1 group-hover:text-[#7C5FFF] transition-colors">
                {stream.title}
              </h3>
              <div className="flex items-center gap-3">
                <img
                  src={stream.profilePicture}
                  alt={stream.artist}
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-sm text-[#f2e9dd]/80">{stream.artist}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export { LivestreamsPage };
