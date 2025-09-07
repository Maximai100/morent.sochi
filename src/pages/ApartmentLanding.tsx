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
import { supabase } from "@/integrations/supabase/client";

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
      // Временно используем any для обхода проблем с типами
      const { data, error } = await (supabase as any)
        .from('apartments')
        .select('*')
        .eq('id', apartmentId)
        .maybeSingle();

      if (error) {
        console.error('Error loading apartment:', error);
        return;
      }

      if (data) {
        setApartment(data);
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
      
      <MediaDisplay apartmentId={apartment.id} />
      
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