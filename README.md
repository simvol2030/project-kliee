# 🚀 Hono + Remix Starter Kit - Production-Ready

**Production-ready starter kit** для быстрого развертывания веб-приложений с использованием Hono (backend) и React Router 7 / Remix (frontend).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002.svg)](https://hono.dev/)
[![Remix](https://img.shields.io/badge/React_Router-7.x-CA4245.svg)](https://reactrouter.com/)

---

## 📦 Tech Stack

### Frontend
- **React Router 7 (Remix)** - Full-stack React framework with SSR/SSG
- **React 19** - Latest React version
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Vite 7** - Ultra-fast build tool

### Backend
- **Hono 4** - Ultra-fast, multi-runtime web framework
- **TypeScript 5** - Type safety
- **Zod** - Schema validation
- **Rate Limiting** - DDoS protection

### Database & ORM
- **Prisma 6** - Next-generation ORM
- **SQLite** - Development database (with WAL mode)
- **PostgreSQL 16** - Production database (optional)

### DevSecOps
- **Security Headers** - Protection against common attacks
- **CORS** - Configurable cross-origin policies
- **Rate Limiting** - Brute-force protection
- **Input Validation** - Zod schema validation
- **Docker** - Containerization with hot-reload

---

## 🎯 Features

✅ **Full-Stack TypeScript** - Type safety from frontend to backend
✅ **Prisma ORM** - Easy database migrations and queries
✅ **Hot Reload** - Docker volumes for instant dev feedback
✅ **Production Ready** - Security headers, rate limiting, error handling
✅ **SQLite + WAL** - High-performance dev database
✅ **PostgreSQL Ready** - Easy switch for production
✅ **RESTful API** - Standardized endpoints
✅ **Health Checks** - Docker healthcheck support

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x+
- npm/pnpm/yarn
- Docker & Docker Compose (optional)

### 1. Clone & Install

```bash
git clone <repo-url>
cd project-box-combo-1

# Install root dependencies (Prisma)
npm install

# Install backend dependencies
cd backend-hono
npm install
cd ..

# Install frontend dependencies
cd frontend-remix
npm install
cd ..
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
# Edit .env with your settings
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Development

**Option A: Without Docker**

```bash
# Terminal 1 - Backend (Hono)
cd backend-hono
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Frontend (Remix)
cd frontend-remix
npm run dev
# App runs on http://localhost:5173
```

**Option B: With Docker (Recommended)**

```bash
# Start full stack
docker-compose up

# Or in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

Open http://localhost:5173 in your browser.

---

## 📁 Project Structure

```
project-box-combo-1/
├── backend-hono/              # Hono backend
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── routes/           # API routes
│   │   └── middleware/       # CORS, rate limiting, etc.
│   ├── Dockerfile
│   └── package.json
│
├── frontend-remix/            # React Router 7 (Remix) frontend
│   ├── app/
│   │   ├── routes/           # Page routes
│   │   ├── components/       # React components
│   │   └── root.tsx          # Root layout
│   ├── public/               # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── prisma/
│   └── schema.prisma         # Shared Prisma schema
│
├── data/
│   └── db/                   # SQLite databases (git-ignored)
│
├── docs/                     # Documentation
├── docker-compose.yml        # Docker orchestration
├── .env.example              # Environment template
└── README.md
```

---

## 🗄️ Database

### SQLite (Default for Development)

```env
DATABASE_URL="file:./data/db/app.db?mode=rwc&journal_mode=WAL"
```

**Benefits:**
- ✅ No dependencies
- ✅ WAL mode for concurrent reads/writes
- ✅ Perfect for development and small projects
- ✅ Single file database

### PostgreSQL (For Production)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

**Steps to switch:**

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Run migrations:
```bash
npx prisma migrate dev
```

3. Start with PostgreSQL:
```bash
docker-compose --profile database up
```

---

## 📊 API Endpoints

All endpoints are prefixed with `/api`:

### Health Check
```
GET  /health              - Service health status
```

### Users
```
GET    /api/users         - List all users
GET    /api/users/:id     - Get user by ID
POST   /api/users         - Create new user
PUT    /api/users/:id     - Update user
DELETE /api/users/:id     - Delete user
```

### Posts
```
GET    /api/posts         - List all posts
GET    /api/posts/:id     - Get post by ID
POST   /api/posts         - Create new post
PUT    /api/posts/:id     - Update post
DELETE /api/posts/:id     - Delete post
```

---

## 🔒 Security Features

### Backend (Hono)
- ✅ **Rate Limiting** - Prevents DDoS and brute-force attacks
- ✅ **CORS** - Configurable cross-origin resource sharing
- ✅ **Input Validation** - Zod schema validation on all inputs
- ✅ **Error Handling** - Safe error responses without leaking internals
- ✅ **Graceful Shutdown** - Proper cleanup on server stop

### Frontend (Remix)
- ✅ **CSP Headers** - Content Security Policy
- ✅ **CSRF Protection** - Built-in session management
- ✅ **XSS Prevention** - React's automatic escaping
- ✅ **Type Safety** - TypeScript throughout

---

## 🐳 Docker

### Commands

```bash
# Start full stack
docker-compose up

# Start with PostgreSQL
docker-compose --profile database up

# Rebuild containers
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f backend-hono
docker-compose logs -f frontend-remix

# Execute commands in containers
docker-compose exec backend-hono npm run prisma:migrate
docker-compose exec frontend-remix npm run typecheck
```

### Development Features

- ✅ **Hot Reload** - Code changes reflect instantly
- ✅ **Volume Mounts** - Source code synced with containers
- ✅ **Health Checks** - Automatic service monitoring
- ✅ **Network Isolation** - Services communicate via Docker network

---

## 🛠️ Development Commands

### Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Backend (Hono)

```bash
cd backend-hono

npm run dev          # Development server with hot reload
npm run build        # Build for production
npm start            # Start production server
```

### Frontend (Remix)

```bash
cd frontend-remix

npm run dev          # Development server
npm run build        # Build for production
npm start            # Start production server
npm run typecheck    # TypeScript type checking
```

---

## 🚀 Deployment

### Build for Production

**Backend:**
```bash
cd backend-hono
npm run build
npm start
```

**Frontend:**
```bash
cd frontend-remix
npm run build
npm start
```

### Deployment Platforms

**Frontend (Remix):**
- ✅ Vercel
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ Railway
- ✅ Fly.io
- ✅ VPS with PM2/systemd

**Backend (Hono):**
- ✅ Cloudflare Workers
- ✅ Vercel Edge Functions
- ✅ Railway
- ✅ Render
- ✅ Fly.io
- ✅ VPS with PM2/systemd

---

## 🎯 Use Cases

This starter kit is ideal for:

- 🛍️ **E-commerce** - Online stores, marketplaces
- 📰 **Content Sites** - Blogs, news portals, documentation
- 📊 **Data Aggregators** - Dashboard, analytics platforms
- 💬 **Telegram Mini Apps** - Web apps inside Telegram
- 🚀 **SaaS Products** - Small to medium SaaS applications
- 🎨 **Portfolios & Landing Pages** - Personal sites, marketing pages

---

## 📚 Documentation

For detailed framework documentation:
- [Hono Documentation](https://hono.dev/)
- [React Router 7 Documentation](https://reactrouter.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

Project-specific documentation:
- [Research Results](./docs/RESEARCH_RESULTS.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)
- [Docker Setup Guide](./DOCKER-SETUP.md)
- [Completion Summary](./COMPLETION-SUMMARY.md)

---

## 🧪 Testing

```bash
# Backend tests
cd backend-hono
npm run test

# Frontend tests
cd frontend-remix
npm run test
npm run test:e2e    # E2E tests with Playwright
```

---

## 📝 Environment Variables

### Backend (.env in backend-hono/)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=file:../data/db/app.db?mode=rwc&journal_mode=WAL
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env in frontend-remix/)
```env
NODE_ENV=development
DATABASE_URL=file:../data/db/app.db?mode=rwc&journal_mode=WAL
SESSION_SECRET=development-secret-change-in-production
API_URL=http://localhost:3001
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use this starter kit for any project.

---

## 📧 Support

For questions or issues:
- Create an issue in the repository
- Check the documentation in `./docs/`

---

**Built with ❤️ for rapid web application development**
