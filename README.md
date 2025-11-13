# OnlyArts Platform

> A modern art marketplace and social platform connecting artists with fans through exclusive content, commissions, exhibitions, and livestreams.

![OnlyArts Platform](https://via.placeholder.com/1200x300/8c52ff/ffffff?text=OnlyArts+Platform)

## ✨ Features

### For Artists
- **Portfolio Management** - Showcase artwork with rich media support
- **Commission System** - Accept and manage custom art requests
- **Livestreaming** - Host live art sessions with real-time bidding
- **Exhibitions** - Create and host virtual art exhibitions
- **Analytics Dashboard** - Track views, engagement, and revenue
- **Subscription Tiers** - Monetize with Plus and Premium memberships

### For Fans
- **Discover Art** - Browse curated artworks and exhibitions
- **Commission Artists** - Request custom artwork
- **Join Livestreams** - Participate in live art events and auctions
- **Support Creators** - Subscribe to favorite artists
- **Build Collections** - Save and organize favorite pieces
- **Direct Messaging** - Chat with artists

### Platform Features
- **Subscription System** - Free, Plus, and Premium tiers
- **Secure Payments** - Stripe integration for transactions
- **Real-time Chat** - WebSocket-powered messaging
- **Notifications** - Stay updated on activity
- **Admin Dashboard** - Comprehensive platform management
- **Light/Dark Mode** - Beautiful themes for all preferences

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ or v20 LTS
- **MySQL** 8.0+
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/onlyarts-platform.git
   cd onlyarts-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE onlyarts;
   EXIT;

   # Run migrations
   mysql -u root -p onlyarts < migrations/001_initial_schema.sql
   ```

4. **Frontend Setup**
   ```bash
   cd ../
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - API Health: http://localhost:5000/health

---

## 📁 Project Structure

```
onlyarts-platform/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # WebSocket handlers
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   └── .env.example        # Environment template
│
├── src/                    # React frontend
│   ├── components/         # React components
│   │   ├── common/        # Shared components
│   │   ├── layouts/       # Layout components
│   │   └── ui/            # UI components
│   ├── context/           # React contexts
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── config/            # Frontend config
│
├── CONFIGURATION_GUIDE.md  # Setup instructions
├── DEPLOYMENT_CHECKLIST.md # Pre-deployment checklist
├── PRODUCTION_SETUP.md     # Production deployment guide
└── TESTING_GUIDE.md        # Testing documentation
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MySQL** - Database
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Stripe** - Payment processing
- **Cloudinary** - Image storage
- **Nodemailer** - Email service

---

## 🔑 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=onlyarts
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here

# Third-party Services
CLOUDINARY_CLOUD_NAME=your-cloud-name
STRIPE_SECRET_KEY=sk_test_...
EMAIL_USER=your@email.com
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

See [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) for detailed setup instructions.

---

## 📚 Documentation

- **[Configuration Guide](CONFIGURATION_GUIDE.md)** - Environment setup and third-party integrations
- **[Testing Guide](TESTING_GUIDE.md)** - API testing and test scenarios
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Production Setup](PRODUCTION_SETUP.md)** - Production deployment guide

---

## 🗄️ Database Schema

The platform uses 23 MySQL tables:

### Core Tables
- `users` - User accounts and profiles
- `artworks` - Artwork listings
- `orders` - Purchase orders
- `subscriptions` - User subscriptions

### Feature Tables
- `commissions` - Commission requests
- `exhibitions` - Virtual exhibitions
- `livestreams` - Live streaming events
- `conversations` & `messages` - Chat system
- `notifications` - User notifications
- `bids` - Auction bids

See [backend/migrations](backend/migrations) for full schema.

---

## 🔐 Authentication

The platform uses JWT-based authentication:

1. **Registration** - `POST /api/auth/register`
2. **Login** - `POST /api/auth/login` (returns access + refresh tokens)
3. **Refresh** - `POST /api/auth/refresh` (get new access token)
4. **Logout** - `POST /api/auth/logout`

Protected routes require `Authorization: Bearer <token>` header.

---

## 💳 Payment Integration

### Stripe Setup

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Configure webhook endpoint:
   ```
   URL: https://api.yourdomain.com/api/webhooks/stripe
   Events: payment_intent.*, customer.subscription.*
   ```
4. Add keys to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Supported Features
- One-time payments (artwork purchases)
- Recurring subscriptions (Plus/Premium)
- Commission payments
- Refunds

---

## 🧪 Testing

### Backend API Tests

```bash
cd backend
npm test
```

### Manual API Testing

Use the provided REST Client files:
```
backend/tests/*.http
```

Or use the [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive test scenarios.

---

## 🚢 Deployment

### Quick Deployment

1. **Backend** (VPS/Cloud)
   ```bash
   npm install --production
   pm2 start npm --name "onlyarts-backend" -- start
   ```

2. **Frontend** (Vercel/Netlify)
   ```bash
   npm run build
   vercel --prod
   ```

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for detailed deployment instructions.

---

## 🛠️ Development

### Running in Development Mode

```bash
# Backend with hot reload
cd backend
npm run dev

# Frontend with hot reload
npm run dev
```

### Code Style

- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- Follow existing code patterns

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code style changes
refactor: Code refactoring
test: Test updates
chore: Build/config updates
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check MySQL is running: `sudo systemctl status mysql`
- Verify `.env` configuration
- Check port 5000 is available: `lsof -i :5000`

### Frontend API errors
- Ensure backend is running
- Check `VITE_API_BASE_URL` in `.env`
- Verify CORS settings in backend

### Database connection failed
- Check DB credentials in `.env`
- Ensure database exists: `mysql -u root -p` → `SHOW DATABASES;`
- Verify MySQL allows connections from host

### Images not uploading
- Check Cloudinary credentials
- Verify file size limits
- Check network connectivity

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👥 Team

- **Backend Developer** - API and database design
- **Frontend Developer** - UI/UX implementation
- **DevOps** - Infrastructure and deployment

---

## 📧 Support

For issues and questions:
- Email: support@onlyarts.com
- GitHub Issues: [Create an issue](https://github.com/yourusername/onlyarts-platform/issues)

---

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core platform features
- [x] Payment integration
- [x] Admin dashboard
- [x] Real-time chat
- [x] Notification system

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] NFT integration
- [ ] Social sharing features
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] AI art recommendations
- [ ] Virtual reality exhibitions
- [ ] Artist collaboration tools
- [ ] Advanced auction features

---

**Made with ❤️ for artists and art lovers**
