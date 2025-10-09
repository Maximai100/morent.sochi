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
import { AdditionalOptionsSection } from "@/components/AdditionalOptionsSection";
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
  wifi_name: string | null;
  building_number: string | null;
  entrance_code: string | null;
  lock_code: string | null;
  entrance_number: string | null;
  floor_number: string | null;
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
  const checkInDateRaw = urlParams.get('checkin') || '';
  const checkOutDateRaw = urlParams.get('checkout') || '';
  const entranceCodeOverride = urlParams.get('entrance') || '';
  const lockCodeOverride = urlParams.get('lock') || '';
  const wifiOverride = urlParams.get('wifi') || '';

  // Форматируем даты для отображения
  const formatDateForDisplay = (dateStr: string, isCheckout: boolean = false) => {
    if (!dateStr) return '';
    
    // Если дата уже содержит время, возвращаем как есть
    if (dateStr.includes(' в ')) return dateStr;
    
    // Если дата в формате ДД.ММ.ГГГГ, добавляем время
    if (dateStr.includes('.')) {
      const time = isCheckout ? '12:00' : '15:00';
      return `${dateStr} в ${time}`;
    }
    
    return dateStr;
  };

  const checkInDate = formatDateForDisplay(checkInDateRaw, false);
  const checkOutDate = formatDateForDisplay(checkOutDateRaw, true);

  useEffect(() => {
    if (apartmentId) {
      loadApartment();
    } else {
      setLoading(false);
    }
  }, [apartmentId]);

  const loadApartment = async () => {
    if (!apartmentId) {
      logger.warn('No apartment ID provided');
      setLoading(false);
      return;
    }

    try {
      logger.debug('Loading apartment:', apartmentId);
      
      // Простая загрузка без излишних проверок
      const item = await directus.request(readItem('apartments', apartmentId, {
        fields: ['*', { photos: ['*'], video_entrance: ['*'], video_lock: ['*'] }]
      }));
      
      if (item) {
        logger.debug('Apartment loaded successfully');
        const mapped: Apartment = {
          id: item.id,
          name: item.title || `Апартамент №${item.apartment_number || apartmentId}`,
          number: item.apartment_number || apartmentId,
          description: item.description || null,
          address: item.base_address || null,
          wifi_password: wifiOverride || item.wifi_password || null,
          wifi_name: item.wifi_name || null,
          building_number: item.building_number || null,
          entrance_code: entranceCodeOverride || item.code_building || null,
          lock_code: lockCodeOverride || item.code_lock || null,
          entrance_number: item.entrance_number || null,
          floor_number: item.floor_number || null,
          faq_data: [
            { question: 'Заселение', answer: item.faq_checkin || 'Информация не указана' },
            { question: 'Апартаменты', answer: item.faq_apartment || 'Информация не указана' },
            { question: 'Территория', answer: item.faq_area || 'Информация не указана' },
          ].filter(faq => faq.answer !== 'Информация не указана'),
          hero_title: item.title || `Апартамент №${item.apartment_number || apartmentId}`,
          hero_subtitle: item.description || 'Добро пожаловать в MORENT!',
          contact_info: {
            phone: item.manager_phone || '+7 (999) 123-45-67',
            whatsapp: item.manager_phone || '+7 (999) 123-45-67',
            telegram: item.manager_phone || '+7 (999) 123-45-67',
          },
          map_coordinates: { lat: 43.5855, lng: 39.7231 },
          loyalty_info: 'Спасибо, что выбрали MORENT!',
        } as any;
        setApartment(mapped);
      } else {
        setApartment(null);
      }
    } catch (error) {
      logger.error('Error loading apartment:', error);
      setApartment(null);
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
      <div className="min-h-screen bg-white flex items-center justify-center guest-minimal px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-[hsl(var(--guest-navy))] mb-4">
            Апартамент не найден
          </h1>
          <p className="text-[hsl(var(--guest-silver))] mb-6">
            Проверьте правильность ссылки или обратитесь к менеджеру
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[hsl(var(--guest-navy))] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Обновить страницу
            </button>
            <button 
              onClick={() => window.location.href = '/manager'}
              className="w-full px-6 py-3 border-2 border-[hsl(var(--guest-navy))] text-[hsl(var(--guest-navy))] rounded-lg hover:bg-[hsl(var(--guest-navy))] hover:text-white transition-colors"
            >
              Панель менеджера
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white guest-minimal">
      <div className="max-w-4xl mx-auto px-4">

        
        <div className="stagger-item pt-16">
          <HeroSection 
            title={apartment.hero_title}
            subtitle={apartment.hero_subtitle}
            apartmentNumber={apartment.number}
            buildingNumber={apartment.building_number} // Add this line
          />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>
        
        <div className="stagger-item">
          <WelcomeSection 
            guestName={guestName}
            checkInDate={checkInDateRaw}
            apartmentId={apartment.id}
          />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>
        
        <div className="stagger-item">
          <ApartmentInfo
            apartmentNumber={apartment.number}
            checkIn={checkInDate || 'Не указана дата заезда'}
            checkOut={checkOutDate || 'Не указана дата выезда'}
            entranceCode={entranceCodeOverride || apartment.entrance_code || 'Код не указан'}
            electronicLockCode={lockCodeOverride || apartment.lock_code || 'Код не указан'}
            wifiPassword={wifiOverride || apartment.wifi_password || 'Пароль не указан'}
            wifiName={apartment.wifi_name || 'Название не указано'}
            buildingNumber={apartment.building_number || 'Б'}
            address={`${apartment.address || 'Нагорный тупик 13'} ${apartment.building_number || 'Б'}`}
            entranceInfo={`${apartment.entrance_number || ''} ${apartment.floor_number || ''}`.trim()}
          />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>
        
        <div className="stagger-item">
          <CheckinSection apartmentId={apartment.id} />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>
        
        <div className="stagger-item">
          <ApartmentFAQ faqs={apartment.faq_data} />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>
        
        <div className="stagger-item">
          <YandexMap 
            coordinates={apartment.map_coordinates}
            address={apartment.address || ''}
          />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>
        
        <div className="stagger-item">
          <ContactsSection contactInfo={apartment.contact_info} />
        </div>
        
        <div className="py-8">
          <WaveDivider />
        </div>

        <div className="stagger-item">
          <AdditionalOptionsSection />
        </div>

        <div className="py-8">
          <WaveDivider />
        </div>

        <div className="stagger-item">
          <LoyaltySection info={apartment.loyalty_info} />
        </div>
        
        <div className="py-8"></div>
      </div>
    </div>
  );
};

export default ApartmentLanding;
