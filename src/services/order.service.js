/**
 * Order Service - Handles order management
 */

// Mock order data for visualization
export const mockOrderData = {
  id: `ORD-${Date.now()}`,
  userId: 'user-1',
  status: 'completed',
  createdAt: new Date().toISOString(),
  items: [
    {
      id: 'item-1',
      artwork: {
        id: '1',
        title: 'Digital Sunset',
        artistName: 'Sarah Chen',
        artist: '@sarahchen',
        image: '🌅',
        price: 5000,
      },
      title: 'Digital Sunset',
      artistName: 'Sarah Chen',
      price: 5000,
      quantity: 1,
      image: '🌅',
    },
  ],
  subtotal: 5000,
  tax: 500,
  shipping: 500,
  discount: 0,
  total: 6000,
};

// Mock multiple orders for order history
export const mockOrders = [
  {
    id: 'ORD-1703001234567',
    userId: 'user-1',
    status: 'completed',
    createdAt: '2024-12-19T10:30:00.000Z',
    items: [
      {
        id: 'item-1',
        artwork: {
          id: '1',
          title: 'Digital Sunset',
          artistName: 'Sarah Chen',
          artist: '@sarahchen',
          image: '🌅',
          price: 5000,
        },
        title: 'Digital Sunset',
        artistName: 'Sarah Chen',
        price: 5000,
        quantity: 1,
        image: '🌅',
      },
      {
        id: 'item-2',
        artwork: {
          id: '2',
          title: 'Abstract Dreams',
          artistName: 'Mike Johnson',
          artist: '@mikej',
          image: '🎨',
          price: 3500,
        },
        title: 'Abstract Dreams',
        artistName: 'Mike Johnson',
        price: 3500,
        quantity: 1,
        image: '🎨',
      },
    ],
    subtotal: 8500,
    tax: 850,
    shipping: 500,
    discount: 0,
    total: 9850,
  },
  {
    id: 'ORD-1702987654321',
    userId: 'user-1',
    status: 'completed',
    createdAt: '2024-12-18T14:15:00.000Z',
    items: [
      {
        id: 'item-3',
        artwork: {
          id: '3',
          title: 'Neon Dreams',
          artistName: 'Emma Wilson',
          artist: '@emmaw',
          image: '✨',
          price: 4200,
        },
        title: 'Neon Dreams',
        artistName: 'Emma Wilson',
        price: 4200,
        quantity: 1,
        image: '✨',
      },
    ],
    subtotal: 4200,
    tax: 420,
    shipping: 500,
    discount: 0,
    total: 5120,
  },
  {
    id: 'ORD-1702891234567',
    userId: 'user-1',
    status: 'completed',
    createdAt: '2024-12-15T09:45:00.000Z',
    items: [
      {
        id: 'item-4',
        artwork: {
          id: '4',
          title: 'Cosmic Journey',
          artistName: 'Alex Rivera',
          artist: '@alexr',
          image: '🌌',
          price: 6500,
        },
        title: 'Cosmic Journey',
        artistName: 'Alex Rivera',
        price: 6500,
        quantity: 1,
        image: '🌌',
      },
      {
        id: 'item-5',
        artwork: {
          id: '5',
          title: 'Urban Vibes',
          artistName: 'Sarah Chen',
          artist: '@sarahchen',
          image: '🏙️',
          price: 4800,
        },
        title: 'Urban Vibes',
        artistName: 'Sarah Chen',
        price: 4800,
        quantity: 1,
        image: '🏙️',
      },
    ],
    subtotal: 11300,
    tax: 1130,
    shipping: 500,
    discount: 500,
    total: 12430,
  },
];

/**
 * Initialize mock orders in localStorage
 * Only initializes if no orders exist
 */
export const initializeMockOrders = () => {
  const existingOrders = localStorage.getItem('userOrders');

  if (!existingOrders || JSON.parse(existingOrders).length === 0) {
    localStorage.setItem('userOrders', JSON.stringify(mockOrders));
    console.log('[OrderService] Mock orders initialized in localStorage');
    return true;
  }

  console.log('[OrderService] Orders already exist in localStorage');
  return false;
};

/**
 * Get all orders for current user
 */
export const getUserOrders = (userId) => {
  const allOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  return allOrders.filter(order => order.userId === userId);
};

/**
 * Get single order by ID
 */
export const getOrderById = (orderId) => {
  const allOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  return allOrders.find(order => order.id === orderId);
};

/**
 * Save new order
 */
export const saveOrder = (orderData) => {
  const existingOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
  const newOrder = {
    ...orderData,
    id: orderData.id || `ORD-${Date.now()}`,
    createdAt: orderData.createdAt || new Date().toISOString(),
    status: orderData.status || 'completed',
  };

  localStorage.setItem('userOrders', JSON.stringify([newOrder, ...existingOrders]));
  console.log('[OrderService] Order saved:', newOrder.id);
  return newOrder;
};

export default {
  mockOrderData,
  mockOrders,
  initializeMockOrders,
  getUserOrders,
  getOrderById,
  saveOrder,
};
