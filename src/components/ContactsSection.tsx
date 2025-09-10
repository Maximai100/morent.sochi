import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, Instagram, Send } from "lucide-react";
import { WaveDivider } from "@/components/WaveDivider";

export const ContactsSection = ({ contactInfo }: { contactInfo?: { phone: string; whatsapp: string; telegram: string } }) => {
  return (
    <>
      <Card className="p-8 shadow-premium hover-lift space-y-6 wave-divider">
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
      </Card>
      <WaveDivider variant="gold" />
    </>
  );
};