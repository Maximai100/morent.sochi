import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart } from "lucide-react";
import { WaveDivider } from "@/components/WaveDivider";

export const LoyaltySection = ({ info }: { info?: string }) => {
  return (
    <>
      <Card className="p-8 shadow-premium hover-lift bg-gradient-to-br from-gold/10 via-accent/5 to-secondary/20 border-2 border-gold/20">
        <div className="text-center mb-6">
          <Heart className="w-8 h-8 text-gold mx-auto mb-3" />
          <h3 className="text-xl font-bold text-primary">
            ДЛЯ НАШИХ ПОСТОЯННЫХ ГОСТЕЙ
          </h3>
        </div>
      
        <div className="space-y-6 text-left text-foreground mb-8">
          <p className="text-center leading-relaxed">{info || 'Если вам было комфортно с нами, поддержите Morent — это очень помогает нам развиваться:'}</p>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-gold/20">
              <span className="text-gold text-xl">🔹</span>
              <div>
                Подпишитесь на{" "}
                <a 
                  href="https://t.me/morentsochi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-dark font-semibold hover:underline transition-colors"
                >
                  Telegram @morent.sochi
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-gold/20">
              <span className="text-gold text-xl">🔹</span>
              <div>
                Подпишитесь на{" "}
                <a 
                  href="https://instagram.com/morent.sochi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-dark font-semibold hover:underline transition-colors"
                >
                  Instagram @morent.sochi
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl border border-gold/20">
              <span className="text-gold text-xl">🔹</span>
              <p className="leading-relaxed">Оставьте, пожалуйста, отзыв на сайте, где вы бронировали апартаменты — это важно для нас.</p>
            </div>
          </div>
          
          <p className="text-center text-primary-dark font-semibold mt-6 text-lg">
            Спасибо, что выбираете нас снова 💫
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-gold/5 rounded-xl p-6 border-2 border-gold/30">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-2xl">📲</span>
            <p className="text-foreground font-semibold text-lg">Напишите нам в WhatsApp</p>
          </div>
          <a 
            href="https://wa.me/79628886449" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              variant="outline" 
              className="w-full bg-white/80 border-2 border-gold/40 hover:bg-gradient-to-r hover:from-gold/10 hover:to-primary/10 hover:border-gold/60 flex items-center gap-3 h-14 touch-target transition-all duration-300"
            >
              <MessageCircle className="w-6 h-6 text-gold" />
              <span className="font-bold text-primary text-lg">+7 (962) 988-64-49</span>
            </Button>
          </a>
          <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
            <p className="leading-relaxed">Мы с радостью поможем вам подобрать и забронировать апартаменты в следующий раз.</p>
            <p className="font-semibold text-primary-dark">Всегда на связи и готовы помочь!</p>
          </div>
        </div>
      </Card>
      <WaveDivider flip />
    </>
  );
};