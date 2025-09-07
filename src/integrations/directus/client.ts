import { createDirectus, rest, staticToken } from '@directus/sdk';

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://1.cycloscope.online';
const DIRECTUS_STATIC_TOKEN = import.meta.env.VITE_DIRECTUS_STATIC_TOKEN || '-cMyVc4fp4kN79rCjGqGzFJYvKurLeGB';

export const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_STATIC_TOKEN))
  .with(rest());

export type ApartmentRecord = {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  title: string | null;
  apartment_number: string | null;
  building_number: string | null;
  base_address: string | null;
  description: string | null;
  photos: any;
  video_entrance: any;
  video_lock: any;
  wifi_name: string | null;
  wifi_password: string | null;
  code_building: string | null;
  code_lock: string | null;
  faq_checkin: string | null;
  faq_apartment: string | null;
  faq_area: string | null;
  map_embed_code: string | null;
  manager_name: string | null;
  manager_phone: string | null;
  manager_email: string | null;
};

export type BookingRecord = {
  id: string;
  date_created: string | null;
  date_updated: string | null;
  guest_name: string;
  apartment_id: string;
  slug: string | null;
  checkin_date: string | null;
  checkout_date: string | null;
  lock_code?: string | null;
};
