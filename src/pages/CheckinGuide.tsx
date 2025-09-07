import { useSearchParams } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { WelcomeSection } from "@/components/WelcomeSection";
import { ApartmentInfo } from "@/components/ApartmentInfo";
import { ContactsSection } from "@/components/ContactsSection";
import { ApartmentFAQ } from "@/components/ApartmentFAQ";
import { LoyaltySection } from "@/components/LoyaltySection";
import { YandexMap } from "@/components/YandexMap";

const CheckinGuide = () => {
  const [searchParams] = useSearchParams();
  
  // Get data from URL parameters
  const guestData = {
    guestName: searchParams.get('guest') || '',
    apartmentNumber: searchParams.get('apartment') || '169',
    checkIn: searchParams.get('checkin') || '08.06.2025 в 15:00',
    checkOut: searchParams.get('checkout') || '09.06.2025 в 12:00',
    entranceCode: searchParams.get('entrance') || '#2020',
    electronicLockCode: searchParams.get('lock') || '1111',
    wifiPassword: searchParams.get('wifi') || 'логин/пароль'
  };

  return (
    <div className="min-h-screen bg-gradient-wave">
      <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">
        <div className="stagger-item"><HeroSection apartmentNumber={guestData.apartmentNumber} /></div>
        <div className="stagger-item"><WelcomeSection guestName={guestData.guestName} checkInDate={guestData.checkIn} /></div>
        <div className="stagger-item"><ApartmentInfo {...guestData} /></div>
        <div className="stagger-item"><ContactsSection /></div>
        <div className="stagger-item"><ApartmentFAQ /></div>
        <div className="stagger-item"><LoyaltySection /></div>
        <div className="stagger-item"><YandexMap /></div>
      </div>
    </div>
  );
};

export default CheckinGuide;