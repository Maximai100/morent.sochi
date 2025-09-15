# 🔧 Исправление проблемы загрузки бронирований

## 🐛 **Проблема**
- ✅ **Создание бронирований работает** - данные попадают в Directus
- ❌ **Загрузка бронирований не работает** - ошибка `Failed to fetch bookings`
- 🔍 **Directus URL:** `https://1.cycloscope.online`
- 🔍 **Запрос:** `GET /bookings` с `apartmentId: undefined`

## 🔍 **Анализ логов**

Из ваших логов видно:
```
[API] GET /bookings 
Object { apartmentId: undefined }
[ERROR] Failed to fetch bookings 
Object { errors: (1) […], response: Response }
```

Это означает, что:
1. Запрос отправляется корректно
2. Directus возвращает ошибку
3. Проблема в разрешениях или структуре данных

## ✅ **Решение**

### Шаг 1: Проверьте разрешения в Directus

1. **Откройте Directus Admin Panel:**
   - URL: `https://1.cycloscope.online/admin`

2. **Перейдите в настройки разрешений:**
   - Settings > Access Control > Roles
   - Выберите роль **Public**

3. **Настройте разрешения для коллекции bookings:**
   ```
   Collection: bookings
   ✅ Read: Allow
   ✅ Create: Allow  
   ✅ Update: Allow
   ✅ Delete: Allow
   ```

### Шаг 2: Проверьте структуру коллекции bookings

1. **Перейдите в Data Model:**
   - Settings > Data Model
   - Найдите коллекцию **bookings**

2. **Убедитесь, что поля существуют:**
   ```
   ✅ id (UUID, Primary Key)
   ✅ guest_name (String)
   ✅ apartment_id (String)
   ✅ checkin_date (Date)
   ✅ checkout_date (Date)
   ✅ slug (String)
   ✅ lock_code (String)
   ✅ date_created (DateTime)
   ✅ date_updated (DateTime)
   ```

### Шаг 3: Проверьте токен доступа

1. **Проверьте токен в настройках:**
   - Settings > Access Control > Roles > Public
   - Убедитесь, что есть **Static Token**

2. **Если токена нет, создайте его:**
   - Settings > Access Control > Tokens
   - Создайте новый токен для роли Public

### Шаг 4: Используйте компоненты диагностики

1. **Откройте приложение:** `http://localhost:8080/`
2. **Прокрутите вниз до секции диагностики**
3. **Нажмите "Test Directus Connection"** в компоненте DirectusDebug
4. **Нажмите "Test Booking Operations"** в компоненте BookingDebug

### Шаг 5: Проверьте результаты тестов

В компоненте BookingDebug должны отображаться:
- ✅ **allBookings:** Список всех бронирований
- ✅ **filteredBookings:** Бронирования с фильтром
- ✅ **createdBooking:** Созданное тестовое бронирование

Если есть ошибки, они покажут:
- **Статус ошибки** (401, 403, 404, 500)
- **Сообщение об ошибке**
- **Детали ответа сервера**

## 🔧 **Частые проблемы и решения**

### Проблема: 401 Unauthorized
**Причина:** Неправильный или отсутствующий токен
**Решение:** 
- Проверьте токен в `.env.local`
- Убедитесь, что токен активен в Directus

### Проблема: 403 Forbidden
**Причина:** Нет разрешений на чтение коллекции
**Решение:**
- Настройте разрешения для роли Public
- Убедитесь, что Read разрешен для bookings

### Проблема: 404 Not Found
**Причина:** Коллекция bookings не существует
**Решение:**
- Создайте коллекцию bookings в Directus
- Проверьте правильность названия коллекции

### Проблема: 500 Internal Server Error
**Причина:** Проблемы на сервере Directus
**Решение:**
- Проверьте логи сервера Directus
- Убедитесь, что сервер работает корректно

## 🧪 **Тестирование**

### Используйте компоненты диагностики:

1. **DirectusDebug:**
   - Тестирует подключение к серверу
   - Проверяет коллекции и разрешения
   - Показывает детальную информацию об ошибках

2. **BookingDebug:**
   - Тестирует операции с бронированиями
   - Проверяет создание и загрузку
   - Анализирует конкретную проблему

### Проверьте консоль браузера:

Откройте Developer Tools (F12) и проверьте:
- **Network tab:** Запросы к Directus
- **Console tab:** Логи приложения
- **Ошибки:** Статус коды и сообщения

## 📝 **Пример правильной конфигурации**

### Разрешения в Directus:
```
Role: Public
Collection: bookings
Permissions:
  ✅ Read: Allow
  ✅ Create: Allow
  ✅ Update: Allow
  ✅ Delete: Allow
```

### Структура коллекции bookings:
```
bookings/
├── id (UUID, Primary Key, Required)
├── guest_name (String, Required)
├── apartment_id (String, Required)
├── checkin_date (Date)
├── checkout_date (Date)
├── slug (String)
├── lock_code (String)
├── date_created (DateTime, Auto-generated)
└── date_updated (DateTime, Auto-generated)
```

### Переменные окружения:
```env
VITE_DIRECTUS_URL=https://1.cycloscope.online
VITE_DIRECTUS_STATIC_TOKEN=your_token_here
VITE_DEBUG=true
```

## 🚀 **После исправления**

1. **Перезапустите приложение:** `npm run dev`
2. **Откройте панель менеджера:** `http://localhost:8080/manager`
3. **Выберите апартамент**
4. **Проверьте, что бронирования загружаются**

---

*После выполнения всех шагов бронирования должны загружаться корректно!* 🎉
