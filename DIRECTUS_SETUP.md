# 🔧 Настройка Directus для загрузки бронирований

## 🐛 **Проблема**
Бронирования не загружаются из Directus при открытии приложения.

## 🔍 **Возможные причины**

### 1. **Отсутствуют переменные окружения**
Приложение не может подключиться к Directus без правильной конфигурации.

### 2. **Неправильный URL Directus**
Сервер Directus недоступен или URL указан неверно.

### 3. **Проблемы с токеном доступа**
Токен не настроен или не имеет необходимых разрешений.

### 4. **Коллекция bookings не существует**
В Directus нет коллекции с бронированиями.

## ✅ **Решение**

### Шаг 1: Создайте файл `.env.local`

Создайте файл `.env.local` в корне проекта со следующим содержимым:

```env
# Directus Configuration
VITE_DIRECTUS_URL=http://localhost:8055
VITE_DIRECTUS_STATIC_TOKEN=your_static_token_here
VITE_DEBUG=true
```

### Шаг 2: Настройте Directus сервер

1. **Установите Directus** (если еще не установлен):
   ```bash
   npm install -g @directus/cli
   ```

2. **Создайте новый проект**:
   ```bash
   directus create
   ```

3. **Запустите Directus**:
   ```bash
   directus start
   ```

### Шаг 3: Создайте коллекцию bookings

1. Откройте Directus Admin Panel (обычно `http://localhost:8055/admin`)
2. Перейдите в **Settings > Data Model**
3. Создайте новую коллекцию **bookings** со следующими полями:

```json
{
  "id": "string (UUID, Primary Key)",
  "guest_name": "string (Required)",
  "apartment_id": "string (Required)",
  "checkin_date": "date",
  "checkout_date": "date",
  "slug": "string",
  "lock_code": "string",
  "date_created": "datetime",
  "date_updated": "datetime"
}
```

### Шаг 4: Настройте разрешения

1. Перейдите в **Settings > Access Control > Roles**
2. Выберите роль **Public**
3. В разделе **Permissions** для коллекции **bookings**:
   - ✅ **Read**: Allow
   - ✅ **Create**: Allow
   - ✅ **Update**: Allow
   - ✅ **Delete**: Allow

### Шаг 5: Получите статический токен

1. Перейдите в **Settings > Access Control > Roles**
2. Выберите роль **Public**
3. Скопируйте **Static Token** (если есть)
4. Если токена нет, создайте его в **Settings > Access Control > Tokens**

### Шаг 6: Добавьте тестовые данные

Создайте несколько тестовых бронирований в Directus:

```json
{
  "guest_name": "Иван Петров",
  "apartment_id": "apartment-uuid-here",
  "checkin_date": "2024-01-15",
  "checkout_date": "2024-01-20",
  "lock_code": "1234"
}
```

## 🧪 **Диагностика**

### Используйте компонент DirectusDebug

1. Откройте приложение: `http://localhost:8080/`
2. Прокрутите вниз до секции "Directus Debug Information"
3. Нажмите "Test Directus Connection"
4. Проверьте результаты тестов

### Проверьте консоль браузера

Откройте Developer Tools (F12) и проверьте:
- Ошибки сети в вкладке **Network**
- Ошибки JavaScript в вкладке **Console**
- Логи приложения

### Проверьте переменные окружения

В компоненте DirectusDebug должны отображаться:
- ✅ **directusUrl**: URL вашего Directus сервера
- ✅ **hasToken**: true (если токен настроен)
- ✅ **tokenLength**: длина токена (должна быть > 0)

## 🔧 **Частые проблемы и решения**

### Проблема: "Directus URL is not configured"
**Решение**: Создайте файл `.env.local` с переменной `VITE_DIRECTUS_URL`

### Проблема: "Failed to connect to Directus server"
**Решение**: 
- Проверьте, что Directus сервер запущен
- Проверьте правильность URL в `.env.local`
- Проверьте доступность сервера в браузере

### Проблема: "Failed to fetch bookings"
**Решение**:
- Проверьте, что коллекция `bookings` существует
- Проверьте разрешения для роли Public
- Проверьте правильность токена

### Проблема: "No bookings found"
**Решение**:
- Добавьте тестовые данные в Directus
- Проверьте, что `apartment_id` в бронированиях соответствует существующим апартаментам

## 📝 **Пример полной конфигурации**

### `.env.local`:
```env
VITE_DIRECTUS_URL=http://localhost:8055
VITE_DIRECTUS_STATIC_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_DEBUG=true
```

### Структура коллекции bookings в Directus:
```
bookings/
├── id (UUID, Primary Key)
├── guest_name (String, Required)
├── apartment_id (String, Required)
├── checkin_date (Date)
├── checkout_date (Date)
├── slug (String)
├── lock_code (String)
├── date_created (DateTime)
└── date_updated (DateTime)
```

## 🚀 **После настройки**

1. Перезапустите приложение: `npm run dev`
2. Откройте панель менеджера: `http://localhost:8080/manager`
3. Выберите апартамент
4. Проверьте, что бронирования загружаются

---

*После выполнения всех шагов бронирования должны загружаться корректно!* 🎉
