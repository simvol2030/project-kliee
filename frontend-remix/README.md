# React Router (Remix) Frontend - Production-Ready Starter Kit

Полнофункциональный full-stack фреймворк на базе React Router v7 (formerly Remix) с production-ready setup.

## 🎯 Особенности

### ✅ Готово к Production

- **React Router v7.9.2** - Современный full-stack фреймворк
- **React 19.1.1** - Последняя версия React
- **TypeScript 5.9.2** - Полная типизация
- **Vite 7.1.7** - Быстрая сборка
- **Tailwind CSS 4.1.13** - Utility-first CSS
- **Prisma 6.19.0** - Type-safe ORM для базы данных
- **Docker Support** - Multi-stage builds для dev и production

### 🔐 Security & Auth

- **Session Management** - Cookie-based sessions с httpOnly
- **Auth Utilities** - Готовые функции для аутентификации
- **CSRF Protection** - Встроенная защита
- **Environment Variables** - Безопасное хранение секретов

### 📊 Database & ORM

- **Prisma ORM** - Type-safe queries
- **SQLite** - Легкая база данных (можно заменить на PostgreSQL)
- **Singleton Pattern** - Переиспользование соединений
- **Migrations** - Управление схемой БД

### 🏥 Monitoring

- **Health Check** - `/api/health` endpoint с метриками
- **Memory Usage** - Отслеживание использования памяти
- **Uptime Stats** - Статистика работы сервера
- **Database Status** - Проверка подключения к БД

---

## 🚀 Quick Start

### Вариант 1: Локальный запуск

```bash
# Установить зависимости
npm install

# Сгенерировать Prisma client
npm run prisma:generate

# Запустить dev server
npm run dev
```

**Доступ**: http://localhost:5173

### Вариант 2: Docker

```bash
# Запустить Remix в Docker
docker-compose up frontend-remix

# Или все frontend'ы
docker-compose --profile frontend up
```

**Доступ**: http://localhost:5175

---

## 📁 Структура Проекта

```
frontend-remix/
├── app/
│   ├── routes/
│   │   ├── home.tsx              # Главная страница
│   │   ├── api.health.ts         # Health check endpoint
│   │   └── routes.ts             # Route configuration
│   ├── utils/
│   │   ├── db.server.ts          # Prisma client singleton
│   │   ├── session.server.ts    # Session management
│   │   └── singleton.server.ts  # Singleton utility
│   ├── welcome/
│   │   └── welcome.tsx           # Welcome component
│   └── root.tsx                  # Root layout
├── public/                       # Static assets
├── build/                        # Production build
├── Dockerfile                    # Multi-stage Docker setup
├── vite.config.ts                # Vite configuration
├── react-router.config.ts        # React Router config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies & scripts
```

---

## 🛠️ Доступные Скрипты

```bash
# Development
npm run dev              # Запустить dev server с hot-reload
npm run build            # Собрать для production
npm run start            # Запустить production server
npm run typecheck        # Проверить TypeScript ошибки

# Prisma
npm run prisma:generate  # Сгенерировать Prisma client
npm run prisma:studio    # Открыть Prisma Studio (GUI)
npm run prisma:migrate   # Применить миграции БД
```

---

## 🗄️ Database Setup

### Использование в Loaders

```typescript
import { db } from "~/utils/db.server";

export async function loader() {
  const users = await db.user.findMany();
  return json({ users });
}
```

---

## 🔐 Authentication

### Session Management

```typescript
import { getUserId, requireUserId, createUserSession } from "~/utils/session.server";

// Require authentication (or redirect)
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });
  return json({ user });
}
```

---

## 🏥 Health Check

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "ok",
  "database": "connected",
  "memory": {
    "heapUsed": "45MB"
  }
}
```

---

## 🐳 Docker Setup

```bash
# Development
docker-compose up frontend-remix

# Production
docker build --target production -t remix-app ./frontend-remix
```

---

## 📚 Learn More

- [React Router Docs](https://reactrouter.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Status**: ✅ Production-Ready
