import { Card } from "@/components/ui/card";
import { MediaDisplay } from "@/components/MediaDisplay";
import { WaveDivider } from "@/components/WaveDivider";

interface CheckinSectionProps {
  apartmentId?: string;
}

export const CheckinSection = ({ apartmentId }: CheckinSectionProps) => {
  return (
    <Card className="p-8 shadow-premium hover-lift space-y-6">
      <div className="stagger-item">
        <h3 className="mb-6 uppercase text-left text-gradient">ЗАСЕЛЕНИЕ</h3>
        
        <div className="space-y-4">
          <Card className="p-6 bg-muted border-2 border-primary/20 hover-glow">
            {/* Video title removed */}
            <MediaDisplay 
              apartmentId={apartmentId}
              useApartmentFields
              showPhotos={false}
              showVideos={true}
              maxVideos={1}
              videoFields={["video_entrance"]}
              fallbackText="Видео подъезда (загружается из админ панели)"
              className="mt-4"
              hideTitle={true}
            />
          </Card>
          <Card className="p-6 bg-muted border-2 border-primary/20 hover-glow">
            {/* Video title removed */}
            <MediaDisplay 
              apartmentId={apartmentId}
              useApartmentFields
              showPhotos={false}
              showVideos={true}
              maxVideos={1}
              videoFields={["video_lock"]}
              fallbackText="Видео электронного замка (загружается из админ панели)"
              className="mt-4"
              hideTitle={true}
            />
          </Card>
        </div>
        
        
      </div>
    </Card>
  );
};