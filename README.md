# Social Network Platform

A full-stack social media application built with React, TypeScript, Node.js, Express, PostgreSQL, and Redis.

## Features

- 🔐 **Authentication** - JWT-based auth with refresh tokens
- 👤 **User Profiles** - Customizable profiles with avatars
- 📝 **Posts** - Create, edit, delete posts with images/videos
- 💬 **Comments** - Nested comments with replies
- ❤️ **Likes** - Like posts and comments
- 👥 **Follow System** - Follow/unfollow users
- 🔔 **Notifications** - Real-time notifications for interactions
- 🚫 **Blocking** - Block unwanted users
- 💳 **Billing** - Stripe integration for PRO subscriptions
- 🎨 **Dark Mode** - Modern dark theme UI
- ⚡ **Caching** - Redis caching for performance
- 📱 **Responsive** - Mobile-friendly design

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Radix UI** - Accessible components
- **Sonner** - Toast notifications

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Redis** - Caching
- **JWT** - Authentication
- **Stripe** - Payments
- **Cloudinary** - Media storage
- **Swagger** - API documentation

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API client
│   │   ├── context/       # React context (auth)
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── auth/      # Authentication
│   │   │   ├── user/      # User management
│   │   │   ├── posts/     # Posts
│   │   │   ├── comments/  # Comments
│   │   │   ├── likes/     # Likes
│   │   │   ├── follows/   # Follow system
│   │   │   ├── notifications/ # Notifications
│   │   │   ├── blocks/    # Blocking
│   │   │   └── billing/   # Stripe billing
│   │   ├── middleware/    # Express middleware
│   │   ├── lib/           # Shared utilities
│   │   └── config/        # Configuration
│   ├── prisma/            # Database schema & migrations
│   └── package.json
│
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Stripe account (for billing features)
- Cloudinary account (for media uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-network
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   **Server** (`server/.env`):
   ```env
   # Environment switch: development | production
   # Change this to "production" when deploying
   APP_ENV=development

   # Server Port
   PORT_DEV=3000
   PORT_PROD=3000

   # Database URLs
   DATABASE_URL_DEV=postgresql://user:password@localhost:5432/social_network_local
   DATABASE_URL_PROD=postgresql://user:password@production-host:5432/social_network_prod

   # Redis URLs
   REDIS_URL_DEV=redis://:password@localhost:6379
   REDIS_URL_PROD=redis://:password@production-host:6379

   # Frontend URLs (for CORS)
   FRONTEND_URL_DEV=http://localhost:5173
   FRONTEND_URL_PROD=https://your-frontend-domain.com

   # Backend URLs
   BACKEND_URL_DEV=http://localhost:3000
   BACKEND_URL_PROD=https://your-api-domain.com

   # JWT Secrets
   JWT_SECRET=your_jwt_secret_change_this
   JWT_EXPIRES_IN=5m
   REFRESH_TOKEN_SECRET=your_refresh_secret_change_this
   REFRESH_TOKEN_EXPIRES_IN=30d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_PUBLIC_KEY=pk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   STRIPE_PRO_PRICE_ID=price_your_price_id
   STRIPE_PRO_PRICE_CENTS=999
   STRIPE_PRO_CURRENCY=usd
   STRIPE_SUCCESS_URL_DEV=http://localhost:5173/billing/success
   STRIPE_SUCCESS_URL_PROD=https://your-frontend-domain.com/billing/success
   STRIPE_CANCEL_URL_DEV=http://localhost:5173/billing/cancel
   STRIPE_CANCEL_URL_PROD=https://your-frontend-domain.com/billing/cancel

   # Cache
   CACHE_ENABLED=true
   ```

   **To switch between environments:**
   - For development: Set `APP_ENV=development`
   - For production: Set `APP_ENV=production`
   
   The server will automatically use the correct URLs and configurations based on this setting.

   **Client** (`client/.env`):
   ```env
   # Environment switch: development | production
   # Change this to "production" when deploying
   VITE_APP_ENV=development

   # API URLs
   VITE_API_URL_DEV=http://localhost:3000/api/v1
   VITE_API_URL_PROD=https://your-api-domain.com/api/v1

   # Stripe public key
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
   ```

   **To switch between environments:**
   - For development: Set `VITE_APP_ENV=development`
   - For production: Set `VITE_APP_ENV=production`
   
   The app will automatically use the correct API URL based on this setting.

4. **Set up the database**
   ```bash
   cd server
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed database (optional)
   npm run seed
   ```

5. **Start development servers**

   **Terminal 1 - Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Client:**
   ```bash
   cd client
   npm run dev
   ```

6. **Open the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api-docs

## Development

### Server Commands

```bash
cd server

npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Seed database with sample data
```

### Client Commands

```bash
cd client

npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
```

### Database Commands

```bash
cd server

npx prisma studio              # Open Prisma Studio (DB GUI)
npx prisma migrate dev         # Create and apply migration
npx prisma migrate reset       # Reset database
npx prisma generate            # Generate Prisma client
```

## API Documentation

The API is documented using Swagger/OpenAPI. Access the interactive documentation at:

**http://localhost:3000/api-docs**

### Key Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/posts` - Get feed
- `POST /api/v1/posts` - Create post
- `POST /api/v1/posts/:id/likes` - Like post
- `POST /api/v1/posts/:id/comments` - Add comment
- `POST /api/v1/users/:id/follow` - Follow user
- `GET /api/v1/notifications` - Get notifications
- `POST /api/v1/billing/create-checkout-session` - Create Stripe checkout

## Testing

### Run Tests

```bash
# Client tests
cd client
npm test

# Server tests (if available)
cd server
npm test
```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_APP_ENV=production`
   - `VITE_API_URL_PROD=https://your-api-domain.com/api/v1`
   - `VITE_STRIPE_PUBLIC_KEY=pk_live_your_key`
4. Deploy

### Backend (Render/Railway/Heroku)

1. Push code to GitHub
2. Create new web service
3. Set environment variables (see `.env.example`)
4. Set build command: `cd server && npm install && npm run build`
5. Set start command: `cd server && npm start`
6. Deploy

### Database (Aiven/Supabase/Neon)

1. Create PostgreSQL database
2. Update `DATABASE_URL` in server environment
3. Run migrations: `npx prisma migrate deploy`

### Redis (Upstash/Redis Cloud)

1. Create Redis instance
2. Update `REDIS_URL` in server environment

## Environment Variables

### Required Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_ENV` | Environment switch | `development` or `production` |
| `PORT_DEV` | Development server port | `3000` |
| `PORT_PROD` | Production server port | `3000` |
| `DATABASE_URL_DEV` | Development database URL | `postgresql://user:pass@localhost:5432/db` |
| `DATABASE_URL_PROD` | Production database URL | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL_DEV` | Development Redis URL | `redis://:pass@localhost:6379` |
| `REDIS_URL_PROD` | Production Redis URL | `redis://:pass@host:6379` |
| `FRONTEND_URL_DEV` | Development frontend URL | `http://localhost:5173` |
| `FRONTEND_URL_PROD` | Production frontend URL | `https://your-frontend.com` |
| `JWT_SECRET` | JWT signing secret | `random_string` |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | `random_string` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_SUCCESS_URL_DEV` | Dev success redirect | `http://localhost:5173/billing/success` |
| `STRIPE_SUCCESS_URL_PROD` | Prod success redirect | `https://your-frontend.com/billing/success` |

**Environment Switching:**
- Simply change `APP_ENV` to switch between development and production
- All environment-specific URLs are configured in the same `.env` file
- The server automatically selects the correct configuration on startup

### Required Client Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_ENV` | Environment switch | `development` or `production` |
| `VITE_API_URL_DEV` | Development API URL | `http://localhost:3000/api/v1` |
| `VITE_API_URL_PROD` | Production API URL | `https://your-api.com/api/v1` |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key | `pk_test_...` |

**Environment Switching:**
- Simply change `VITE_APP_ENV` to switch between development and production
- No need to change other variables when switching environments
- Both API URLs are configured in the same `.env` file

## Features in Detail

### Authentication
- JWT access tokens (5 min expiry)
- Refresh tokens (30 days expiry)
- Automatic token refresh on 401
- Secure password hashing with bcrypt

### Posts
- Text content with optional media
- Public/Private visibility
- Character limits (20 for FREE, 100 for PRO)
- Image and video uploads via Cloudinary
- Edit and delete own posts

### Comments
- Nested replies (unlimited depth)
- Like comments
- Edit and delete own comments
- Real-time comment counts

### Follow System
- Follow/unfollow users
- View followers and following lists
- Following-based feed

### Notifications
- Like notifications
- Comment notifications
- New follower notifications
- Mark as read/unread
- Delete notifications

### Billing
- Stripe Checkout integration
- PRO plan subscription ($9.99/month)
- Downgrade to FREE plan
- Webhook handling for payment events

### Caching
- Redis caching for feeds and profiles
- Pattern-based cache invalidation
- Configurable TTL per resource type

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Ensure `FRONTEND_URL` is set in `server/.env`
2. Restart the server completely
3. Check server logs for CORS configuration

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d social_network

# Check if database exists
psql -U postgres -c "\l"
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Check Redis is running
redis-cli info server
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review API documentation at `/api-docs`

## Acknowledgments

- Built with modern web technologies
- UI components from Radix UI
- Icons from Lucide React
- Styling with TailwindCSS
