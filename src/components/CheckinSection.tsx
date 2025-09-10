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
        
        
      </div>
    </Card>
  );
};