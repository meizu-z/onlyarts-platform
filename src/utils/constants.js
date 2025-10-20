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
  PLUS: 'plus',
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
        'View exhibitions in preview mode (cannot bid, cannot engage in auctions)',
        'No commission requests',
        'No badges or collectibles'
      ],
      artist: [
        'No access to exhibitions hosting',
        'Cannot sell or mint NFTs',
        'Limited analytics (basic profile views only)'
      ]
    }
  },
  {
    id: 'plus',
    name: 'PLUS',
    price: 149,
    currency: 'PHP',
    popular: true,
    features: {
      fan: [
        'All Free perks',
        'Monthly free commission coupon',
        'Bidding access in auctions',
        'Loyalty & supporter badges displayed on profile',
        'Direct artist engagement'
      ],
      artist: [
        'All Free artist perks',
        'Featured slots in group exhibitions',
        'Expanded analytics (who engages, top fans, revenue breakdown)',
        'Early access to AI recommendations for content strategy'
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
        'All Plus perks',
        'Priority bidding access in auctions',
        'VIP-only showcases (exclusive exhibitions & collabs)',
        'Exclusive collectibles (NFTs, badges, digital mementos)',
        '1-on-1 interaction opportunities with selected artists'
      ],
      artist: [
        'All Plus artist perks',
        'Host solo exhibitions',
        'Premium placement on the Explore Page',
        'Audience insights (demographics, fan behavior, sales trends)',
        'Event collaborations with other Premium creators'
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