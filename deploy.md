---
title: Deploy Next.js App with Docker on Ubuntu VPS
created: 2026-01-06
updated: 2026-01-06
tags:
  - docs
  - deployment
  - docker
  - vps
  - ubuntu
  - postgres
  - nextjs
  - guide
  - devops
category: infrastructure
status: active
---

# Deploy Next.js App with Docker on Ubuntu VPS

Complete guide for deploying this Next.js application with PostgreSQL using Docker on an Ubuntu VPS.

## Prerequisites

- Ubuntu VPS with SSH access
- Domain name (optional, for Nginx setup)
- Basic terminal knowledge

---

## 1. Install Docker

SSH into your VPS, then run:

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Verify installation
sudo docker --version
```

## 2. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

## 3. Configure Docker

```bash
# Add your user to docker group (avoid using sudo for every command)
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker

# Enable Docker to start on boot
sudo systemctl enable docker
```

## 4. Create Docker Compose File

Create a `docker-compose.yml` in your project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      POSTGRES_DB: ${POSTGRES_DB:-myapp}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-changeme}@postgres:5432/${POSTGRES_DB:-myapp}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

## 5. Create Dockerfile

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

## 6. Update next.config.ts

Add to your `next.config.ts`:

```typescript
const nextConfig = {
  output: 'standalone', // Required for Docker
  // ... your existing config
}
```

## 7. Create .env file

On your VPS:

```bash
nano .env
```

Add:

```env
POSTGRES_USER=myuser
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=myapp
```

## 8. Deploy Your App

### Transfer Code to VPS

From your local machine:

```bash
# Option 1: Using rsync
rsync -avz --exclude node_modules --exclude .git --exclude .next . user@your-vps-ip:/home/user/app/

# Option 2: Using git (recommended)
# On VPS:
git clone your-repo-url
```

### Build and Start

On the VPS:

```bash
# Navigate to your app directory
cd /home/user/app

# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check running containers
docker ps
```

## 9. Setup Nginx Reverse Proxy (Optional)

For production with a domain name:

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/myapp
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 10. Useful Docker Commands

```bash
# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up -d --build

# Database backup
docker exec postgres pg_dump -U postgres myapp > backup.sql

# Restore database
docker exec -i postgres psql -U postgres myapp < backup.sql

# Shell into app container
docker-compose exec app sh

# Shell into postgres container
docker-compose exec postgres psql -U postgres myapp
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check all containers
docker-compose ps
```

### Database connection issues

```bash
# Verify DATABASE_URL in .env
# Check if postgres container is healthy
docker-compose ps postgres
```

### Port already in use

```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill if needed
sudo kill -9 <PID>
```

---

## Related Documentation

- [[CLAUDE.md]] - Project architecture and commands
- Docker Documentation: https://docs.docker.com
- Next.js Deployment: https://nextjs.org/docs/deployment
