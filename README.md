# DilemmaHub

https://dilemma-hub-ojkv.vercel.app/ 


A full-stack dilemma forum application where users can post moral and ethical dilemmas, vote on options, comment, and generate AI images using Pollinations.ai.

## 🚀 Tech Stack

**Backend:**
- Node.js with Express 5.2.1
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication with httpOnly cookies
- Argon2 password hashing
- Supabase Storage for AI-generated images
- Pollinations.ai for image generation

**Frontend:**
- Next.js 16.0.10
- React 19.2.0
- TypeScript
- Tailwind CSS 4.1.17
- Biome for linting and formatting

**Testing:**
- Jest with ts-jest
- Supertest for API testing
- Non-destructive test suite

**Deployment:**
- Docker & Docker Compose ready
- Supports AWS ECS, Azure Container Apps
- Render and Vercel compatible

## 📦 Quick Start with Docker

```bash
# Start production stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

## 🔧 Environment Variables

### Backend `.env` (root directory)

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/dilemma_hub"

# JWT (Required - generate a strong random secret)
JWT_SECRET=""

# Frontend URL (Required)
FRONTEND_URL="http://localhost:3000"

# Server
NODE_ENV=development
PORT=5000

# Supabase Storage (Required for AI image generation)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-supabase-service-key"

# Pollinations.ai (Required for AI image generation)
POLLINATIONS_API_KEY="your-pollinations-api-key"
```

### Frontend `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 💻 Development (without Docker)

### Backend Setup

```bash
cd backend
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run seed

# Start development server (with hot reload)
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

## 🧪 Testing

```bash
cd backend
npm test

# Watch mode
npm run test:watch
```

All tests are non-destructive and preserve existing database data.

## ✨ Features

### Core Functionality
- **User Authentication**: Register, login, logout with JWT tokens and httpOnly cookies
- **Create Dilemmas**: Post dilemmas with title, description, category, and multiple options
- **AI Image Generation**: Generate dilemma images using Pollinations.ai API
- **Voting System**: Vote on dilemmas with unique constraint per user/dilemma
- **Comments**: Add comments to dilemmas
- **User Profiles**: Update username, email, and change password

### Advanced Features
- **Category Filtering**: Ethics, Technology, Personal, Work, Politics, Lifestyle, Other
- **Search Functionality**: Search dilemmas by title and description
- **Trending Dilemmas**: View most popular dilemmas
- **Time Filters**: Filter by All Time, Today, This Week, This Month
- **My Posts**: View and manage your own dilemmas
- **Edit & Delete**: Authors can edit/delete their dilemmas
- **Global Stats**: Total dilemmas, votes, and comments
- **Image Proxy**: Secure image loading through backend proxy
- **Responsive UI**: Mobile-friendly design with Tailwind CSS

## 📊 Database Schema

### Models
- **User**: id, username, email, password (hashed with Argon2)
- **Dilemma**: id, title, description, category, options[], imageUrl, imagePrompt, authorId, createdAt
- **Vote**: id, userId, dilemmaId, option, createdAt (unique per user/dilemma)
- **Comment**: id, content, userId, dilemmaId, createdAt

### Categories
- ETHICS, TECHNOLOGY, PERSONAL, WORK, POLITICS, LIFESTYLE, OTHER

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user
- `POST /refresh` - Refresh JWT token
- `POST /logout` - Logout user
- `PUT /update-profile` - Update user profile (requires auth)
- `PUT /change-password` - Change password (requires auth)

### Dilemmas (`/api/dilemmas`)
- `GET /` - Get all dilemmas (supports query params: category, search, timeFilter)
- `GET /stats` - Get global statistics
- `GET /trending` - Get trending dilemmas
- `GET /categories` - Get available categories
- `GET /my-posts` - Get user's dilemmas (requires auth)
- `GET /user/:userId` - Get dilemmas by user ID
- `GET /:id` - Get dilemma by ID
- `POST /` - Create dilemma (requires auth)
- `PUT /:id` - Update dilemma (requires auth)
- `DELETE /:id` - Delete dilemma (requires auth)

### Votes (`/api/votes`)
- `GET /` - Get all votes
- `GET /:id` - Get vote by ID
- `GET /dilemma/:dilemmaId` - Get votes for dilemma
- `POST /` - Cast/update vote (requires auth)

### Comments (`/api/comments`)
- `GET /` - Get all comments
- `GET /dilemma/:dilemmaId` - Get comments for dilemma
- `GET /:id` - Get comment by ID
- `POST /` - Add comment (requires auth)

### AI (`/api/ai`)
- `POST /generate-image` - Generate AI image (requires auth)
- `POST /generate-comic` - Generate comic-style image (requires auth)

### Image Proxy (`/api/image-proxy`)
- `GET /` - Proxy external images securely

## 🏗️ Project Structure

```
dilemmahub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Sample data seeder
│   │   └── migrations/            # Database migrations
│   ├── src/
│   │   ├── index.ts               # Express server entry
│   │   ├── prisma.ts              # Prisma client
│   │   ├── supabaseClient.ts      # Supabase client
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/            # Auth middleware
│   │   ├── routes/                # API routes
│   │   └── services/              # Business logic (AI image service)
│   ├── tests/                     # Jest tests
│   └── Dockerfile                 # Backend Docker image
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Home page
│   │   ├── layout.tsx             # Root layout
│   │   ├── components/            # React components
│   │   ├── create/                # Create dilemma page
│   │   ├── dilemma/[id]/          # Dilemma detail page
│   │   ├── edit/[id]/             # Edit dilemma page
│   │   ├── my-posts/              # User's posts page
│   │   ├── profile/               # User profile page
│   │   ├── login/                 # Login page
│   │   └── register/              # Register page
│   ├── lib/
│   │   ├── api.ts                 # API client functions
│   │   ├── auth.ts                # Auth utilities
│   │   └── config.ts              # Configuration
│   └── Dockerfile                 # Frontend Docker image
├── docker-compose.yml              # Docker orchestration
├── DOCKER.md                       # Docker documentation
└── README.md                       # This file
```

## 🔒 Security Features

- CORS protection with configurable origins
- Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, XSS-Protection)
- Argon2 password hashing (more secure than bcrypt)
- JWT with httpOnly cookies to prevent XSS
- Request body size limits (10MB)
- Database connection health checks
- Input validation on all endpoints

## 🚢 Deployment

See [DOCKER.md](DOCKER.md) for detailed deployment instructions for:
- AWS ECS (Elastic Container Service)
- AWS Elastic Beanstalk
- AWS App Runner
- Azure Container Apps
- Azure Container Instances
- Azure App Service

## 📝 License

This project is open source and available for educational purposes.

