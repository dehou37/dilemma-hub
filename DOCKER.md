# DilemmHub - Docker Setup

## 🐳 Quick Start

### Production Mode
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Your app will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: localhost:5432

### Development Mode (with hot reload)
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## 📦 What's Included

### Services
- **PostgreSQL** - Database (port 5432)
- **Backend** - Node.js + Express API (port 5000)
- **Frontend** - Next.js app (port 3000)

### Docker Files
- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development with hot reload
- `backend/Dockerfile` - Production backend image
- `backend/Dockerfile.dev` - Development backend image
- `frontend/Dockerfile` - Production frontend image
- `frontend/Dockerfile.dev` - Development frontend image

## 🚀 Deployment

### AWS Deployment Options

#### 1. **AWS ECS (Elastic Container Service)** ✅ Recommended
```bash
# Build images
docker-compose build

# Tag for ECR
docker tag dilemmahub-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/dilemmahub-backend:latest
docker tag dilemmahub-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/dilemmahub-frontend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/dilemmahub-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/dilemmahub-frontend:latest
```

**Services needed:**
- Amazon ECS (Fargate)
- Amazon RDS (PostgreSQL)
- Application Load Balancer
- Amazon ECR (Container Registry)

#### 2. **AWS Elastic Beanstalk**
- Use `docker-compose.yml`
- Supports multi-container Docker
- Automatic scaling and load balancing

#### 3. **AWS App Runner**
- Simplest option
- One service per container
- Automatic CI/CD from GitHub

### Azure Deployment Options

#### 1. **Azure Container Apps** ✅ Recommended
```bash
# Login to Azure
az login

# Create container registry
az acr create --resource-group myResourceGroup --name dilemmahubacr --sku Basic

# Build and push
az acr build --registry dilemmahubacr --image dilemmahub-backend:latest ./backend
az acr build --registry dilemmahubacr --image dilemmahub-frontend:latest ./frontend

# Deploy to Container Apps
az containerapp create \
  --name dilemmahub-backend \
  --resource-group myResourceGroup \
  --image dilemmahubacr.azurecr.io/dilemmahub-backend:latest
```

**Services needed:**
- Azure Container Apps
- Azure Database for PostgreSQL
- Azure Container Registry

#### 2. **Azure App Service**
- Use Docker Compose
- Easy deployment from GitHub
- Integrated CI/CD

#### 3. **Azure Kubernetes Service (AKS)**
- For larger scale
- More complex setup
- Full Kubernetes features

## 🔧 Environment Variables

### Production
Create `.env` files for each service:

**backend/.env**
```env
DATABASE_URL=postgresql://user:password@host:5432/dilemmahub
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=production
```

**frontend/.env**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Docker Compose Override
For local overrides, create `docker-compose.override.yml`:
```yaml
services:
  backend:
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/dilemmahub
```

## 🛠️ Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in container
docker-compose exec backend npm run seed
docker-compose exec backend npx prisma migrate deploy

# Stop services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v

# Restart single service
docker-compose restart backend
```

## 🧪 Testing in Docker

```bash
# Run tests in backend container
docker-compose exec backend npm test

# Run tests during build
docker build --target builder -t test-backend ./backend
```

## 📊 Monitoring

### Health Checks
All services have health checks configured:
- Database: `pg_isready`
- Backend: HTTP endpoint check
- Frontend: Process check

### View container stats
```bash
docker stats
```

## 🔒 Security Best Practices

1. **Never commit** `.env` files
2. Use **secrets management** in production (AWS Secrets Manager, Azure Key Vault)
3. Run containers as **non-root user** (already configured in frontend)
4. Keep images **updated** regularly
5. Use **specific version tags** instead of `latest` in production

## 💰 Cost Estimates

### AWS (Monthly)
- **ECS Fargate (2 tasks)**: ~$30
- **RDS PostgreSQL (t3.micro)**: ~$15
- **ALB**: ~$20
- **Total**: ~$65/month

### Azure (Monthly)
- **Container Apps (2 apps)**: ~$25
- **Azure PostgreSQL (Basic)**: ~$25
- **Total**: ~$50/month

*Prices are estimates and vary by region*

## 🐛 Troubleshooting

### Database connection issues
```bash
# Check if database is ready
docker-compose exec db pg_isready -U postgres

# View database logs
docker-compose logs db
```

### Backend won't start
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend image
docker-compose build --no-cache backend
```

### Frontend build fails
```bash
# Check frontend logs
docker-compose logs frontend

# Try building locally first
cd frontend && npm run build
```

## 📚 Next Steps

1. Set up CI/CD pipeline (GitHub Actions)
2. Configure domain and SSL
3. Set up monitoring (CloudWatch/Azure Monitor)
4. Configure autoscaling
5. Set up backup strategy for database
