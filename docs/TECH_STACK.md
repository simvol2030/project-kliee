# Tech Stack - Hono + Remix

**Updated:** 2025-12-07
**Status:** Production-Ready ✅

---

## 🎯 Overview

This starter kit combines two powerful frameworks:
- **Backend:** Hono - Ultra-fast, multi-runtime web framework
- **Frontend:** React Router 7 (Remix) - Full-stack React framework

---

## 🔧 Backend - Hono

### Why Hono?

- **Ultra-fast** - One of the fastest web frameworks available
- **Multi-runtime** - Works on Node.js, Bun, Deno, Cloudflare Workers
- **Lightweight** - Minimal dependencies, small bundle size
- **Web Standards** - Built on Web Standards API
- **TypeScript First** - Excellent TypeScript support
- **Middleware Ecosystem** - Rich middleware ecosystem

### Version Information

```json
{
  "hono": "^4.10.7",
  "@hono/node-server": "^1.19.6",
  "@hono/zod-validator": "^0.7.5",
  "typescript": "^5.9.3",
  "@prisma/client": "^6.19.0",
  "zod": "^4.1.13"
}
```

### Key Features

✅ **Fast Routing** - Trie-based router for O(1) lookups
✅ **Validation** - Built-in Zod validator
✅ **CORS** - Configurable CORS middleware
✅ **Rate Limiting** - DDoS and brute-force protection
✅ **Type Safety** - Full TypeScript support with inference
✅ **Middleware** - Composable middleware system

### Production Features

- Security headers configuration
- Rate limiting (hono-rate-limiter)
- Input validation with Zod schemas
- CORS policy management
- Error handling middleware
- Graceful shutdown
- Health check endpoints

### Deployment Targets

- Node.js servers
- Cloudflare Workers
- Vercel Edge Functions
- Deno Deploy
- Bun runtime
- VPS with PM2/systemd

---

## 🎨 Frontend - React Router 7 (Remix)

### Why React Router 7?

- **Full-Stack** - Backend + frontend in one framework
- **React-based** - Uses React 19
- **Type-Safe** - TypeScript throughout
- **SSR/SSG** - Server-side rendering and static generation
- **Nested Routing** - Powerful routing system
- **Data Loading** - Integrated data fetching

### Version Information

```json
{
  "react-router": "^7.9.2",
  "@react-router/node": "^7.9.2",
  "@react-router/serve": "^7.9.2",
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "typescript": "^5.9.2",
  "tailwindcss": "^4.1.13",
  "vite": "^7.1.7"
}
```

### Key Features

✅ **File-Based Routing** - Convention over configuration
✅ **Loaders** - Server-side data loading
✅ **Actions** - Form submissions and mutations
✅ **Error Boundaries** - Error handling per route
✅ **Meta Tags** - SEO-friendly meta tag management
✅ **CSS Support** - Tailwind CSS integration
✅ **Hot Module Replacement** - Fast development experience

### Production Features

- Built-in session management
- CSRF protection
- Progressive enhancement
- Code splitting
- Prefetching
- Optimistic UI updates
- SEO optimization

### Deployment Targets

- Vercel
- Netlify
- Cloudflare Pages
- Railway
- Fly.io
- VPS with PM2/systemd

---

## 🗄️ Database - Prisma ORM

### Why Prisma?

- **Type-Safe** - Fully typed database client
- **Multi-Database** - SQLite, PostgreSQL, MySQL, etc.
- **Migrations** - Declarative database migrations
- **Introspection** - Generate schema from existing DB
- **Studio** - Visual database browser

### Version Information

```json
{
  "prisma": "^6.19.0",
  "@prisma/client": "^6.19.0"
}
```

### Database Support

**Development:**
- SQLite with WAL mode
- Fast, zero-config
- Single file database

**Production:**
- PostgreSQL 16
- MySQL 8
- MongoDB
- CockroachDB

### Key Features

✅ **Type Generation** - Auto-generated TypeScript types
✅ **Query Builder** - Intuitive query API
✅ **Relations** - Easy relationship management
✅ **Transactions** - Atomic operations
✅ **Middleware** - Query lifecycle hooks
✅ **Connection Pooling** - Production-ready pooling

---

## 🔒 Security Stack

### Backend Security (Hono)

**Rate Limiting:**
```typescript
import { rateLimiter } from 'hono-rate-limiter'

app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}))
```

**CORS:**
```typescript
import { cors } from 'hono/cors'

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}))
```

**Input Validation:**
```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

app.post('/api/users', zValidator('json', schema), async (c) => {
  const data = c.req.valid('json')
  // ...
})
```

### Frontend Security (Remix)

- CSRF protection (built-in)
- XSS prevention (React escaping)
- Content Security Policy headers
- Session management
- Secure cookie handling

---

## 🐳 DevOps Stack

### Docker

**Base Images:**
- `node:20-alpine` - Production
- `node:20` - Development

**Features:**
- Multi-stage builds
- Health checks
- Volume mounts for hot-reload
- Network isolation
- Graceful shutdown

### Environment Management

**.env Structure:**
```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=file:../data/db/app.db?mode=rwc&journal_mode=WAL
ALLOWED_ORIGINS=http://localhost:5173

# Frontend
SESSION_SECRET=your-secret-key-change-in-production
API_URL=http://localhost:3001
```

---

## 📊 Performance Benchmarks

### Hono Performance

- **Requests/sec:** ~50,000 on Node.js
- **Latency:** <1ms for simple routes
- **Memory:** Minimal overhead
- **Bundle Size:** ~50KB minified

### Remix Performance

- **TTFB:** <100ms with SSR
- **FCP:** <1s on fast connections
- **Bundle Size:** Optimized with code splitting
- **Lighthouse Score:** 95+ achievable

---

## 🛠️ Development Tools

### TypeScript Configuration

Both frontend and backend use strict TypeScript:
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Linting & Formatting

Recommended setup:
- ESLint for code quality
- Prettier for formatting
- TypeScript for type checking

### Testing

Recommended tools:
- Vitest for unit tests
- Playwright for E2E tests
- Supertest for API testing

---

## 📚 Resources

### Official Documentation

- [Hono Documentation](https://hono.dev/)
- [React Router 7 Documentation](https://reactrouter.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

### Tutorials & Guides

- [Hono Examples](https://github.com/honojs/hono/tree/main/examples)
- [Remix Tutorials](https://remix.run/docs/en/main/tutorials/blog)
- [Prisma Guides](https://www.prisma.io/docs/guides)

### Community

- [Hono Discord](https://discord.gg/honojs)
- [Remix Discord](https://rmx.as/discord)
- [Prisma Discord](https://pris.ly/discord)

---

## 🎯 Best Practices

### Code Organization

**Backend (Hono):**
```
backend-hono/
├── src/
│   ├── index.ts        # Entry point
│   ├── routes/         # Route handlers
│   ├── middleware/     # Custom middleware
│   └── lib/            # Utilities
```

**Frontend (Remix):**
```
frontend-remix/
├── app/
│   ├── routes/         # Pages & API routes
│   ├── components/     # Reusable components
│   ├── lib/            # Utilities
│   └── root.tsx        # Root layout
```

### Error Handling

Always use try-catch and proper error responses:
```typescript
// Backend
app.post('/api/users', async (c) => {
  try {
    const data = await c.req.json()
    // ... process
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})
```

### Type Safety

Leverage TypeScript for end-to-end type safety:
```typescript
// Shared types
type User = {
  id: number
  email: string
  name: string
}

// Backend returns typed response
// Frontend gets typed data in loader
```

---

**Last Updated:** 2025-12-07
**Status:** ✅ Production-Ready
