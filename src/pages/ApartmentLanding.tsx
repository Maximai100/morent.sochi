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
    }
    // Отладочная информация для URL параметров
    logger.debug('URL Params:', {
      apartmentId,
      guestName,
      checkInDateRaw,
      checkOutDateRaw,
      checkInDate,
      checkOutDate,
      entranceCodeOverride,
      lockCodeOverride,
      wifiOverride
    });
  }, [apartmentId]);

  const loadApartment = async () => {
    if (!apartmentId) {
      setLoading(false);
      return;
    }

    try {
      logger.debug('Loading apartment:', apartmentId);
      const item = await directus.request(readItem<ApartmentRecord>('apartments', apartmentId, {
        fields: ['*'] // Запрашиваем все поля явно
      } as any));
      
      if (item) {
        logger.debug('Apartment loaded successfully:', item);
        const mapped: Apartment = {
          id: item.id,
          name: item.title || `Апартамент №${item.apartment_number || 'N/A'}`,
          number: item.apartment_number || '',
          description: item.description || null,
          address: item.base_address || null,
          wifi_password: wifiOverride || item.wifi_password || null,
          entrance_code: entranceCodeOverride || item.code_building || null,
          lock_code: lockCodeOverride || item.code_lock || null,
          faq_data: [
            { question: 'Заселение', answer: item.faq_checkin || 'Информация не указана' },
            { question: 'Апартаменты', answer: item.faq_apartment || 'Информация не указана' },
            { question: 'Территория', answer: item.faq_area || 'Информация не указана' },
          ].filter(faq => faq.answer !== 'Информация не указана'), // Скрываем пустые FAQ
          hero_title: item.title || `Апартамент №${item.apartment_number || 'N/A'}`,
          hero_subtitle: item.description || 'Добро пожаловать!',
          contact_info: {
            phone: item.manager_phone || '',
            whatsapp: item.manager_phone || '',
            telegram: item.manager_phone || '',
          },
          map_coordinates: { lat: 43.5855, lng: 39.7231 }, // Координаты Сочи по умолчанию
          loyalty_info: '',
        } as any;
        setApartment(mapped);
        logger.debug('Apartment data mapped successfully');
      } else {
        logger.warn('No apartment data received');
        setApartment(null);
      }
    } catch (error) {
      logger.error('Error loading apartment', error);
      // Дополнительная информация об ошибке
      if (error instanceof Error) {
        logger.error('Error details:', {
          message: error.message,
          stack: error.stack,
          apartmentId
        });
      }
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
          <h1 className="text-xl md:text-2xl font-bold text-[hsl(var(--guest-navy))] mb-4">Апартамент не найден</h1>
          <p className="text-[hsl(var(--guest-silver))] mb-6">Проверьте правильность ссылки или обратитесь к менеджеру</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[hsl(var(--guest-navy))] text-white rounded-lg hover:opacity-90 transition-opacity touch-target"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white guest-minimal">
      <div className="max-w-4xl mx-auto px-4">
        <div className="stagger-item">
          <HeroSection 
            title={apartment.hero_title}
            subtitle={apartment.hero_subtitle}
            apartmentNumber={apartment.number}
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
          <LoyaltySection info={apartment.loyalty_info} />
        </div>
        
        <div className="py-8"></div>
      </div>
    </div>
  );
};

export default ApartmentLanding;