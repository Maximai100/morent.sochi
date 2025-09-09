import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { WelcomeSection } from "@/components/WelcomeSection";
import { ApartmentInfo } from "@/components/ApartmentInfo";
import { MediaDisplay } from "@/components/MediaDisplay";
import { ApartmentFAQ } from "@/components/ApartmentFAQ";
import { ContactsSection } from "@/components/ContactsSection";
import { LoyaltySection } from "@/components/LoyaltySection";
import { YandexMap } from "@/components/YandexMap";
import { WaveDivider } from "@/components/WaveDivider";
import { directus, ApartmentRecord } from "@/integrations/directus/client";
import { readItem } from '@directus/sdk';

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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-wave flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-gradient-wave flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Апартамент не найден</h1>
          <p className="text-muted-foreground">Проверьте правильность ссылки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-wave">
      <HeroSection 
        title={apartment.hero_title}
        subtitle={apartment.hero_subtitle}
      />
      
      <WelcomeSection 
        guestName={guestName}
        checkInDate={checkInDate}
      />
      
      <WaveDivider />
      
      <ApartmentInfo
        apartmentNumber={apartment.number}
        checkIn={checkInDate}
        checkOut={checkOutDate}
        entranceCode={entranceCodeOverride || apartment.entrance_code || ''}
        electronicLockCode={lockCodeOverride || apartment.lock_code || ''}
        wifiPassword={wifiOverride || apartment.wifi_password || ''}
      />
      
      <WaveDivider />
      
      <MediaDisplay apartmentId={apartment.id} useApartmentFields />
      
      <WaveDivider />
      
      <ApartmentFAQ faqs={apartment.faq_data} />
      
      <WaveDivider />
      
      <YandexMap 
        coordinates={apartment.map_coordinates}
        address={apartment.address || ''}
      />
      
      <WaveDivider />
      
      <ContactsSection contactInfo={apartment.contact_info} />
      
      <WaveDivider />
      
      <LoyaltySection info={apartment.loyalty_info} />
    </div>
  );
};

export default ApartmentLanding;