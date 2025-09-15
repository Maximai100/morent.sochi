import { directus, BookingRecord } from "@/integrations/directus/client";
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { logger } from "@/utils/logger";
import { formatDateForAPI } from "@/utils/date";

export interface Booking {
  id: string;
  guest_name: string;
  apartment_id: string;
  checkin_date?: string | null;
  checkout_date?: string | null;
  slug?: string | null;
  lock_code?: string | null;
}

export interface CreateBookingDto {
  guest_name: string;
  apartment_id: string;
  checkin_date?: string | null;
  checkout_date?: string | null;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {}

class BookingService {
  /**
   * Get all bookings (optionally filtered by apartment)
   */
  async getAll(apartmentId?: string): Promise<Booking[]> {
    try {
      logger.api('GET', '/bookings', { apartmentId });
      
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
      
      return (items || []).map(this.mapToBooking);
    } catch (error) {
      logger.error('Failed to fetch bookings', error);
      throw new Error('Не удалось загрузить бронирования');
    }
  }

  /**
   * Get single booking by ID
   */
  async getById(id: string): Promise<Booking | null> {
    try {
      logger.api('GET', `/bookings/${id}`);
      const item = await directus.request(
        readItem<BookingRecord>('bookings', id)
      );
      
      return item ? this.mapToBooking(item) : null;
    } catch (error) {
      logger.error(`Failed to fetch booking ${id}`, error);
      throw new Error('Не удалось загрузить бронирование');
    }
  }

  /**
   * Create new booking
   */
  async create(data: CreateBookingDto): Promise<Booking> {
    try {
      logger.api('POST', '/bookings', data);
      
      // Convert dates to API format
      const payload = {
        ...data,
        checkin_date: formatDateForAPI(data.checkin_date),
        checkout_date: formatDateForAPI(data.checkout_date),
      };

      // Try different field name variants for compatibility
      const variants = [
        { ...payload, apartment_id: data.apartment_id },
        { ...payload, apartment: data.apartment_id },
        { ...payload, check_in_date: payload.checkin_date, check_out_date: payload.checkout_date },
      ];

      let created: any = null;
      let lastError: any;

      for (const variant of variants) {
        try {
          // Remove undefined/null values
          const clean = Object.fromEntries(
            Object.entries(variant).filter(([_, v]) => v !== undefined && v !== null && v !== '')
          );
          created = await directus.request(createItem('bookings', clean));
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!created) {
        throw lastError || new Error('Failed to create booking');
      }
      
      return this.mapToBooking(created);
    } catch (error) {
      logger.error('Failed to create booking', error);
      throw new Error('Не удалось создать бронирование');
    }
  }

  /**
   * Update booking
   */
  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    try {
      logger.api('PATCH', `/bookings/${id}`, data);
      
      // Convert dates to API format
      const payload = {
        ...data,
        checkin_date: data.checkin_date ? formatDateForAPI(data.checkin_date) : undefined,
        checkout_date: data.checkout_date ? formatDateForAPI(data.checkout_date) : undefined,
      };

      // Try different field name variants
      const variants = [
        { ...payload },
        { ...payload, check_in_date: payload.checkin_date, check_out_date: payload.checkout_date },
      ];

      let updated: any = null;
      let lastError: any;

      for (const variant of variants) {
        try {
          const clean = Object.fromEntries(
            Object.entries(variant).filter(([_, v]) => v !== undefined && v !== null && v !== '')
          );
          updated = await directus.request(updateItem('bookings', id, clean as any));
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!updated) {
        throw lastError || new Error('Failed to update booking');
      }
      
      return this.mapToBooking(updated);
    } catch (error) {
      logger.error(`Failed to update booking ${id}`, error);
      throw new Error('Не удалось обновить бронирование');
    }
  }

  /**
   * Delete booking
   */
  async delete(id: string): Promise<void> {
    try {
      logger.api('DELETE', `/bookings/${id}`);
      await directus.request(deleteItem('bookings', id));
    } catch (error) {
      logger.error(`Failed to delete booking ${id}`, error);
      throw new Error('Не удалось удалить бронирование');
    }
  }

  /**
   * Generate guest link for booking
   */
  generateGuestLink(
    apartmentId: string,
    guestName: string,
    checkIn?: string,
    checkOut?: string,
    lockCode?: string,
    entranceCode?: string,
    wifiPassword?: string
  ): string {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      guest: guestName,
      ...(checkIn && { checkin: checkIn }),
      ...(checkOut && { checkout: checkOut }),
      ...(lockCode && { lock: lockCode }),
      ...(entranceCode && { entrance: entranceCode }),
      ...(wifiPassword && { wifi: wifiPassword }),
    });
    
    return `${baseUrl}/apartment/${apartmentId}?${params.toString()}`;
  }

  /**
   * Map Directus record to domain model
   */
  private mapToBooking(record: any): Booking {
    return {
      id: record.id,
      guest_name: record.guest_name || '',
      apartment_id: record.apartment_id || record.apartment || '',
      checkin_date: record.checkin_date || record.check_in_date || null,
      checkout_date: record.checkout_date || record.check_out_date || null,
      slug: record.slug || null,
      lock_code: record.lock_code || null,
    };
  }
}

export const bookingService = new BookingService();