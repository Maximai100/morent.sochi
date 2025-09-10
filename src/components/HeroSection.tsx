import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  apartmentNumber?: string;
}

export const HeroSection = ({
  title = "АПАРТАМЕНТЫ МОРЕНТ",
  subtitle = "Ваш комфортный дом вдали от дома",
  apartmentNumber = "169"
}: HeroSectionProps) => {
  return (
    <Card className="relative overflow-hidden border-0 border-[hsl(var(--guest-navy))] border-opacity-20">
      <div className="relative h-[400px] bg-white border-b border-[hsl(var(--guest-navy))] border-opacity-20">
        <img src={heroImage} alt="MORENT - Ваш дом у моря" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/40" />
        
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="mt-16 mb-8">
            <h1 className="text-4xl md:text-6xl font-bold font-playfair text-[hsl(var(--guest-navy))] tracking-wider mb-4 uppercase">
              {title}
            </h1>
            {/* Simple line instead of wave */}
            <div className="w-24 h-1 mx-auto bg-[hsl(var(--guest-navy))]"></div>
          </div>
          
          <p className="text-lg md:text-xl font-playfair text-[hsl(var(--guest-silver))] italic">
            {subtitle}
          </p>
        </div>
      </div>
    </Card>
  );
};