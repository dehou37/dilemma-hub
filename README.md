# DillemmaHub

A full-stack dilemma forum application with authentication, voting, and commenting features.

## Tech Stack

**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL  
**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS  
**Authentication:** JWT with httpOnly cookies, Argon2 password hashing  
**Testing:** Jest, ts-jest, supertest  
**Deployment:** Docker-ready for AWS/Azure

## Quick Start with Docker

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

## Environment Variables

Create `.env` file in root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dilemma_hub"
JWT_SECRET="your-super-secret-jwt-key-change-this"
FRONTEND_URL="http://localhost:3000"
NODE_ENV=development
```

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
cd backend
npm test
```

All tests are non-destructive and preserve existing database data.

## Deployment

See `DOCKER.md` for comprehensive deployment guides for AWS and Azure.

**Cost Estimates:**
- AWS ECS: ~$65/month
- Azure Container Apps: ~$50/month

## Features

- JWT-based authentication with refresh tokens
- Create, edit, and delete dilemmas
- Vote on dilemmas
- Comment on dilemmas
- Category filtering (Ethics, Technology, Personal, Work, Politics, Lifestyle, Other)
- Search functionality
- User profiles with password management
- Responsive UI with Tailwind CSS

