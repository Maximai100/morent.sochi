import { z } from 'zod';

/**
 * Apartment validation schema
 */
export const apartmentSchema = z.object({
  title: z.string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Название не должно превышать 100 символов'),
  
  apartment_number: z.string()
    .min(1, 'Номер апартамента обязателен')
    .regex(/^\d+$/, 'Номер должен содержать только цифры'),
  
  building_number: z.string().optional().nullable(),
  
  housing_complex: z.string()
    .max(100, 'Название ЖК не должно превышать 100 символов')
    .optional()
    .nullable(),
  
  base_address: z.string()
    .max(200, 'Адрес не должен превышать 200 символов')
    .optional()
    .nullable(),
  
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional()
    .nullable(),
  
  wifi_name: z.string()
    .max(50, 'Название WiFi не должно превышать 50 символов')
    .optional()
    .nullable(),
  
  wifi_password: z.string()
    .min(8, 'Пароль WiFi должен содержать минимум 8 символов')
    .max(50, 'Пароль WiFi не должен превышать 50 символов')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  code_building: z.string()
    .regex(/^[#*0-9]+$/, 'Код подъезда может содержать только цифры и символы # *')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  code_lock: z.string()
    .regex(/^\d{4,8}$/, 'Код замка должен содержать от 4 до 8 цифр')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  manager_name: z.string()
    .max(100, 'Имя менеджера не должно превышать 100 символов')
    .optional()
    .nullable(),
  
  manager_phone: z.string()
    .regex(/^(\+7|8|7)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/, 
      'Неверный формат телефона')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  manager_email: z.string()
    .email('Неверный формат email')
    .optional()
    .nullable()
    .or(z.literal('')),
  
  faq_checkin: z.string()
    .max(2000, 'FAQ по заселению не должно превышать 2000 символов')
    .optional()
    .nullable(),
  
  faq_apartment: z.string()
    .max(2000, 'FAQ по апартаментам не должно превышать 2000 символов')
    .optional()
    .nullable(),
  
  faq_area: z.string()
    .max(2000, 'FAQ по территории не должно превышать 2000 символов')
    .optional()
    .nullable(),
  
  map_embed_code: z.string()
    .max(5000, 'Код карты не должен превышать 5000 символов')
    .optional()
    .nullable(),
});

export type ApartmentFormData = z.infer<typeof apartmentSchema>;

/**
 * Partial schema for updates (all fields optional)
 */
export const apartmentUpdateSchema = apartmentSchema.partial();

export type ApartmentUpdateFormData = z.infer<typeof apartmentUpdateSchema>;