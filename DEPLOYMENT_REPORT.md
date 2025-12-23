# 🚀 Deployment Report: K-LIÉE Portfolio Site

**Домен:** k-liee.com
**GitHub Repository:** https://github.com/simvol2030/k-liee-site
**Дата создания:** 2025-12-08
**Статус:** Ready for Deployment

---

## 📊 Обзор проекта

### Стек технологий:
- **Backend:** Hono 4.x + TypeScript + Node.js 20+
- **Frontend:** React Router 7 (Remix) + React 19 + Vite 7
- **Database:** Prisma 6 + SQLite (dev) / PostgreSQL (prod)
- **Process Manager:** PM2
- **Web Server:** nginx
- **SSL:** Let's Encrypt (certbot)

### Структура проекта:
```
k-liee-site/
├── backend-hono/          # Hono backend API
├── frontend-remix/        # React Router 7 frontend
├── prisma/                # Shared Prisma schema
├── data/db/               # SQLite databases (git-ignored)
├── docker-compose.yml     # Docker orchestration
└── .env.example           # Environment template
```

---

## 🎯 Что уже сделано

### ✅ Фаза 1: Git и GitHub (Завершено)
- [x] Git репозиторий инициализирован
- [x] .gitignore настроен
- [x] Initial commit создан (771 файлов, 165,085 строк кода)
- [x] GitHub репозиторий создан: https://github.com/simvol2030/k-liee-site
- [x] Ветки созданы локально: `main`, `dev`, `mine`

### ⚠️ Требуется вручную:
**Пуш кода в GitHub:**
```bash
# Настройте SSH ключи или используйте GitHub Desktop для пуша:
git push -u origin main
git push origin dev
git push origin mine
```

---

## 📝 Инструкции для деплоймента

### Фаза 2: Подготовка сервера (30-40 минут)

#### Шаг 2.1: Проверить занятые порты на сервере

```bash
# SSH на сервер
ssh user@yourserver.com

# Проверить занятые порты
ss -tulnp | grep LISTEN | awk '{print $5}' | cut -d: -f2 | sort -nu

# Проверить PM2 процессы
pm2 list
```

**Рекомендуемые порты для k-liee.com:**
- **Production Backend:** 3010 (или первый свободный)
- **Production Frontend:** 3020 (или первый свободный)

**ВАЖНО:** Запишите выбранные порты - они понадобятся для `.env` файлов и nginx конфигурации!

---

#### Шаг 2.2: Клонировать репозиторий на сервер

```bash
# Production deployment
cd /opt/websites
sudo mkdir -p k-liee.com
sudo chown $USER:$USER k-liee.com
git clone https://github.com/simvol2030/k-liee-site.git k-liee.com
cd k-liee.com
git checkout mine  # Production использует ветку mine
```

**ОПЦИОНАЛЬНО: Development окружение**
Если нужен dev поддомен (например, `dev.k-liee.com`):
```bash
cd /opt/websites
sudo mkdir -p dev.k-liee.com
sudo chown $USER:$USER dev.k-liee.com
git clone https://github.com/simvol2030/k-liee-site.git dev.k-liee.com
cd dev.k-liee.com
git checkout dev  # Development использует ветку dev
```

---

#### Шаг 2.3: Создать .env файлы

**Production Backend** (`/opt/websites/k-liee.com/backend-hono/.env`):
```env
NODE_ENV=production
PORT=3010
DATABASE_URL="file:../../data/db/app.db?mode=rwc&journal_mode=WAL"
ALLOWED_ORIGINS="https://k-liee.com,https://www.k-liee.com"
LOG_LEVEL=info
```

**Production Frontend** (`/opt/websites/k-liee.com/frontend-remix/.env`):
```env
NODE_ENV=production
DATABASE_URL="file:../../data/db/app.db?mode=rwc&journal_mode=WAL"
SESSION_SECRET="$(openssl rand -hex 32)"
API_URL="http://localhost:3010"
```

**ВАЖНО:** Замените порт `3010` на тот, который вы выбрали в Шаге 2.1!

---

#### Шаг 2.4: Исправить backend-hono/package.json (КРИТИЧЕСКИ ВАЖНО!)

**Проблема:** Backend использует `"type": "commonjs"`, но TypeScript генерирует ES modules.

**Решение:**
```bash
cd /opt/websites/k-liee.com/backend-hono
sed -i 's/"type": "commonjs"/"type": "module"/' package.json
```

Проверьте результат:
```bash
grep '"type"' package.json
# Должно быть: "type": "module"
```

---

#### Шаг 2.5: Установить зависимости

```bash
# Backend
cd /opt/websites/k-liee.com/backend-hono
npm install

# Frontend
cd /opt/websites/k-liee.com/frontend-remix
npm install
```

---

#### Шаг 2.6: Настроить Prisma

**Если Prisma схема в корне проекта:**
```bash
cd /opt/websites/k-liee.com

# Скопировать schema в backend и frontend
cp prisma/schema.prisma backend-hono/prisma/
cp prisma/schema.prisma frontend-remix/prisma/
```

**Сгенерировать Prisma Client и применить миграции:**
```bash
# Backend
cd backend-hono
npx prisma generate
npx prisma migrate deploy

# Frontend
cd ../frontend-remix
npx prisma generate
```

---

#### Шаг 2.7: Собрать проекты

```bash
# Backend
cd /opt/websites/k-liee.com/backend-hono
npm run build

# Frontend
cd /opt/websites/k-liee.com/frontend-remix
npm run build
```

**Проверьте, что сборка прошла без ошибок!**

---

#### Шаг 2.8: Запустить PM2 процессы

**Найдите путь к Node.js:**
```bash
which node
# Например: /home/webmaster/.nvm/versions/node/v22.15.0/bin/node
```

**Запустите процессы:**
```bash
# Production Backend
cd /opt/websites/k-liee.com/backend-hono
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 start npm --name kliee-backend -- start

# Production Frontend
cd /opt/websites/k-liee.com/frontend-remix
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 start npm --name kliee-frontend -- start

# Сохранить PM2 конфигурацию
/home/webmaster/.nvm/versions/node/v22.15.0/bin/pm2 save
```

**ВАЖНО:** Используйте `pm2 start npm -- start`, НЕ `pm2 start dist/index.js`!

---

#### Шаг 2.9: Проверить работоспособность

```bash
# Проверить PM2 процессы
pm2 list | grep kliee

# Проверить логи
pm2 logs kliee-backend --lines 20 --nostream
pm2 logs kliee-frontend --lines 20 --nostream

# Проверить health endpoints
curl -s http://localhost:3010/health || curl -s http://localhost:3010/api/users
curl -s http://localhost:3020 | head -5
```

**Все должно работать и отвечать!**

---

### Фаза 3: Настройка Nginx и SSL (15-20 минут)

#### Шаг 3.1: Создать nginx конфигурацию

**В домашней директории:**
```bash
mkdir -p ~/nginx-configs
vim ~/nginx-configs/k-liee.com.conf
```

**Nginx конфигурация** (`~/nginx-configs/k-liee.com.conf`):
```nginx
# Backend API server
upstream kliee_backend {
    server localhost:3010;
}

# Frontend React Router server
upstream kliee_frontend {
    server localhost:3020;
}

server {
    server_name k-liee.com www.k-liee.com;

    # API requests go to backend
    location /api/ {
        proxy_pass http://kliee_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check for backend
    location /health {
        proxy_pass http://kliee_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # All other requests go to frontend
    location / {
        proxy_pass http://kliee_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}
```

**ВАЖНО:** Замените порты `3010` и `3020` на свои!

---

#### Шаг 3.2: Применить nginx конфигурацию

```bash
# Создать бэкап (если конфиг уже существует)
sudo cp /etc/nginx/sites-available/k-liee.com /etc/nginx/sites-available/k-liee.com.backup-$(date +%Y%m%d-%H%M%S)

# Применить конфигурацию
sudo cp ~/nginx-configs/k-liee.com.conf /etc/nginx/sites-available/k-liee.com
sudo ln -sf /etc/nginx/sites-available/k-liee.com /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезагрузить nginx
sudo systemctl reload nginx
```

---

#### Шаг 3.3: Установить SSL сертификаты

```bash
# Проверить DNS перед установкой SSL
dig +short k-liee.com
dig +short www.k-liee.com

# Установить SSL сертификаты
sudo certbot --nginx -d k-liee.com -d www.k-liee.com
```

Certbot автоматически:
- Получит сертификат от Let's Encrypt
- Обновит nginx конфигурацию с SSL
- Настроит автоматическое продление

---

#### Шаг 3.4: Финальная проверка

```bash
# Проверить HTTPS
curl -I https://k-liee.com
curl -I https://www.k-liee.com

# Проверить health endpoint
curl -s https://k-liee.com/health

# Проверить API (если есть публичные endpoints)
curl -s https://k-liee.com/api/users | jq

# Проверить frontend
curl -s https://k-liee.com | head -3
```

**Всё должно работать через HTTPS!**

---

## 🔄 Workflow для разработки

### Обновление Development окружения (dev.k-liee.com):

```bash
# На сервере
cd /opt/websites/dev.k-liee.com
git pull origin dev

# Если изменились зависимости
cd backend-hono && npm install && cd ..
cd frontend-remix && npm install && cd ..

# Пересобрать проекты
cd backend-hono && npm run build && cd ..
cd frontend-remix && npm run build && cd ..

# Перезапустить PM2
pm2 restart dev-kliee-backend dev-kliee-frontend
```

---

### Обновление Production окружения (k-liee.com):

**1. Протестировать на dev окружении**

**2. Merge в ветку mine:**
```bash
# На локальной машине
git checkout mine
git merge dev
git push origin mine
```

**3. Деплой на production:**
```bash
# На сервере
cd /opt/websites/k-liee.com
git pull origin mine

# Если изменились зависимости
cd backend-hono && npm install && cd ..
cd frontend-remix && npm install && cd ..

# Пересобрать проекты
cd backend-hono && npm run build && cd ..
cd frontend-remix && npm run build && cd ..

# Если изменилась Prisma схема
cd backend-hono && npx prisma migrate deploy && npx prisma generate && cd ..
cd frontend-remix && npx prisma generate && cd ..

# Перезапустить PM2
pm2 restart kliee-backend kliee-frontend

# Проверить логи
pm2 logs kliee-backend --lines 20 --nostream
pm2 logs kliee-frontend --lines 20 --nostream
```

---

## 🛠 Полезные команды

### PM2 Management
```bash
# Список процессов
pm2 list

# Логи процесса
pm2 logs kliee-backend --lines 100

# Перезапуск процесса
pm2 restart kliee-backend

# Остановка процесса
pm2 stop kliee-backend

# Удаление процесса
pm2 delete kliee-backend

# Сохранить конфигурацию
pm2 save

# Автозапуск при перезагрузке
pm2 startup
```

---

### Nginx Management
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка
sudo systemctl reload nginx

# Рестарт
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx

# Логи ошибок
sudo tail -f /var/log/nginx/error.log
```

---

### Database Management
```bash
# Бэкап базы данных
cp /opt/websites/k-liee.com/data/db/app.db /opt/websites/k-liee.com/data/db/app.db.backup-$(date +%Y%m%d)

# Применить миграции
cd /opt/websites/k-liee.com/backend-hono
npx prisma migrate deploy

# Открыть Prisma Studio
npx prisma studio

# Сбросить базу (ОСТОРОЖНО!)
npx prisma migrate reset
```

---

## 🎯 Чек-лист деплоймента

После завершения проверьте:

- [ ] GitHub репозиторий создан и доступен
- [ ] Ветки созданы: main, dev, mine
- [ ] Код запушен в GitHub (вручную)
- [ ] Код склонирован на сервер в `/opt/websites/k-liee.com`
- [ ] `.env` файлы созданы для backend и frontend
- [ ] `backend-hono/package.json` имеет `"type": "module"`
- [ ] Зависимости установлены (`npm install`)
- [ ] Prisma Client сгенерирован (`npx prisma generate`)
- [ ] Миграции применены (`npx prisma migrate deploy`)
- [ ] Проекты собраны (`npm run build`)
- [ ] PM2 процессы запущены (2 процесса: backend + frontend)
- [ ] PM2 конфигурация сохранена (`pm2 save`)
- [ ] Nginx конфигурация применена
- [ ] SSL сертификаты установлены
- [ ] HTTPS работает на домене k-liee.com
- [ ] Health endpoints отвечают
- [ ] API endpoints работают
- [ ] Frontend загружается

---

## 🚨 Типичные проблемы и решения

### Проблема 1: Backend не запускается - "Cannot use import statement outside a module"

**Причина:** `"type": "commonjs"` в `package.json`, но TypeScript генерирует ES modules.

**Решение:**
```bash
cd /opt/websites/k-liee.com/backend-hono
sed -i 's/"type": "commonjs"/"type": "module"/' package.json
npm run build
pm2 restart kliee-backend
```

---

### Проблема 2: PM2 процесс падает сразу после запуска

**Решение:**
```bash
# Проверить логи
pm2 logs kliee-backend --lines 50

# Запустить вручную для отладки
cd /opt/websites/k-liee.com/backend-hono
npm start

# Проверить порт
lsof -i :3010
```

---

### Проблема 3: nginx возвращает 502 Bad Gateway

**Решение:**
```bash
# Проверить PM2 процессы
pm2 list | grep kliee

# Проверить порт
curl http://localhost:3010/health

# Проверить логи nginx
sudo tail -f /var/log/nginx/error.log

# Перезагрузить nginx
sudo systemctl reload nginx
```

---

### Проблема 4: SSL сертификат не установился

**Решение:**
```bash
# Проверить DNS
dig +short k-liee.com
# Должен вернуть IP сервера

# Подождать 5-10 минут для DNS propagation
# Повторить certbot
sudo certbot --nginx -d k-liee.com -d www.k-liee.com
```

---

## 📞 Контакты и поддержка

**GitHub Repository:** https://github.com/simvol2030/k-liee-site
**Домен:** k-liee.com

**При возникновении проблем:**
1. Проверьте логи PM2: `pm2 logs`
2. Проверьте логи nginx: `sudo tail -f /var/log/nginx/error.log`
3. Проверьте порты: `ss -tulnp | grep LISTEN`

---

## 📝 Примечания

- Всегда тестируйте на dev окружении перед production деплоем
- Делайте бэкапы базы данных перед миграциями
- Не коммитьте `.env` файлы в Git!
- Используйте `pm2 logs` для мониторинга приложений
- Certbot автоматически продлевает сертификаты (проверяется дважды в день)

---

**Документ создан:** 2025-12-08
**Версия:** 1.0
**Автор:** Claude Sonnet 4.5 (Claude Code)

**Статус:** ✅ Ready for Production Deployment
