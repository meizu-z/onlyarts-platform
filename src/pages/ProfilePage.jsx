import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { EmptyArtworks, EmptyFollowers, EmptyFollowing } from '../components/ui/EmptyStates';
import { LoadingPaint, SkeletonGrid } from '../components/ui/LoadingStates';
import { APIError } from '../components/ui/ErrorStates';
import { profileService, mockProfileData, mockArtworks, mockExhibitions, mockFollowers, mockFollowing, mockSavedItems } from '../services/profile.service';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Users, Heart, MessageCircle, Settings as SettingsIcon, Share2, Sparkles, ArrowLeft, Plus, Bookmark, Image, Calendar } from 'lucide-react';

// Demo mode flag - set to false when backend is ready
const USE_DEMO_MODE = true;

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('shared_artworks');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  // API state management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isOwnProfile = user?.username === username;

  // Fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data
      if (USE_DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get profile data based on current user or username param
        let profile;
        if (isOwnProfile) {
          // Use current user's data
          if (user?.role === 'artist') {
            profile = mockProfileData.artist;
          } else if (user?.subscription === 'premium') {
            profile = mockProfileData.premium;
          } else {
            profile = mockProfileData.basic;
          }
          profile.username = user.username;
        } else {
          // Use mock data for other users
          profile = mockProfileData.artist;
          profile.username = username;
        }

        setProfileData(profile);
        setEditedBio(profile.bio);
        setArtworks(mockArtworks);
        setExhibitions(mockExhibitions);
        setFollowers(mockFollowers);
        setFollowing(mockFollowing);
        setSavedForLater(mockSavedItems);

        // Load shared posts from localStorage for own profile
        if (isOwnProfile) {
          const posts = JSON.parse(localStorage.getItem('sharedPosts') || '[]');
          setSharedPosts(posts);
        }

        // Set initial tab
        if (isOwnProfile) {
          if (profile.isArtist) {
            setActiveTab('portfolio');
          } else {
            setActiveTab('shared_artworks');
          }
        } else {
          setActiveTab(profile.isArtist ? 'portfolio' : 'shared_artworks');
        }

        setLoading(false);
        return;
      }

      // REAL API MODE: Call backend
      const targetUsername = username || user?.username;
      const response = await profileService.getProfile(targetUsername);

      setProfileData(response.profile);
      setEditedBio(response.profile.bio);

      // Fetch user's content
      const [artworksData, exhibitionsData, followersData, followingData] = await Promise.all([
        profileService.getUserArtworks(targetUsername),
        profileService.getUserExhibitions(targetUsername),
        profileService.getFollowers(targetUsername),
        profileService.getFollowing(targetUsername),
      ]);

      setArtworks(artworksData.artworks || []);
      setExhibitions(exhibitionsData.exhibitions || []);
      setFollowers(followersData.followers || []);
      setFollowing(followingData.following || []);

      // Fetch saved items for own profile
      if (isOwnProfile) {
        const [savedData, postsData] = await Promise.all([
          profileService.getSavedItems(),
          profileService.getSharedPosts(targetUsername),
        ]);
        setSavedForLater(savedData.items || []);
        setSharedPosts(postsData.posts || []);

        if (response.profile.isArtist) {
          setActiveTab('portfolio');
        } else {
          setActiveTab('shared_artworks');
        }
      } else {
        setActiveTab(response.profile.isArtist ? 'portfolio' : 'shared_artworks');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load profile on mount and when username changes
  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const handleFollowToggle = async () => {
    const wasFollowing = isFollowing;

    // Optimistic UI update
    setIsFollowing(!isFollowing);

    try {
      // DEMO MODE: Just show toast
      if (USE_DEMO_MODE) {
        if (!wasFollowing) {
          toast.success('Followed successfully! 🎉');
        } else {
          toast.info('Unfollowed');
        }
        return;
      }

      // REAL API MODE: Call backend
      if (!wasFollowing) {
        await profileService.followUser(username);
        toast.success('Followed successfully! 🎉');
      } else {
        await profileService.unfollowUser(username);
        toast.info('Unfollowed');
      }
    } catch (error) {
      // Revert on error
      setIsFollowing(wasFollowing);
      toast.error('Failed to update. Please try again.');
    }
  };

  const handleShare = () => {
    toast.info('Profile link copied to clipboard!');
  };

  const handleEditProfile = async () => {
    if (isEditMode) {
      try {
        // DEMO MODE: Just update local state
        if (USE_DEMO_MODE) {
          setProfileData({ ...profileData, bio: editedBio });
          toast.success('Profile updated!');
          setIsEditMode(false);
          return;
        }

        // REAL API MODE: Call backend
        const response = await profileService.updateProfile({ bio: editedBio });
        setProfileData(response.profile);
        toast.success('Profile updated!');
        setIsEditMode(false);
      } catch (error) {
        toast.error('Failed to update profile. Please try again.');
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleCreatePost = (type) => {
    setCreateModalOpen(false);
    if (type === 'artwork') {
      navigate('/create-artwork');
    } else if (type === 'exhibition') {
      navigate('/host-exhibition');
    } else if (type === 'live') {
      navigate('/start-live');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        // Show both artworks and exhibitions for artists
        return (
          <div className="space-y-8">
            {/* Artworks Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
                <Image size={24} /> Artworks
              </h2>
              {artworks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {artworks.map((artwork, idx) => (
                    <Card
                      key={artwork.id}
                      hover
                      className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                          {artwork.image}
                        </span>
                        {artwork.forSale && (
                          <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                            For Sale
                          </div>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-sm md:text-base text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                          {artwork.title}
                        </h3>
                        {artwork.forSale && artwork.price && (
                          <p className="text-green-400 font-semibold mb-2 text-sm md:text-base">₱{artwork.price.toLocaleString()}</p>
                        )}
                        <div className="flex items-center gap-2 text-[#f2e9dd]/70 text-xs md:text-sm">
                          <Heart size={14} />
                          <span>{artwork.likes}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : <EmptyArtworks isOwnProfile={isOwnProfile} />}
            </div>

            {/* Exhibitions Section */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#f2e9dd] mb-4 flex items-center gap-2">
                <Calendar size={24} /> Exhibitions
              </h2>
              {exhibitions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  {exhibitions.map((exhibition, idx) => (
                    <Card
                      key={exhibition.id}
                      hover
                      className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className="aspect-video bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                          {exhibition.image}
                        </span>
                        <div className="absolute top-3 right-3 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                          {exhibition.exhibitionType}
                        </div>
                      </div>
                      <div className="p-3 md:p-4">
                        <h3 className="font-bold text-sm md:text-base text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                          {exhibition.title}
                        </h3>
                        <p className="text-xs md:text-sm text-[#f2e9dd]/70 mb-2">
                          {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs md:text-sm text-[#f2e9dd]/70">
                          {exhibition.artworksCount} artworks
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#f2e9dd]/70">No exhibitions yet.</p>
              )}
            </div>
          </div>
        );

      case 'artworks':
        return profileData.isArtist && artworks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {artworks.map((artwork, idx) => (
              <Card 
                key={artwork.id}
                hover
                className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {artwork.image}
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                    {artwork.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[#f2e9dd]/70 text-xs md:text-sm">
                    <Heart size={14} />
                    <span>{artwork.likes}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : <EmptyArtworks isOwnProfile={isOwnProfile} />;

      case 'shared_artworks':
        return sharedPosts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {sharedPosts.map((post, idx) => (
              <Card 
                key={post.id}
                hover
                className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {post.image}
                  </span>
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#f2e9dd]/70">by {post.artistName}</p>
                  <div className="flex items-center gap-2 text-[#f2e9dd]/70 text-xs md:text-sm">
                    <Heart size={14} />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : <p className="text-center text-[#f2e9dd]/70">No shared artworks yet.</p>;

      case 'saved_for_later':
        // Combine saved artworks and exhibitions
        const savedItems = [...savedForLater];

        return savedItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {savedItems.map((item, idx) => (
              <Card
                key={item.id}
                hover
                className="cursor-pointer transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fadeIn group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`${item.type === 'exhibition' ? 'aspect-video' : 'aspect-square'} bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 flex items-center justify-center text-6xl overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {item.image}
                  </span>
                  {item.type === 'exhibition' && (
                    <div className="absolute top-3 right-3 bg-[#7C5FFF]/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                      Exhibition
                    </div>
                  )}
                  {item.forSale && item.price && (
                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                      ₱{item.price.toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                    {item.title}
                  </h3>
                  {item.type === 'exhibition' ? (
                    <p className="text-xs md:text-sm text-[#f2e9dd]/70">
                      {item.exhibitionType} • {item.artworksCount} artworks
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-[#f2e9dd]/70 text-xs md:text-sm">
                      <Heart size={14} />
                      <span>{item.likes || 0}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : <p className="text-center text-[#f2e9dd]/70">No saved items yet.</p>;

      case 'followers':
        return followers.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {followers.map((follower, idx) => (
              <Card
                key={idx}
                className="p-3 md:p-4 hover:border-[#7C5FFF]/50 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-3 md:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-xl md:text-2xl shadow-lg">
                      {follower.avatar}
                    </div>
                    <div className="text-center md:text-left">
                      <p className="font-bold text-sm md:text-base text-[#f2e9dd]">{follower.name}</p>
                      <p className="text-xs md:text-sm text-[#f2e9dd]/70">{follower.username}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full md:w-auto transform hover:scale-105 transition-all duration-200">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : <EmptyFollowers isOwnProfile={isOwnProfile} />;

      case 'following':
        return following.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {following.map((follow, idx) => (
              <Card
                key={idx}
                className="p-3 md:p-4 hover:border-[#7C5FFF]/50 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-3 md:gap-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-xl md:text-2xl shadow-lg">
                      {follow.avatar}
                    </div>
                    <div className="text-center md:text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm md:text-base text-[#f2e9dd]">{follow.name}</p>
                        {follow.isArtist && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 rounded-full text-xs text-[#B15FFF]">
                            Artist
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-[#f2e9dd]/70">{follow.username}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info('Unfollowed')}
                      className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                    >
                      Unfollow
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full md:w-auto transform hover:scale-105 transition-all duration-200">
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : <EmptyFollowing isOwnProfile={isOwnProfile} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <LoadingPaint message="Loading profile..." />
        <div className="mt-8">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <APIError error={error} retry={fetchProfileData} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center py-20">
        <p className="text-[#f2e9dd]/70">Profile not found.</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 md:px-6">
      <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="What would you like to create?">
        <div className="flex flex-col gap-4">
          <Button onClick={() => handleCreatePost('artwork')} variant="secondary">Post an Artwork</Button>
          <Button onClick={() => handleCreatePost('exhibition')} variant="secondary">Host an Exhibition</Button>
          <Button onClick={() => handleCreatePost('live')} variant="secondary">Start a Live</Button>
        </div>
      </Modal>

      <div className="aspect-[4/1] bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-2xl mb-4 md:mb-6 flex items-center justify-center text-6xl md:text-9xl animate-fadeIn overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="transform group-hover:scale-110 transition-transform duration-500 relative z-10">
          {profileData.coverImage}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-5xl md:text-6xl shadow-lg shadow-[#7C5FFF]/30 transform hover:scale-110 transition-all duration-300">
            {profileData.avatar}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4 gap-3 md:gap-0">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-[#f2e9dd] mb-1">{profileData.displayName}</h1>
              <p className="text-[#f2e9dd]/70 mb-2">@{profileData.username}</p>
              {!profileData.isArtist && (
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#f2e9dd]/70">
                  Art Enthusiast
                </span>
              )}
              {profileData.isArtist && (
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 rounded-full text-xs text-[#B15FFF]">
                  ✨ Artist
                </span>
              )}
            </div>

            {isOwnProfile ? (
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditProfile}
                  className="w-full md:w-auto transform hover:scale-105 transition-all duration-200"
                >
                  <SettingsIcon size={16} className="mr-2" /> {isEditMode ? 'Save Profile' : 'Edit Profile'}
                </Button>
                {profileData.isArtist && (
                  <Button
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <Plus size={16} className="mr-2" /> Make a Post
                  </Button>
                )}
                {!profileData.isArtist && (
                  <Button
                    size="sm"
                    onClick={() => navigate('/create-artist')}
                    className="w-full md:w-auto bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles size={16} className="mr-2" /> Become Artist
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <Button
                  onClick={handleFollowToggle}
                  className={`w-full md:w-auto ${isFollowing
                    ? 'bg-white/5 hover:bg-white/10 transform hover:scale-105 transition-all duration-200'
                    : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 md:flex-none transform hover:scale-105 transition-all duration-200">
                    <MessageCircle size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 md:flex-none transform hover:scale-105 transition-all duration-200"
                  >
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {isEditMode ? (
            <textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#f2e9dd]/20 rounded-lg p-3 text-[#f2e9dd] focus:outline-none focus:ring-2 focus:ring-[#7C5FFF]"
              rows="3"
            ></textarea>
          ) : (
            <p className="text-[#f2e9dd]/90 mb-4 text-center md:text-left">{profileData.bio}</p>
          )}

          <div className="flex justify-center md:justify-start gap-4 md:gap-6">
            {profileData.isArtist && (
              <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('artworks')}>
                <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                  {profileData.artworks}
                </p>
                <p className="text-xs md:text-sm text-[#f2e9dd]/70">Artworks</p>
              </div>
            )}
            <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('followers')}>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                {profileData.followers}
              </p>
              <p className="text-xs md:text-sm text-[#f2e9dd]/70">Followers</p>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('following')}>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                {profileData.following}
              </p>
              <p className="text-xs md:text-sm text-[#f2e9dd]/70">Following</p>
            </div>
          </div>

          <p className="text-xs text-[#f2e9dd]/50 mt-4 text-center md:text-left">Joined {profileData.joinedDate}</p>
        </div>
      </div>

      {!['followers', 'following'].includes(activeTab) && (
        <div className="flex gap-4 md:gap-8 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
          {profileData.isArtist && (
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`relative pb-3 md:pb-4 text-sm md:text-lg whitespace-nowrap transition-all duration-300 ${
                activeTab === 'portfolio'
                  ? 'text-[#f2e9dd]'
                  : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
              }`}
            >
              Portfolio
              {activeTab === 'portfolio' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
              )}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('shared_artworks')}
              className={`relative pb-3 md:pb-4 text-sm md:text-lg whitespace-nowrap transition-all duration-300 ${
                activeTab === 'shared_artworks'
                  ? 'text-[#f2e9dd]'
                  : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
              }`}
            >
              Shared Posts
              {activeTab === 'shared_artworks' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
              )}
            </button>
          )}
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved_for_later')}
              className={`relative pb-3 md:pb-4 transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'saved_for_later'
                  ? 'text-[#f2e9dd]'
                  : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
              }`}
              title="Saved for Later"
            >
              <Bookmark size={18} md:size={20} />
              {activeTab === 'saved_for_later' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
              )}
            </button>
          )}
        </div>
      )}

      {['followers', 'following'].includes(activeTab) && (
        <div className="flex justify-start items-center border-b border-white/10 mb-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(profileData.isArtist ? 'portfolio' : (isOwnProfile ? 'shared_artworks' : 'artworks'))}
                className="transform hover:scale-105 transition-all duration-200 mb-4 mr-4"
            >
                <ArrowLeft size={16} className="mr-2" /> Back to Profile
            </Button>
        </div>
      )}

      {renderContent()}

    </div>
  );
};

export { ProfilePage };