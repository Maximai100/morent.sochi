# Sochi Key Guide - Система управления апартаментами

## 📋 О проекте

Система управления апартаментами для отельного бизнеса в Сочи. Позволяет создавать персонализированные инструкции для гостей с информацией о заселении, кодах доступа, WiFi и другой важной информацией.

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- npm или yarn
- Directus instance

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd sochi-key-guide-main
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` на основе `.env.example`:
```bash
cp .env.example .env.local
```

4. Настройте переменные окружения в `.env.local`:
```env
VITE_DIRECTUS_URL=https://your-directus.com
VITE_DIRECTUS_STATIC_TOKEN=your-token
VITE_MANAGER_PASSWORD=your-secure-password
```

5. Запустите проект:
```bash
npm run dev
```

Проект будет доступен по адресу: http://localhost:8080

## 🏗️ Архитектура

### Технологии
- **Frontend:** React 18 + TypeScript
- **Стилизация:** Tailwind CSS + shadcn/ui
- **Состояние:** React Query (TanStack Query)
- **База данных:** Directus CMS
- **Маршрутизация:** React Router v6
- **Формы:** React Hook Form + Zod
- **Сборка:** Vite

### Структура проекта
```
src/
├── components/       # Переиспользуемые компоненты
│   ├── ui/          # UI компоненты (shadcn)
│   └── ...          # Бизнес-компоненты
├── contexts/        # React контексты
├── hooks/           # Кастомные хуки
├── pages/           # Страницы приложения
├── services/        # Сервисы для работы с API
├── schemas/         # Схемы валидации (Zod)
├── styles/          # Глобальные стили
├── utils/           # Утилиты
└── integrations/    # Интеграции (Directus)
```

## 📱 Основные страницы

### 1. Главная страница (`/`)
Точка входа с навигацией на панель менеджера и демо-гид.

### 2. Панель менеджера (`/manager`)
- **Требует авторизацию**
- Управление апартаментами
- Создание бронирований
- Загрузка медиафайлов

### 3. Страница гостя (`/apartment/:id`)
- Персонализированная информация для гостя
- Коды доступа
- Видео-инструкции
- Контакты

### 4. Логин (`/login`)
Страница авторизации для доступа к панели менеджера.

## 🔐 Безопасность

### Текущая реализация
- Базовая парольная защита панели менеджера
- Сессия сохраняется 24 часа
- Пароль задается через переменную окружения

### ⚠️ ВАЖНО для продакшена
1. **НЕ используйте статические токены Directus в клиентском коде**
2. Создайте backend API для проксирования запросов
3. Реализуйте JWT авторизацию
4. Настройте CORS правильно
5. Используйте HTTPS

## 🗄️ Настройка Directus

### Необходимые коллекции

#### 1. `apartments`
- title (string)
- apartment_number (string)
- building_number (string)
- base_address (string)
- description (text)
- photos (files - many)
- video_entrance (file)
- video_lock (file)
- wifi_name (string)
- wifi_password (string)
- code_building (string)
- code_lock (string)
- manager_name (string)
- manager_phone (string)
- manager_email (string)
- faq_checkin (text)
- faq_apartment (text)
- faq_area (text)
- map_embed_code (text)

#### 2. `bookings`
- guest_name (string)
- apartment_id (string/relation)
- checkin_date (date)
- checkout_date (date)
- slug (string)
- lock_code (string)

### Права доступа
Настройте права для роли токена:
- `apartments`: read, create, update, delete
- `bookings`: read, create, update, delete
- `directus_files`: read, create, delete

## 🚀 Деплой

### Вариант 1: Статический хостинг
```bash
npm run build
# Загрузите содержимое папки dist на хостинг
```

### Вариант 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Вариант 3: Vercel/Netlify
Автоматический деплой через интеграцию с GitHub.

## 🛠️ Скрипты

- `npm run dev` - запуск dev сервера
- `npm run build` - сборка для продакшена
- `npm run preview` - просмотр production сборки
- `npm run lint` - проверка кода

## 📈 Оптимизации

### Реализованные
- ✅ Lazy loading страниц
- ✅ Кэширование с React Query
- ✅ Оптимизированные изображения
- ✅ Мемоизация вычислений
- ✅ Debouncing/throttling
- ✅ TypeScript strict mode

### Планируемые
- [ ] Service Worker для offline
- [ ] PWA поддержка
- [ ] Image CDN интеграция
- [ ] Bundle splitting по маршрутам
- [ ] Виртуализация длинных списков

## 🐛 Известные проблемы

1. **CORS ошибки с Directus**
   - Решение: Настройте CORS в Directus для вашего домена

2. **413 Payload Too Large**
   - Решение: Увеличьте `client_max_body_size` в nginx

3. **Медленная загрузка медиа**
   - Решение: Используйте Directus transforms для оптимизации

## 📞 Поддержка

При возникновении проблем:
1. Проверьте `.env.local` настройки
2. Убедитесь что Directus доступен
3. Проверьте консоль браузера на ошибки
4. Проверьте права доступа в Directus

## 📄 Лицензия

Proprietary - All rights reserved

---

*Последнее обновление: 2025-09-10*