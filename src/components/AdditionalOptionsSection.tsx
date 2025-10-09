import { Card } from "@/components/ui/card";

export const AdditionalOptionsSection = () => {
  return (
    <Card className="p-8 shadow-premium hover-lift bg-gradient-to-br from-primary/5 via-gold/5 to-secondary/10 border-2 border-primary/20">
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-primary">
          ✨ Дополнительные опции для вашего комфорта
        </h3>
      </div>

      <div className="space-y-6 text-foreground">
        <p className="leading-relaxed">
          Мы хотим, чтобы ваше пребывание в MORENT было максимально удобным. При желании вы можете добавить к бронированию полезные опции 👇
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-white/60 rounded-xl border border-primary/10">
            <p className="font-semibold">🕐 Ранний заезд — если номер готов раньше, вы можете заселиться уже с утра:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
              <li>до 12:00 (по запросу) — 1000 ₽</li>
            </ul>
          </div>

          <div className="p-4 bg-white/60 rounded-xl border border-primary/10">
            <p className="font-semibold">👤 Дополнительный гость — 1000 ₽/сутки</p>
          </div>

          <div className="p-4 bg-white/60 rounded-xl border border-primary/10">
            <p className="font-semibold">🐾 Проживание с питомцами — 500 ₽/сутки + депозит 5000 ₽</p>
            <p className="text-sm text-muted-foreground mt-2">(мы рады вашим четвероногим друзьям, просто уточните заранее 🐶🐱)</p>
          </div>

          <div className="p-4 bg-white/60 rounded-xl border border-primary/10">
            <p className="font-semibold">🚗 Парковка — 700 ₽/сутки <span className="font-normal text-muted-foreground">(при наличии мест — уточните заранее)</span></p>
          </div>

          <div className="p-4 bg-white/60 rounded-xl border border-primary/10">
            <p className="font-semibold">🧳 Хранение багажа — от 500 ₽, если вам нужно оставить вещи до заезда или после выезда:</p>
            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
              <li>большой чемодан (L, XL) — 500 ₽</li>
              <li>маленький чемодан (S, M) + рюкзак/сумка — 500 ₽</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">➕ Каждое дополнительное место оплачивается отдельно.</p>
          </div>
        </div>

        <p className="leading-relaxed">
          💡 Если хотите воспользоваться любой из опций — просто напишите нам заранее в WhatsApp, и мы всё организуем.
        </p>
      </div>
    </Card>
  );
};

