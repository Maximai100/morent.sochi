import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, Instagram, Send } from "lucide-react";
import { MediaDisplay } from "@/components/MediaDisplay";
import { WaveDivider } from "@/components/WaveDivider";

export const ContactsSection = ({ contactInfo }: { contactInfo?: { phone: string; whatsapp: string; telegram: string } }) => {
  return (
    <>
      <Card className="p-8 shadow-premium hover-lift space-y-6 wave-divider">
        {/* Contacts */}
        <Card className="stagger-item p-6 bg-gradient-to-r from-primary/5 to-gold/5 border-2 border-primary/20 hover-glow">
          <h3 className="text-lg text-primary mb-4">
            Контакты MORENT
          </h3>
          <div className="space-y-4 text-foreground">
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-gold" />
              <a href={`tel:${contactInfo?.phone || '88007005501'}`} className="text-lg font-semibold hover:text-gold transition-colors">
                {contactInfo?.phone || '8 800 700 55 01'}
              </a>
            </div>
            <p className="text-sm text-muted-foreground ml-9 leading-relaxed">Поддержка 24/7</p>
          
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex flex-wrap items-center gap-4">
                <a 
                  href="https://instagram.com/morent.sochi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary/10 to-gold/10 rounded-full hover:from-primary/20 hover:to-gold/20 transition-all duration-300 hover-lift touch-target"
                >
                  <Instagram className="w-5 h-5 text-gold" />
                  <span className="text-sm font-semibold">@morent.sochi</span>
                </a>
                
                <a 
                  href="https://t.me/morentsochi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary/10 to-gold/10 rounded-full hover:from-primary/20 hover:to-gold/20 transition-all duration-300 hover-lift touch-target"
                >
                  <Send className="w-5 h-5 text-gold" />
                  <span className="text-sm font-semibold">Telegram</span>
                </a>
              </div>
              
              <a 
                href="https://wa.me/79628886449" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary/10 to-gold/10 rounded-full hover:from-primary/20 hover:to-gold/20 transition-all duration-300 hover-lift w-fit touch-target"
              >
                <MessageCircle className="w-5 h-5 text-gold" />
                <span className="text-sm font-semibold">WhatsApp</span>
              </a>
            </div>
          </div>
        </Card>

        {/* FAQ Settlement */}
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
                <span className="font-semibold text-gold text-lg">1.</span> Видео подъезда
              </p>
              <MediaDisplay 
                category="entrance_videos" 
                fallbackText="Видео подъезда (загружается из админ панели)"
                className="mt-4"
              />
            </Card>
            <Card className="p-6 bg-muted border-2 border-primary/20 hover-glow">
              <p className="text-foreground mb-4">
                <span className="font-semibold text-gold text-lg">2.</span> Видео электронного замка
              </p>
              <MediaDisplay 
                category="lock_videos" 
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