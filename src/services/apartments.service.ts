import { directus, ApartmentRecord } from "@/integrations/directus/client";
import { readItems, readItem, createItem, updateItem, deleteItem } from '@directus/sdk';
import { logger } from "@/utils/logger";

export interface Apartment {
  id: string;
  title: string;
  apartment_number: string;
  building_number?: string | null;
  housing_complex?: string | null;
  base_address?: string | null;
  description?: string | null;
  photos?: any;
  video_entrance?: any;
  video_lock?: any;
  wifi_name?: string | null;
  wifi_password?: string | null;
  code_building?: string | null;
  code_lock?: string | null;
  faq_checkin?: string | null;
  faq_apartment?: string | null;
  faq_area?: string | null;
  map_embed_code?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
}

export interface CreateApartmentDto {
  title: string;
  apartment_number: string;
  building_number?: string | null;
  housing_complex?: string | null;
  base_address?: string | null;
  description?: string | null;
  wifi_name?: string | null;
  wifi_password?: string | null;
  code_building?: string | null;
  code_lock?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
  faq_checkin?: string | null;
  faq_apartment?: string | null;
  faq_area?: string | null;
  map_embed_code?: string | null;
}

export interface UpdateApartmentDto extends Partial<CreateApartmentDto> {}

class ApartmentService {
  /**
   * Get all apartments
   */
  async getAll(): Promise<Apartment[]> {
    try {
      logger.api('GET', '/apartments');
      const items = await directus.request(
        readItems<ApartmentRecord>('apartments', {
          sort: ['-date_created'],
          fields: ['*'],
          limit: -1,
        })
      );
      
      return (items || []).map(this.mapToApartment);
    } catch (error) {
      logger.error('Failed to fetch apartments', error);
      throw new Error('Не удалось загрузить апартаменты');
    }
  }

  /**
   * Get single apartment by ID
   */
  async getById(id: string): Promise<Apartment | null> {
    try {
      logger.api('GET', `/apartments/${id}`);
      const item = await directus.request(
        readItem<ApartmentRecord>('apartments', id, {
          fields: ['*'],
        })
      );
      
      return item ? this.mapToApartment(item) : null;
    } catch (error) {
      logger.error(`Failed to fetch apartment ${id}`, error);
      throw new Error('Не удалось загрузить апартамент');
    }
  }

  /**
   * Create new apartment
   */
  async create(data: CreateApartmentDto): Promise<Apartment> {
    try {
      logger.api('POST', '/apartments', data);
      const created = await directus.request(
        createItem('apartments', this.mapToRecord(data))
      );
      
      return this.mapToApartment(created as ApartmentRecord);
    } catch (error) {
      logger.error('Failed to create apartment', error);
      throw new Error('Не удалось создать апартамент');
    }
  }

  /**
   * Update apartment
   */
  async update(id: string, data: UpdateApartmentDto): Promise<Apartment> {
    try {
      logger.api('PATCH', `/apartments/${id}`, data);
      const updated = await directus.request(
        updateItem('apartments', id, this.mapToRecord(data))
      );
      
      return this.mapToApartment(updated as ApartmentRecord);
    } catch (error) {
      logger.error(`Failed to update apartment ${id}`, error);
      throw new Error('Не удалось обновить апартамент');
    }
  }

  /**
   * Delete apartment
   */
  async delete(id: string): Promise<void> {
    try {
      logger.api('DELETE', `/apartments/${id}`);
      await directus.request(deleteItem('apartments', id));
    } catch (error) {
      logger.error(`Failed to delete apartment ${id}`, error);
      throw new Error('Не удалось удалить апартамент');
    }
  }

  /**
   * Map Directus record to domain model
   */
  private mapToApartment(record: ApartmentRecord): Apartment {
    return {
      id: record.id,
      title: record.title || '',
      apartment_number: record.apartment_number || '',
      building_number: record.building_number,
      housing_complex: record.housing_complex,
      base_address: record.base_address,
      description: record.description,
      photos: record.photos,
      video_entrance: record.video_entrance,
      video_lock: record.video_lock,
      wifi_name: record.wifi_name,
      wifi_password: record.wifi_password,
      code_building: record.code_building,
      code_lock: record.code_lock,
      faq_checkin: record.faq_checkin,
      faq_apartment: record.faq_apartment,
      faq_area: record.faq_area,
      map_embed_code: record.map_embed_code,
      manager_name: record.manager_name,
      manager_phone: record.manager_phone,
      manager_email: record.manager_email,
    };
  }

  /**
   * Map domain model to Directus record
   */
  private mapToRecord(data: CreateApartmentDto | UpdateApartmentDto): Partial<ApartmentRecord> {
    return {
      title: data.title,
      apartment_number: data.apartment_number,
      building_number: data.building_number,
      housing_complex: data.housing_complex,
      base_address: data.base_address,
      description: data.description,
      wifi_name: data.wifi_name,
      wifi_password: data.wifi_password,
      code_building: data.code_building,
      code_lock: data.code_lock,
      faq_checkin: data.faq_checkin,
      faq_apartment: data.faq_apartment,
      faq_area: data.faq_area,
      map_embed_code: data.map_embed_code,
      manager_name: data.manager_name,
      manager_phone: data.manager_phone,
      manager_email: data.manager_email,
    };
  }
}

export const apartmentService = new ApartmentService();