import { z } from 'zod';
import { parseDisplayDate } from '@/utils/date';

/**
 * Booking validation schema
 */
export const bookingSchema = z.object({
  guest_name: z.string()
    .min(2, 'Имя гостя должно содержать минимум 2 символа')
    .max(100, 'Имя гостя не должно превышать 100 символов')
    .regex(/^[а-яА-ЯёЁa-zA-Z\s-]+$/, 'Имя может содержать только буквы, пробелы и дефисы'),
  
  apartment_id: z.string()
    .min(1, 'Выберите апартамент'),
  
  checkin_date: z.string()
    .min(1, 'Укажите дату заезда')
    .refine((val) => {
      const date = parseDisplayDate(val);
      return date !== null;
    }, 'Неверный формат даты (ДД.ММ.ГГГГ)')
    .refine((val) => {
      const date = parseDisplayDate(val);
      if (!date) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'Дата заезда не может быть в прошлом'),
  
  checkout_date: z.string()
    .min(1, 'Укажите дату выезда')
    .refine((val) => {
      const date = parseDisplayDate(val);
      return date !== null;
    }, 'Неверный формат даты (ДД.ММ.ГГГГ)'),
  
  lock_code: z.string()
    .regex(/^\d{4,8}$/, 'Код замка должен содержать от 4 до 8 цифр')
    .optional()
    .nullable()
    .or(z.literal('')),
}).refine((data) => {
  const checkinDate = parseDisplayDate(data.checkin_date);
  const checkoutDate = parseDisplayDate(data.checkout_date);
  
  if (!checkinDate || !checkoutDate) return true; // Already validated above
  
  return checkoutDate > checkinDate;
}, {
  message: 'Дата выезда должна быть позже даты заезда',
  path: ['checkout_date'],
});

export type BookingFormData = z.infer<typeof bookingSchema>;

/**
 * Partial schema for updates
 */
export const bookingUpdateSchema = bookingSchema.partial().refine((data) => {
  if (!data.checkin_date || !data.checkout_date) return true;
  
  const checkinDate = parseDisplayDate(data.checkin_date);
  const checkoutDate = parseDisplayDate(data.checkout_date);
  
  if (!checkinDate || !checkoutDate) return true;
  
  return checkoutDate > checkinDate;
}, {
  message: 'Дата выезда должна быть позже даты заезда',
  path: ['checkout_date'],
});

export type BookingUpdateFormData = z.infer<typeof bookingUpdateSchema>;