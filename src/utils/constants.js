// Color Palette
export const COLORS = {
  background: {
    primary: '#1a1a1a',
    secondary: '#121212'
  },
  text: {
    primary: '#f2e9dd',
    secondary: '#f2e9dd99',
    muted: '#f2e9dd80'
  },
  accent: {
    purple: '#8c52ff',
    pink: '#cb6ce6',
    peach: '#e8a880'
  }
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium'
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    currency: 'PHP',
    features: {
      fan: [
        'Browse artworks and exhibitions',
        'Follow artists',
        'Like artworks',
        'Basic profile'
      ],
      artist: [
        'Upload up to 10 artworks',
        'Basic analytics (profile views only)',
        'Standard visibility',
        'No livestream access',
        'No exhibition hosting'
      ]
    }
  },
  {
    id: 'basic',
    name: 'BASIC',
    price: 149,
    currency: 'PHP',
    popular: true,
    features: {
      fan: [
        'Everything in Free',
        'Comment on artworks',
        'Save favorites',
        'Bidding access in auctions',
        'Early access to exhibitions'
      ],
      artist: [
        'Upload up to 50 artworks',
        'Advanced analytics (engagement metrics, top fans, revenue breakdown)',
        'Host solo exhibitions (up to 20 artworks)',
        'Livestream capabilities',
        'Commission requests',
        'Priority support'
      ]
    }
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 249,
    currency: 'PHP',
    features: {
      fan: [
        'Everything in Basic',
        'VIP badge on profile',
        'Priority bidding in auctions with last-call feature',
        'Exclusive VIP exhibitions & showcases',
        'Exclusive collectibles (NFTs, badges)',
        '1-on-1 consultation with selected artists'
      ],
      artist: [
        'Unlimited artworks',
        'Premium analytics (demographics, behavior patterns, sales forecasts, AI insights)',
        'Host solo exhibitions (up to 50 artworks)',
        'Collaborative exhibitions',
        'Premium placement on Explore page',
        'Advanced livestream features',
        '1-on-1 consultation bookings',
        'Event collaborations with Premium creators'
      ]
    }
  }
];

// Demo Credentials
export const DEMO_USERS = {
  premium: {
    username: 'mz123',
    password: '12345',
    email: 'mz123@onlyarts.com',
    displayName: 'Maria Santos',
    subscription: 'premium',
    isArtist: false,
    followers: 234,
    following: 89,
    favorites: 1234,
    avatar: null
  }
};

// Navigation Routes
export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EXPLORE: '/explore',
  EXHIBITION: '/exhibition/:id',
  PORTFOLIO: '/portfolio/:username',
  LIVESTREAMS: '/livestreams',
  FAVORITES: '/favorites',
  SUBSCRIPTIONS: '/subscriptions',
  SETTINGS: '/settings',
  CREATE_ARTIST: '/create-artist',
  WALLET: '/wallet'
};