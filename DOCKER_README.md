# Docker Setup for Task Management App

**Configured for your project:**
- Database: `tomerapp`
- Server port: `5001`
- Frontend directory: `./client`
- Backend directory: `./server`

Complete Docker configuration for your React + Express + PostgreSQL application.

## Prerequisites

1. Install Docker Desktop for Mac: https://www.docker.com/products/docker-desktop/
2. Verify installation:
   ```bash
   docker --version
   docker-compose --version
   ```

## Project Structure

```
your-project/
├── client/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── src/
├── server/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── .env (create this - see below)
│   └── src/
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Environment Setup

### 1. Create Backend .env File

Create `server/.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:secret@db:5432/tomerapp

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=5001
NODE_ENV=development
```

**Important:** Never commit `.env` to git!

## Usage

### Development Mode (with hot-reloading)

```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Mode

```bash
# Build and start
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v
```

## Common Commands

```bash
# Rebuild specific service
docker-compose build backend

# View running containers
docker ps

# Execute command in running container
docker-compose exec backend npm run migrate

# View logs for specific service
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Remove all stopped containers and volumes
docker-compose down -v
```

## Accessing Services

Once running:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **PostgreSQL:** localhost:5432

## Database Management

### Initial Setup & Seeding

The database is automatically initialized with the schema on first run using `server/init.sql`.

**For detailed seeding options, see [DATABASE_SEEDING.md](DATABASE_SEEDING.md)**

Quick seed commands:
```bash
# Automatic (first time only) - uses init.sql
docker-compose up

# Manual seeding anytime - run seed script
docker-compose exec backend npm run seed

# Fresh start with initial data
docker-compose down -v
docker-compose up
```

### Run Migrations

```bash
docker-compose exec backend npm run migrate
```

### Connect to PostgreSQL

```bash
# Using psql inside container
docker-compose exec db psql -U postgres -d tomerapp

# Or from your Mac (if you have psql installed)
psql -h localhost -U postgres -d tomerapp
```

### Backup Database

```bash
docker-compose exec db pg_dump -U postgres tomerapp > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db psql -U postgres tomerapp < backup.sql
```

## Troubleshooting

### Port Already in Use

If you get "port is already allocated" errors:

```bash
# Find process using port 5001
lsof -ti:5001 | xargs kill -9

# Or use different ports in docker-compose.yml
ports:
  - "5002:5001"  # Change external port
```

### Database Connection Issues

```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Clean Start

If things are misbehaving:

```bash
# Stop everything
docker-compose down

# Remove volumes (deletes data!)
docker-compose down -v

# Remove all Docker images
docker system prune -a

# Start fresh
docker-compose up --build
```

### Apple Silicon (M1/M2) Issues

If you encounter platform issues:

```bash
# Add to docker-compose.yml services
platform: linux/amd64
```

## Development Workflow

1. **First time setup:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

2. **Daily development:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```
   Your code changes will hot-reload automatically!

3. **When you change dependencies:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

## Production Deployment

For production, you'd typically:

1. Build optimized images
2. Use environment-specific variables
3. Deploy to cloud provider (AWS, DigitalOcean, etc.)
4. Use orchestration (Kubernetes, Docker Swarm, or managed services)

## Notes

- The frontend builds to an nginx container in production
- Backend runs with nodemon in development for hot-reloading
- PostgreSQL data persists in a named volume
- All services communicate via the `app-network` bridge network

## Need Help?

Check the logs:
```bash
docker-compose logs -f [service-name]
```

Inspect container:
```bash
docker-compose exec [service-name] sh
```
