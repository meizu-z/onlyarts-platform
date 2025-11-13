# OnlyArts Backend API

Node.js + Express backend for OnlyArts art marketplace platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT
- **File Storage:** Cloudinary
- **Payments:** Stripe
- **Email:** Resend

## Database Setup

The backend uses MySQL for data storage. Follow these steps to set up your database connection:

1. Make sure you have MySQL 8.0 or later installed and running
2. Create a new database:
   ```sql
   CREATE DATABASE onlyarts;
   ```
3. Update the database credentials in `.env`:
   ```env
   DB_HOST=localhost        # Your MySQL host
   DB_PORT=3306            # Your MySQL port
   DB_NAME=onlyarts        # The database you created
   DB_USER=root           # Your MySQL username
   DB_PASSWORD=your_password  # Your MySQL password
   ```

### Testing Database Connection

You can verify your database connection in two ways:

1. Quick connection test:
   ```bash
   npm run test-db
   ```
   This runs a simple query to check connectivity.

2. Start the full server:
   ```bash
   npm run dev
   ```
   Then check the health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

### Troubleshooting Database Connection

If you see connection errors:

1. Verify MySQL is running
2. Check your credentials in `.env`
3. Ensure the database exists: `CREATE DATABASE onlyarts;`
4. Verify you can connect using the mysql cli:
   ```bash
   mysql -u root -p onlyarts
   ```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Set up MySQL database (see Database Setup section above)

4. Run migrations:
   ```bash
   npm run migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health and database status

### Authentication (Coming Day 3)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Users (Coming Day 4)
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user

### Artworks (Coming Day 5)
- `GET /api/artworks` - List artworks
- `GET /api/artworks/:id` - Get artwork
- `POST /api/artworks` - Create artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork

### Cart (Coming Day 6)
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Helper functions
├── .env                # Environment variables
├── .env.example        # Example env file
├── server.js           # Entry point
└── package.json        # Dependencies
```

## Development

- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

## Environment Variables

See `.env.example` for all required variables.
