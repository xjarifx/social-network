# Social Network Platform

🚀 **Live Preview:** [https://social-network-ten-ruby.vercel.app](https://social-network-ten-ruby.vercel.app)

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
- **ImageKit** - Media storage
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
- ImageKit account (for media uploads)

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
   # ============================================
   # ENVIRONMENT CONFIGURATION
   # ============================================
   # Individual resource switches - set to true/false for each resource
   # true = use PROD value, false = use DEV value

   # ============================================
   # SERVER CONFIGURATION
   # ============================================
   PORT=3000
   CACHE_ENABLED=true

   # ============================================
   # DATABASE CONFIGURATION
   # ============================================
   USE_PROD_DATABASE=false

   # Production Database
   DATABASE_URL_PROD=postgresql://user:password@production-host:5432/social_network_prod

   # Development Database
   DATABASE_URL_DEV=postgresql://postgres:password@localhost:5432/social_network_local

   # ============================================
   # REDIS/CACHE CONFIGURATION
   # ============================================
   USE_PROD_REDIS=false

   # Production Redis
   REDIS_URL_PROD=redis://:password@production-host:6379

   # Development Redis
   REDIS_URL_DEV=redis://:password@localhost:6379

   # ============================================
   # FRONTEND CONFIGURATION
   # ============================================
   USE_PROD_FRONTEND=false

   # Production Frontend URL
   FRONTEND_URL_PROD=https://your-frontend-domain.com

   # Development Frontend URL
   FRONTEND_URL_DEV=http://localhost:5173

   # ============================================
   # BACKEND CONFIGURATION
   # ============================================
   USE_PROD_BACKEND=false

   # Production Backend URL
   BACKEND_URL_PROD=https://your-api-domain.com

   # Development Backend URL
   BACKEND_URL_DEV=http://localhost:3000

   # ============================================
   # IMAGEKIT CONFIGURATION
   # ============================================
   USE_PROD_IMAGEKIT=true

   # Production ImageKit
   IMAGEKIT_PUBLIC_KEY_PROD=your_public_key
   IMAGEKIT_PRIVATE_KEY_PROD=your_private_key
   IMAGEKIT_URL_ENDPOINT_PROD=https://ik.imagekit.io/your_imagekit_id

   # ============================================
   # JWT AUTHENTICATION
   # ============================================
   USE_PROD_JWT=false

   # Production JWT Secrets
   JWT_SECRET_PROD=your_jwt_secret_change_this
   REFRESH_TOKEN_SECRET_PROD=your_refresh_secret_change_this

   # Development JWT Secrets
   JWT_SECRET_DEV=dev_jwt_secret
   REFRESH_TOKEN_SECRET_DEV=dev_refresh_secret

   # JWT Configuration
   JWT_EXPIRES_IN=5m
   REFRESH_TOKEN_EXPIRES_IN=30d

   # ============================================
   # STRIPE PAYMENT CONFIGURATION
   # ============================================
   USE_PROD_STRIPE=true

   # Production Stripe Keys
   STRIPE_SECRET_KEY_PROD=sk_live_your_key
   STRIPE_PUBLIC_KEY_PROD=pk_live_your_key
   STRIPE_WEBHOOK_SECRET_PROD=whsec_your_secret

   # Development Stripe Keys
   STRIPE_SECRET_KEY_DEV=sk_test_your_key
   STRIPE_PUBLIC_KEY_DEV=pk_test_your_key
   STRIPE_WEBHOOK_SECRET_DEV=whsec_your_dev_secret

   # Stripe Product Configuration
   STRIPE_PRO_PRICE_ID=price_your_price_id
   STRIPE_PRO_PRICE_CENTS=999
   STRIPE_PRO_CURRENCY=usd
   ```

   **Environment Switching:**
   - Each resource has its own switch (e.g., `USE_PROD_DATABASE`, `USE_PROD_REDIS`)
   - Set to `true` to use production values, `false` for development
   - Mix and match as needed (e.g., use prod database with local Redis)
   - All environment-specific URLs are in the same `.env` file

   **Client** (`client/.env`):
   ```env
   # ============================================
   # API CONFIGURATION
   # ============================================
   USE_PROD_API=false

   # Production API URL
   VITE_API_URL_PROD=https://your-api-domain.com/api/v1

   # Development API URL
   VITE_API_URL_DEV=http://localhost:3000/api/v1

   # ============================================
   # STRIPE CONFIGURATION
   # ============================================
   USE_PROD_STRIPE=true

   # Production Stripe Public Key
   VITE_STRIPE_PUBLIC_KEY_PROD=pk_live_your_key

   # Development Stripe Public Key
   VITE_STRIPE_PUBLIC_KEY_DEV=pk_test_your_key
   ```

   **Environment Switching:**
   - Set `USE_PROD_API=true` to use production API
   - Set `USE_PROD_STRIPE=true` to use production Stripe keys
   - Both URLs are configured in the same `.env` file

4. **Set up the database**
   ```bash
   cd server
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
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
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (DB GUI)
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
npm run db:migrate             # Create and apply migration
npm run db:push                # Push schema changes without migration
npm run db:deploy              # Deploy migrations to production
npm run prisma:generate        # Generate Prisma client
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
3. Set root directory to `client`
4. Set environment variables:
   - `USE_PROD_API=true`
   - `VITE_API_URL_PROD=https://your-api-domain.com/api/v1`
   - `USE_PROD_STRIPE=true`
   - `VITE_STRIPE_PUBLIC_KEY_PROD=pk_live_your_key`
5. Deploy

### Backend (Render/Railway/Heroku)

1. Push code to GitHub
2. Create new web service
3. Set root directory to `server`
4. Set environment variables (see `.env.example`)
   - Set all `USE_PROD_*` switches to `true`
   - Configure production URLs and credentials
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Deploy

### Database (Aiven/Supabase/Neon)

1. Create PostgreSQL database
2. Update `DATABASE_URL_PROD` in server environment
3. Set `USE_PROD_DATABASE=true`
4. Run migrations: `npm run db:deploy`

### Redis (Upstash/Redis Cloud/Aiven)

1. Create Redis instance
2. Update `REDIS_URL_PROD` in server environment
3. Set `USE_PROD_REDIS=true`

## Environment Variables

### Server Environment Variables

The server uses individual resource switches for flexible environment configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `USE_PROD_DATABASE` | Use production database | `true` or `false` |
| `USE_PROD_REDIS` | Use production Redis | `true` or `false` |
| `USE_PROD_FRONTEND` | Use production frontend URL | `true` or `false` |
| `USE_PROD_BACKEND` | Use production backend URL | `true` or `false` |
| `USE_PROD_IMAGEKIT` | Use production ImageKit | `true` or `false` |
| `USE_PROD_JWT` | Use production JWT secrets | `true` or `false` |
| `USE_PROD_STRIPE` | Use production Stripe keys | `true` or `false` |
| `DATABASE_URL_DEV` | Development database URL | `postgresql://user:pass@localhost:5432/db` |
| `DATABASE_URL_PROD` | Production database URL | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL_DEV` | Development Redis URL | `redis://:pass@localhost:6379` |
| `REDIS_URL_PROD` | Production Redis URL | `redis://:pass@host:6379` |
| `FRONTEND_URL_DEV` | Development frontend URL | `http://localhost:5173` |
| `FRONTEND_URL_PROD` | Production frontend URL | `https://your-frontend.com` |
| `JWT_SECRET_DEV` | Development JWT secret | `dev_secret` |
| `JWT_SECRET_PROD` | Production JWT secret | `prod_secret` |
| `IMAGEKIT_PUBLIC_KEY_PROD` | ImageKit public key | `public_xxx` |
| `IMAGEKIT_PRIVATE_KEY_PROD` | ImageKit private key | `private_xxx` |
| `IMAGEKIT_URL_ENDPOINT_PROD` | ImageKit URL endpoint | `https://ik.imagekit.io/your_id` |
| `STRIPE_SECRET_KEY_PROD` | Stripe secret key | `sk_live_...` |
| `STRIPE_PUBLIC_KEY_PROD` | Stripe public key | `pk_live_...` |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID | `price_xxx` |

**Environment Switching:**
- Each resource has its own switch (e.g., `USE_PROD_DATABASE`)
- Set to `true` to use production values, `false` for development
- Mix and match as needed (e.g., use prod database with local Redis)
- All URLs are configured in the same `.env` file

### Client Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `USE_PROD_API` | Use production API | `true` or `false` |
| `USE_PROD_STRIPE` | Use production Stripe | `true` or `false` |
| `VITE_API_URL_DEV` | Development API URL | `http://localhost:3000/api/v1` |
| `VITE_API_URL_PROD` | Production API URL | `https://your-api.com/api/v1` |
| `VITE_STRIPE_PUBLIC_KEY_DEV` | Dev Stripe public key | `pk_test_...` |
| `VITE_STRIPE_PUBLIC_KEY_PROD` | Prod Stripe public key | `pk_live_...` |

**Environment Switching:**
- Set `USE_PROD_API=true` to use production API
- Set `USE_PROD_STRIPE=true` to use production Stripe keys
- Both URLs are configured in the same `.env` file

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
1. Ensure `FRONTEND_URL_DEV` or `FRONTEND_URL_PROD` is set in `server/.env`
2. Set the appropriate `USE_PROD_FRONTEND` switch
3. Restart the server completely
4. Check server logs for CORS configuration

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
