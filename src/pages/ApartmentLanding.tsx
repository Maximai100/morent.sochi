import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { logger } from "@/utils/logger";
import { HeroSection } from "@/components/HeroSection";
import { WelcomeSection } from "@/components/WelcomeSection";
import { ApartmentInfo } from "@/components/ApartmentInfo";
import { CheckinSection } from "@/components/CheckinSection";
import { ApartmentFAQ } from "@/components/ApartmentFAQ";
import { ContactsSection } from "@/components/ContactsSection";
import { LoyaltySection } from "@/components/LoyaltySection";
import { YandexMap } from "@/components/YandexMap";
import { WaveDivider } from "@/components/WaveDivider";
import { directus, ApartmentRecord } from "@/integrations/directus/client";
import { readItem } from '@directus/sdk';
import "@/styles/minimal-guest.css";

interface Apartment {
  id: string;
  name: string;
  number: string;
  description: string | null;
  address: string | null;
  wifi_password: string | null;
  entrance_code: string | null;
  lock_code: string | null;
  faq_data: any[];
  hero_title: string;
  hero_subtitle: string;
  contact_info: {
    phone: string;
    whatsapp: string;
    telegram: string;
  };
  map_coordinates: {
    lat: number;
    lng: number;
  };
  loyalty_info: string;
}

const ApartmentLanding = () => {
  const { apartmentId } = useParams();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);

  // Получаем параметры из URL для персонализации
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('guest') || '';
  const checkInDate = urlParams.get('checkin') || '';
  const checkOutDate = urlParams.get('checkout') || '';
  const entranceCodeOverride = urlParams.get('entrance') || '';
  const lockCodeOverride = urlParams.get('lock') || '';
  const wifiOverride = urlParams.get('wifi') || '';

  useEffect(() => {
    if (apartmentId) {
      loadApartment();
    }
  }, [apartmentId]);

  const loadApartment = async () => {
    if (!apartmentId) return;

    try {
      const item = await directus.request(readItem<ApartmentRecord>('apartments', apartmentId));
      if (item) {
        const mapped: Apartment = {
          id: item.id,
          name: item.title || '',
          number: item.apartment_number || '',
          description: item.description || null,
          address: item.base_address || null,
          wifi_password: item.wifi_password || null,
          entrance_code: item.code_building || null,
          lock_code: item.code_lock || null,
          faq_data: [
            { question: 'Заселение', answer: item.faq_checkin || '' },
            { question: 'Апартаменты', answer: item.faq_apartment || '' },
            { question: 'Территория', answer: item.faq_area || '' },
          ],
          hero_title: item.title || 'Апартамент',
          hero_subtitle: item.description || '',
          contact_info: {
            phone: item.manager_phone || '',
            whatsapp: item.manager_phone || '',
            telegram: item.manager_phone || '',
          },
          map_coordinates: { lat: 43.5855, lng: 39.7231 },
          loyalty_info: '',
        } as any;
        setApartment(mapped);
      }
    } catch (error) {
      logger.error('Error loading apartment', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center guest-minimal">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(var(--guest-navy))]"></div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center guest-minimal">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--guest-navy))] mb-4">Апартамент не найден</h1>
          <p className="text-[hsl(var(--guest-silver))]">Проверьте правильность ссылки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white guest-minimal">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="stagger-item">
          <HeroSection 
            title={apartment.hero_title}
            subtitle={apartment.hero_subtitle}
            apartmentNumber={apartment.number}
          />
        </div>
        
        <div className="stagger-item">
          <WelcomeSection 
            guestName={guestName}
            checkInDate={checkInDate}
            apartmentId={apartment.id}
          />
        </div>
        
        <WaveDivider />
        
        <div className="stagger-item">
          <ApartmentInfo
            apartmentNumber={apartment.number}
            checkIn={checkInDate}
            checkOut={checkOutDate}
            entranceCode={entranceCodeOverride || apartment.entrance_code || ''}
            electronicLockCode={lockCodeOverride || apartment.lock_code || ''}
            wifiPassword={wifiOverride || apartment.wifi_password || ''}
          />
        </div>
        
        <WaveDivider />
        
        <div className="stagger-item">
          <CheckinSection apartmentId={apartment.id} />
        </div>
        
        <WaveDivider />
        
        <div className="stagger-item">
          <ApartmentFAQ faqs={apartment.faq_data} />
        </div>
        
        <WaveDivider />
        
        <div className="stagger-item">
          <YandexMap 
            coordinates={apartment.map_coordinates}
            address={apartment.address || ''}
          />
        </div>
        
        <WaveDivider />
        
        <div className="stagger-item">
          <ContactsSection contactInfo={apartment.contact_info} />
        </div>
        
        <WaveDivider />
        
        <div className="stagger-item">
          <LoyaltySection info={apartment.loyalty_info} />
        </div>
      </div>
    </div>
  );
};

export default ApartmentLanding;