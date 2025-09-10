import { Card } from "@/components/ui/card";
import { MediaDisplay } from "@/components/MediaDisplay";
import { WaveDivider } from "@/components/WaveDivider";

interface CheckinSectionProps {
  apartmentId?: string;
}

export const CheckinSection = ({ apartmentId }: CheckinSectionProps) => {
  return (
    <>
      <Card className="p-8 shadow-premium hover-lift space-y-6 wave-divider">
        <div className="stagger-item">
          <h3 className="mb-6 uppercase text-left text-gradient">ЗАСЕЛЕНИЕ</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-gold bg-gradient-to-r from-primary/10 to-gold/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-gold">FAQ</span>
            </div>
            <div className="text-left">
              <p className="text-foreground text-lg font-medium leading-relaxed">Часто встречающиеся вопросы</p>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-muted border-2 border-primary/20 hover-glow">
              <p className="text-foreground mb-4">
                <span className="font-semibold text-gold text-lg">1.</span> Подъезд
              </p>
              <MediaDisplay 
                apartmentId={apartmentId}
                useApartmentFields
                showPhotos={false}
                showVideos={true}
                maxVideos={1}
                videoFields={["video_entrance"]}
                fallbackText="Видео подъезда (загружается из админ панели)"
                className="mt-4"
              />
            </Card>
            <Card className="p-6 bg-muted border-2 border-primary/20 hover-glow">
              <p className="text-foreground mb-4">
                <span className="font-semibold text-gold text-lg">2.</span> Электронный замок
              </p>
              <MediaDisplay 
                apartmentId={apartmentId}
                useApartmentFields
                showPhotos={false}
                showVideos={true}
                maxVideos={1}
                videoFields={["video_lock"]}
                fallbackText="Видео электронного замка (загружается из админ панели)"
                className="mt-4"
              />
            </Card>
          </div>
        </div>
      </Card>
      <WaveDivider variant="gold" />
    </>
  );
};