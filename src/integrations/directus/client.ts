import { createDirectus, rest, staticToken } from '@directus/sdk';

// Configuration: read from Vite env; optionally allow runtime overrides only in development
const isProduction = import.meta.env.PROD;
export const DIRECTUS_URL: string | undefined = (import.meta as any).env?.VITE_DIRECTUS_URL
  || (!isProduction && typeof window !== 'undefined' ? (window as any).__DIRECTUS_URL : undefined);


export const DIRECTUS_STATIC_TOKEN: string | undefined = (import.meta as any).env?.VITE_DIRECTUS_STATIC_TOKEN
  || (!isProduction && typeof window !== 'undefined' ? (window as any).__DIRECTUS_TOKEN : undefined);

if (!DIRECTUS_URL) {
  throw new Error('Directus URL is not configured. Set VITE_DIRECTUS_URL.');
}

let client = createDirectus(DIRECTUS_URL).with(rest());
if (DIRECTUS_STATIC_TOKEN) {
  client = client.with(staticToken(DIRECTUS_STATIC_TOKEN));
}
export const directus = client;

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
