import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Video, MessageCircle, Lock, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { LoadingPaint } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { consultationService, mockArtists, mockConsultations, mockTimeSlots } from '../services/consultation.service';
import PremiumBadge from '../components/common/PremiumBadge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

// Demo mode flag
const USE_DEMO_MODE = true;

const ConsultationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artists, setArtists] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [topic, setTopic] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Check if user is premium
  const isPremium = user?.subscription === 'premium';

  useEffect(() => {
    if (!isPremium) {
      toast.error('1v1 Consultations are only available for Premium members');
      setTimeout(() => navigate('/subscriptions'), 2000);
      return;
    }
    fetchData();
  }, [isPremium, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        if (activeTab === 'browse') {
          setArtists(mockArtists);
        } else {
          setConsultations(mockConsultations);
        }

        setLoading(false);
        return;
      }

      // REAL API MODE
      if (activeTab === 'browse') {
        const response = await consultationService.getAvailableArtists();
        setArtists(response.artists || []);
      } else {
        const response = await consultationService.getMyConsultations();
        setConsultations(response.consultations || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (artist) => {
    setSelectedArtist(artist);
    setIsBookingModalOpen(true);

    try {
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setTimeSlots(mockTimeSlots);
        return;
      }

      const response = await consultationService.getArtistAvailability(artist.id);
      setTimeSlots(response.slots || []);
    } catch (err) {
      toast.error('Failed to load availability');
    }
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot || !topic.trim()) {
      toast.error('Please select a time slot and provide a topic');
      return;
    }

    try {
      if (USE_DEMO_MODE) {
        toast.success('Consultation booked! Check your email for confirmation.');
        setIsBookingModalOpen(false);
        setSelectedArtist(null);
        setSelectedSlot(null);
        setTopic('');
        setActiveTab('my-bookings');
        return;
      }

      await consultationService.bookConsultation({
        artistId: selectedArtist.id,
        slotId: selectedSlot.id,
        topic: topic,
      });

      toast.success('Consultation booked successfully!');
      setIsBookingModalOpen(false);
      setSelectedArtist(null);
      setSelectedSlot(null);
      setTopic('');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to book consultation');
    }
  };

  const handleJoinCall = (consultation) => {
    if (USE_DEMO_MODE) {
      toast.info('Opening video call...');
      setTimeout(() => {
        window.open(consultation.meetingLink, '_blank');
      }, 1000);
      return;
    }

    consultationService.joinConsultation(consultation.id)
      .then(response => {
        window.open(response.callUrl, '_blank');
      })
      .catch(err => {
        toast.error('Failed to join call');
      });
  };

  if (!isPremium) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md text-center p-8">
          <Lock size={48} className="mx-auto mb-4 text-[#f2e9dd]/50" />
          <h2 className="text-2xl font-bold text-[#f2e9dd] mb-2">Premium Feature</h2>
          <p className="text-[#f2e9dd]/70 mb-6">
            1v1 Artist Consultations are exclusively available for Premium members.
          </p>
          <Button onClick={() => navigate('/subscriptions')} className="w-full">
            Upgrade to Premium
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1">
        <LoadingPaint message="Loading consultations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1">
        <APIError error={error} retry={fetchData} />
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-4xl font-bold text-[#f2e9dd]">1v1 Consultations</h1>
            <PremiumBadge tier="premium" size="md" />
          </div>
          <p className="text-sm md:text-base text-[#f2e9dd]/70">
            Book private sessions with expert artists
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
        {[
          { key: 'browse', label: 'Browse Artists' },
          { key: 'my-bookings', label: 'My Bookings' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative pb-3 md:pb-4 text-base md:text-lg whitespace-nowrap transition-all duration-300 ${
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

      {/* Browse Artists */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} hover className="p-4 md:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{artist.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#f2e9dd] mb-1">{artist.name}</h3>
                  <p className="text-sm text-[#f2e9dd]/60 mb-2">{artist.username}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={14} className="fill-current" />
                      <span>{artist.rating}</span>
                    </div>
                    <span className="text-[#f2e9dd]/50">({artist.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-[#7C5FFF] mb-2">{artist.specialty}</p>
                <p className="text-sm text-[#f2e9dd]/70 mb-3">{artist.description}</p>

                <div className="flex items-center gap-2 text-sm text-[#f2e9dd]/60 mb-3">
                  <Clock size={14} />
                  <span>{artist.availability}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {artist.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 bg-[#f2e9dd]/10 rounded-full text-[#f2e9dd]/80"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#f2e9dd]">
                    ${artist.hourlyRate}/hr
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleBookClick(artist)}
                className="w-full bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E]"
              >
                Book Session
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* My Bookings */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4 md:space-y-6">
          {consultations.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-[#f2e9dd]/50" />
              <h3 className="text-xl font-bold text-[#f2e9dd] mb-2">No bookings yet</h3>
              <p className="text-[#f2e9dd]/70 mb-4">
                Browse our expert artists and book your first consultation
              </p>
              <Button onClick={() => setActiveTab('browse')}>Browse Artists</Button>
            </Card>
          ) : (
            consultations.map((consultation) => (
              <Card key={consultation.id} className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{consultation.artist.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-[#f2e9dd]">
                          {consultation.artist.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          consultation.status === 'upcoming'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {consultation.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-[#f2e9dd]/60 mb-2">{consultation.topic}</p>
                      <div className="flex items-center gap-4 text-sm text-[#f2e9dd]/70">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{consultation.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{consultation.time}</span>
                        </div>
                      </div>
                      {consultation.notes && (
                        <p className="text-xs text-[#f2e9dd]/50 mt-2 italic">
                          Note: {consultation.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {consultation.status === 'upcoming' && (
                      <Button
                        onClick={() => handleJoinCall(consultation)}
                        className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        <Video size={16} className="mr-2" />
                        Join Call
                      </Button>
                    )}
                    {consultation.status === 'completed' && consultation.rating && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-lg">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">
                          Rated {consultation.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedArtist(null);
          setSelectedSlot(null);
          setTopic('');
        }}
        title={`Book Session with ${selectedArtist?.name}`}
      >
        <div className="space-y-6">
          {/* Time Slots */}
          <div>
            <label className="block text-sm font-semibold text-[#f2e9dd] mb-3">
              Select Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    !slot.available
                      ? 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
                      : selectedSlot?.id === slot.id
                      ? 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] border-transparent text-white'
                      : 'bg-[#1e1e1e] border-white/20 text-[#f2e9dd] hover:border-[#7C5FFF]'
                  }`}
                >
                  <div className="text-xs mb-1">{slot.date}</div>
                  <div className="text-sm font-semibold">{slot.time}</div>
                  {selectedSlot?.id === slot.id && (
                    <Check size={14} className="mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-[#f2e9dd] mb-2">
              What would you like to discuss?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Portfolio review, NFT strategy, career guidance..."
              className="w-full px-4 py-3 bg-[#1e1e1e] border border-white/20 rounded-lg text-[#f2e9dd] focus:outline-none focus:border-[#7C5FFF] resize-none"
              rows={4}
            />
          </div>

          {/* Topics Suggestions */}
          {selectedArtist && (
            <div>
              <label className="block text-sm font-semibold text-[#f2e9dd] mb-2">
                Suggested Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedArtist.topics.map((suggestedTopic, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTopic(suggestedTopic)}
                    className="text-xs px-3 py-1.5 bg-[#7C5FFF]/20 hover:bg-[#7C5FFF]/30 rounded-full text-[#7C5FFF] transition-colors"
                  >
                    {suggestedTopic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Summary */}
          {selectedArtist && (
            <div className="bg-[#1e1e1e] rounded-lg p-4 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#f2e9dd]/70">Session Rate</span>
                <span className="text-lg font-bold text-[#f2e9dd]">
                  ${selectedArtist.hourlyRate}
                </span>
              </div>
              <p className="text-xs text-[#f2e9dd]/50">
                1-hour private video consultation
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setIsBookingModalOpen(false);
                setSelectedArtist(null);
                setSelectedSlot(null);
                setTopic('');
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={!selectedSlot || !topic.trim()}
              className="flex-1 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E]"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { ConsultationPage };
