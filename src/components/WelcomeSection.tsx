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
    <>
      <Card className="shadow-premium hover-lift overflow-hidden">
        <div className="p-8 pb-4">
          <h2 className="text-gradient mb-6 text-center uppercase tracking-wide">
            ДОБРО ПОЖАЛОВАТЬ{guestName ? `, ${guestName.toUpperCase()}!` : '!'}
          </h2>
          {guestName && checkInDate && (
            <div className="text-center mb-4">
              <p className="text-lg text-muted-foreground">
                Мы рады приветствовать вас в нашем апартаменте
              </p>
              <p className="text-sm text-gold font-medium mt-2">
                Дата заезда: {checkInDate}
              </p>
            </div>
          )}
        </div>
        
        <MediaDisplay 
          apartmentId={apartmentId}
          useApartmentFields
          showPhotos={true}
          showVideos={false}
          maxPhotos={1}
          fallbackText="Фотографии добавляются через панель администратора"
          className="min-h-[400px] px-8 pb-8"
        />
      </Card>
      <WaveDivider variant="subtle" />
    </>
  );
};