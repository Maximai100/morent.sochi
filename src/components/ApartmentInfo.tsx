import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Key, Wifi, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ApartmentInfoProps {
  apartmentNumber?: string;
  checkIn?: string;
  checkOut?: string;
  entranceCode?: string;
  electronicLockCode?: string;
  wifiPassword?: string;
}

export const ApartmentInfo = ({
  apartmentNumber = "169",
  checkIn = "08.06.2025 в 15:00",
  checkOut = "09.06.2025 в 12:00",
  entranceCode = "#2020",
  electronicLockCode = "1111",
  wifiPassword = "логин/пароль"
}: ApartmentInfoProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Скопировано!",
        description: `${fieldName} скопирован в буфер обмена`,
        duration: 2000,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена",
        variant: "destructive",
      });
    }
  };
  return (
    <Card className="p-8 shadow-premium hover-lift space-y-6 wave-divider">
      {/* Apartment Details */}
      <Card className="stagger-item p-6 bg-muted border-2 border-primary/20 hover-glow">
        <div className="flex items-start gap-3 mb-4">
          <MapPin className="w-7 h-7 text-[hsl(var(--guest-navy))] flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg text-primary mb-2">
              Ваши апартаменты
            </h3>
            <p className="text-foreground leading-relaxed">г. Сочи, пгт Сириус</p>
            <p className="text-foreground leading-relaxed">ул. Нагорный тупик 13Б</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[hsl(var(--guest-navy))]/20 to-[hsl(var(--guest-navy))]/20 rounded-xl p-6 border-2 border-[hsl(var(--guest-navy))]/30 text-center">
          <p className="font-bold text-primary-dark text-lg mb-2">
            2-й подъезд 10 этаж
          </p>
          <p className="font-bold text-[hsl(var(--guest-navy))] text-2xl">
            Апартаменты {apartmentNumber}
          </p>
        </div>
      </Card>

      {/* Check-in Dates */}
      <Card className="stagger-item p-6 bg-muted border-primary/20 hover-glow">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-7 h-7 text-[hsl(var(--guest-navy))]" />
          <h3 className="text-lg text-primary">
            Даты бронирования
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-emerald-50 to-primary/5 border-2 border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-emerald-700 mb-1">ЗАЕЗД</p>
            <p className="text-lg font-bold text-emerald-800">{checkIn}</p>
          </div>
          <div className="bg-gradient-to-r from-white to-white border-2 border-[hsl(var(--guest-navy))]/30 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-rose-700 mb-1">ВЫЕЗД</p>
            <p className="text-lg font-bold text-rose-800">{checkOut}</p>
          </div>
        </div>
      </Card>

      {/* Access Codes */}
      <Card className="stagger-item p-6 bg-muted border-primary/20 hover-glow">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-7 h-7 text-[hsl(var(--guest-navy))]" />
          <h3 className="text-lg text-primary">
            Важные коды доступа:
          </h3>
        </div>
        
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => copyToClipboard(entranceCode, "Код от подъезда")}
            className={`group w-full justify-between text-left h-auto p-6 bg-white/80 border-2 border-primary/30 hover:border-[hsl(var(--guest-navy))]/50 hover:bg-gradient-to-r hover:from-[hsl(var(--guest-navy))]/5 hover:to-[hsl(var(--guest-navy))]/5 transition-all duration-300 ${copiedField === "Код от подъезда" ? "pulse-code" : ""}`}
          >
            <div>
              <p className="font-medium text-muted-foreground">Код от подъезда</p>
              <p className="text-2xl font-bold text-primary">{entranceCode}</p>
            </div>
            {copiedField === "Код от подъезда" ? (
              <Check className="w-6 h-6 text-emerald-500" />
            ) : (
              <Copy className="w-6 h-6 text-muted-foreground group-hover:text-[hsl(var(--guest-navy))] transition-colors" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => copyToClipboard(electronicLockCode, "Код от электронного замка")}
            className={`group w-full justify-between text-left h-auto p-6 bg-white/80 border-2 border-primary/30 hover:border-[hsl(var(--guest-navy))]/50 hover:bg-gradient-to-r hover:from-[hsl(var(--guest-navy))]/5 hover:to-[hsl(var(--guest-navy))]/5 transition-all duration-300 ${copiedField === "Код от электронного замка" ? "pulse-code" : ""}`}
          >
            <div>
              <p className="font-medium text-muted-foreground">Код от электронного замка</p>
              <p className="text-2xl font-bold text-primary">{electronicLockCode}</p>
            </div>
            {copiedField === "Код от электронного замка" ? (
              <Check className="w-6 h-6 text-emerald-500" />
            ) : (
              <Copy className="w-6 h-6 text-muted-foreground group-hover:text-[hsl(var(--guest-navy))] transition-colors" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => copyToClipboard(wifiPassword, "Wi-Fi пароль")}
            className={`group w-full justify-between text-left h-auto p-6 bg-white/80 border-2 border-primary/30 hover:border-[hsl(var(--guest-navy))]/50 hover:bg-gradient-to-r hover:from-[hsl(var(--guest-navy))]/5 hover:to-[hsl(var(--guest-navy))]/5 transition-all duration-300 ${copiedField === "Wi-Fi пароль" ? "pulse-code" : ""}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Wifi className="w-6 h-6 text-[hsl(var(--guest-navy))] flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-muted-foreground">Wi-Fi</p>
                <p className="text-lg font-semibold text-primary break-all">{wifiPassword}</p>
              </div>
            </div>
            {copiedField === "Wi-Fi пароль" ? (
              <Check className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            ) : (
              <Copy className="w-6 h-6 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />
            )}
          </Button>
        </div>
      </Card>
    </Card>
  );
};