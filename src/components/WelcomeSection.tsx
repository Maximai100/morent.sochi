import { Card } from "@/components/ui/card";
import { MediaDisplay } from "@/components/MediaDisplay";
import { WaveDivider } from "@/components/WaveDivider";

interface WelcomeSectionProps {
  guestName?: string;
  checkInDate?: string;
  apartmentId?: string;
}

export const WelcomeSection = ({ guestName, checkInDate, apartmentId }: WelcomeSectionProps) => {
  return (
    <Card className="shadow-premium hover-lift overflow-hidden">
      <div className="p-8 pb-4">
        <h2 className="text-gradient mb-6 text-center uppercase tracking-wide">
          ДОБРО ПОЖАЛОВАТЬ{guestName ? `, ${guestName.toUpperCase()}!` : '!'}
        </h2>
      </div>
      
      <MediaDisplay 
        apartmentId={apartmentId}
        useApartmentFields
        showPhotos={true}
        showVideos={false}
        maxPhotos={1}
        fallbackText="Фотографии добавляются через панель администратора"
        className="min-h-[400px] px-8 pb-8"
        hideTitle={true}
      />
    </Card>
  );
};