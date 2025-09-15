# ✅ Исправление проблемы загрузки бронирований

## 🐛 **Проблема была найдена и исправлена!**

### **Причина проблемы:**
Из логов было видно:
```
XHRGET https://1.cycloscope.online/items/bookings?sort=-date_created&limit=50&filter=undefined
[HTTP/1.1 400  0ms]
```

**Проблема:** Параметр `filter=undefined` в URL вызывал ошибку 400 (Bad Request) в Directus.

## ✅ **Исправления**

### 1. **Исправлен сервис бронирований** (`src/services/bookings.service.ts`)

**Было:**
```typescript
const filter = apartmentId 
  ? { apartment_id: { _eq: apartmentId } } as any
  : undefined;

const items = await directus.request(
  readItems<BookingRecord>('bookings', {
    sort: ['-date_created'],
    filter,  // ← Это передавало undefined в URL
    limit: 50,
  })
);
```

**Стало:**
```typescript
// Строим параметры запроса
const queryParams: any = {
  sort: ['-date_created'],
  limit: 50,
};

// Добавляем фильтр только если apartmentId задан
if (apartmentId) {
  queryParams.filter = { apartment_id: { _eq: apartmentId } };
}

const items = await directus.request(
  readItems<BookingRecord>('bookings', queryParams)
);
```

### 2. **Исправлена генерация ссылки для гостя** (`src/pages/ManagerPanel.tsx`)

**Было:**
```typescript
const link = `${baseUrl}/apartment/${formData.apartmentId}?${params.toString()}`;
// ← formData.apartmentId мог быть undefined
```

**Стало:**
```typescript
// Проверяем, что apartmentId выбран
if (!formData.apartmentId) {
  logger.debug('No apartment selected, returning base link');
  return `${baseUrl}/apartment/`;
}

const link = `${baseUrl}/apartment/${formData.apartmentId}?${params.toString()}`;
```

## 🧪 **Тестирование**

### **Что должно работать теперь:**

1. **Загрузка всех бронирований:**
   - URL: `https://1.cycloscope.online/items/bookings?sort=-date_created&limit=50`
   - ✅ Без параметра `filter=undefined`

2. **Загрузка бронирований по апартаменту:**
   - URL: `https://1.cycloscope.online/items/bookings?sort=-date_created&limit=50&filter[apartment_id][_eq]=apartment-id`
   - ✅ С правильным фильтром

3. **Генерация ссылки для гостя:**
   - ✅ Если апартамент не выбран: `http://localhost:8080/apartment/`
   - ✅ Если апартамент выбран: `http://localhost:8080/apartment/apartment-id?params`

### **Проверьте в браузере:**

1. **Откройте панель менеджера:** `http://localhost:8080/manager`
2. **Выберите апартамент** (или оставьте без выбора)
3. **Проверьте, что бронирования загружаются** без ошибок
4. **Проверьте консоль браузера** - не должно быть ошибок 400

## 📊 **Результат**

- ✅ **Исправлена ошибка 400** в запросах к Directus
- ✅ **Убраны undefined параметры** из URL
- ✅ **Улучшена генерация ссылок** для гостей
- ✅ **Добавлена проверка** на пустые значения

## 🔍 **Логи после исправления**

Теперь в консоли должно быть:
```
[API] GET /bookings 
Object { apartmentId: undefined }
XHRGET https://1.cycloscope.online/items/bookings?sort=-date_created&limit=50
[HTTP/1.1 200 OK]  ← Успешный ответ!
```

Вместо:
```
XHRGET https://1.cycloscope.online/items/bookings?sort=-date_created&limit=50&filter=undefined
[HTTP/1.1 400]  ← Ошибка!
```

---

*Проблема с загрузкой бронирований исправлена! Теперь бронирования должны загружаться корректно.* 🎉
