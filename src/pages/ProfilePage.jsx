import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { EmptyArtworks, EmptyFollowers, EmptyFollowing } from '../components/ui/EmptyStates';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, Heart, MessageCircle, Settings as SettingsIcon, Share2, Sparkles } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('artworks');
  const [isFollowing, setIsFollowing] = useState(false);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBio, setEditedBio] = useState('');

  const isOwnProfile = user?.username === username;

  useEffect(() => {
    if (isOwnProfile) {
      const posts = JSON.parse(localStorage.getItem('sharedPosts') || '[]');
      setSharedPosts(posts);
      setActiveTab('shared_artworks');
    }
  }, [isOwnProfile]);

  const profileData = {
    username: username || user?.username,
    displayName: 'Artist Name',
    bio: 'Digital artist creating beautiful landscapes and abstract art. Available for commissions!',
    avatar: '🎨',
    coverImage: '🌆',
    isArtist: false,
    followers: 1234,
    following: 567,
    artworks: 89,
    posts: sharedPosts.length,
    joinedDate: 'October 2024'
  };

  useEffect(() => {
    setEditedBio(profileData.bio);
  }, [profileData.bio]);

  const followers = [
    { username: '@user1', name: 'User One', avatar: '👤' },
    { username: '@user2', name: 'User Two', avatar: '👤' },
    { username: '@user3', name: 'User Three', avatar: '👤' },
  ];

  const following = [
    { username: '@artist1', name: 'Artist One', avatar: '🎨', isArtist: true },
    { username: '@artist2', name: 'Artist Two', avatar: '🎭', isArtist: true },
    { username: '@user4', name: 'User Four', avatar: '👤' },
  ];

  const artworks = [
    { id: 1, title: 'Sunset Dreams', image: '🌅', likes: 234 },
    { id: 2, title: 'Abstract Flow', image: '🎨', likes: 189 },
    { id: 3, title: 'Urban Nights', image: '🌃', likes: 445 },
  ];

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    if (!isFollowing) {
      toast.success('Followed successfully! 🎉');
    } else {
      toast.info('Unfollowed');
    }
  };

  const handleShare = () => {
    toast.info('Profile link copied to clipboard!');
  };

  const handleEditProfile = () => {
    if (isEditMode) {
      // In a real app, you'd save this to a backend.
      profileData.bio = editedBio;
      toast.success('Profile updated!');
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto">
      <div className="aspect-[4/1] bg-gradient-to-br from-[#7C5FFF]/20 to-[#FF5F9E]/20 rounded-2xl mb-6 flex items-center justify-center text-9xl animate-fadeIn overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <span className="transform group-hover:scale-110 transition-transform duration-500 relative z-10">
          {profileData.coverImage}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-6xl shadow-lg shadow-[#7C5FFF]/30 transform hover:scale-110 transition-all duration-300">
            {profileData.avatar}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#f2e9dd] mb-1">{profileData.displayName}</h1>
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
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleEditProfile}
                  className="transform hover:scale-105 transition-all duration-200"
                >
                  <SettingsIcon size={16} className="mr-2" /> {isEditMode ? 'Save Profile' : 'Edit Profile'}
                </Button>
                {!profileData.isArtist && (
                  <Button 
                    size="sm"
                    onClick={() => navigate('/create-artist')}
                    className="bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300"
                  >
                    <Sparkles size={16} className="mr-2" /> Become Artist
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleFollowToggle}
                  className={isFollowing 
                    ? 'bg-white/5 hover:bg-white/10 transform hover:scale-105 transition-all duration-200' 
                    : 'bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] shadow-lg shadow-[#7C5FFF]/30 hover:shadow-[#7C5FFF]/50 transform hover:scale-105 transition-all duration-300'
                  }
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
                  <MessageCircle size={16} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleShare}
                  className="transform hover:scale-105 transition-all duration-200"
                >
                  <Share2 size={16} />
                </Button>
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
            <p className="text-[#f2e9dd]/90 mb-4">{profileData.bio}</p>
          )}

          <div className="flex gap-6">
            {profileData.isArtist && (
              <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                  {profileData.artworks}
                </p>
                <p className="text-sm text-[#f2e9dd]/70">Artworks</p>
              </div>
            )}
            <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('shared_artworks')}>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                {profileData.posts}
              </p>
              <p className="text-sm text-[#f2e9dd]/70">Shared</p>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('followers')}>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                {profileData.followers}
              </p>
              <p className="text-sm text-[#f2e9dd]/70">Followers</p>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab('following')}>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] bg-clip-text text-transparent">
                {profileData.following}
              </p>
              <p className="text-sm text-[#f2e9dd]/70">Following</p>
            </div>
          </div>

          <p className="text-xs text-[#f2e9dd]/50 mt-4">Joined {profileData.joinedDate}</p>
        </div>
      </div>

      <div className="flex gap-8 border-b border-white/10 mb-8">
        {profileData.isArtist && (
          <button
            onClick={() => setActiveTab('artworks')}
            className={`relative pb-4 text-lg transition-all duration-300 ${
              activeTab === 'artworks' 
                ? 'text-[#f2e9dd]' 
                : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
            }`}
          >
            Artworks
            {activeTab === 'artworks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab('shared_artworks')}
          className={`relative pb-4 text-lg transition-all duration-300 ${
            activeTab === 'shared_artworks' 
              ? 'text-[#f2e9dd]' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          Shared Artworks
          {activeTab === 'shared_artworks' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`relative pb-4 text-lg transition-all duration-300 ${
            activeTab === 'followers' 
              ? 'text-[#f2e9dd]' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          Followers
          {activeTab === 'followers' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`relative pb-4 text-lg transition-all duration-300 ${
            activeTab === 'following' 
              ? 'text-[#f2e9dd]' 
              : 'text-[#f2e9dd]/50 hover:text-[#f2e9dd]'
          }`}
        >
          Following
          {activeTab === 'following' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#7C5FFF] to-[#FF5F9E] animate-slideIn"></div>
          )}
        </button>
      </div>

      {activeTab === 'artworks' && profileData.isArtist && artworks.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
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
              <div className="p-4">
                <h3 className="font-bold text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                  {artwork.title}
                </h3>
                <div className="flex items-center gap-2 text-[#f2e9dd]/70">
                  <Heart size={16} />
                  <span>{artwork.likes}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'shared_artworks' && sharedPosts.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
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
              <div className="p-4">
                <h3 className="font-bold text-[#f2e9dd] mb-2 group-hover:text-[#7C5FFF] transition-colors">
                  {post.title}
                </h3>
                 <p className="text-sm text-[#f2e9dd]/70">by {post.artistName}</p>
                <div className="flex items-center gap-2 text-[#f2e9dd]/70">
                  <Heart size={16} />
                  <span>{post.likes}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'artworks' && (!profileData.isArtist || artworks.length === 0) && (
        <EmptyArtworks isOwnProfile={isOwnProfile} />
      )}

      {activeTab === 'followers' && followers.length === 0 && (
        <EmptyFollowers isOwnProfile={isOwnProfile} />
      )}

      {activeTab === 'followers' && followers.length > 0 && (
        <div className="space-y-4">
          {followers.map((follower, idx) => (
            <Card 
              key={idx}
              className="p-4 hover:border-[#7C5FFF]/50 transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-2xl shadow-lg">
                    {follower.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[#f2e9dd]">{follower.name}</p>
                    <p className="text-sm text-[#f2e9dd]/70">{follower.username}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'following' && following.length === 0 && (
        <EmptyFollowing isOwnProfile={isOwnProfile} />
      )}

      {activeTab === 'following' && following.length > 0 && (
        <div className="space-y-4">
          {following.map((follow, idx) => (
            <Card 
              key={idx}
              className="p-4 hover:border-[#7C5FFF]/50 transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5FFF] to-[#FF5F9E] flex items-center justify-center text-2xl shadow-lg">
                    {follow.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#f2e9dd]">{follow.name}</p>
                      {follow.isArtist && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#7C5FFF]/20 to-[#FF5F9E]/20 border border-[#7C5FFF]/30 rounded-full text-xs text-[#B15FFF]">
                          Artist
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#f2e9dd]/70">{follow.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toast.info('Unfollowed')}
                    className="transform hover:scale-105 transition-all duration-200"
                  >
                    Unfollow
                  </Button>
                  <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-all duration-200">
                    View Profile
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export { ProfilePage };