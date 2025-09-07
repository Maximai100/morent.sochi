import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const apartmentFAQData = [{
  question: "Возможно ли заселиться раньше 15:00?",
  answer: "Стандартное время заезда - 15:00.\nЕсли Вы прибыли раньше времени заселения, то мы постараемся помочь с хранением багажа, либо заселим Вас сразу при наличии возможности. Гарантированный ранний заезд оплачивается дополнительно в размере 50% от стоимости суток Вашей брони и дает право заселиться в любое удобное время с 7:00. Заселение ранее 7:00 оплачивается, как полные сутки."
}, {
  question: "Возможно ли выехать позже 12:00?",
  answer: "Стандартное время выезда - 12:00.\nЕсли Вы желаете выехать позже времени выселения, то при наличии свободного номера, мы сообщим Вам время возможного продления или постараемся помочь с хранением багажа.\nГарантированный поздний выезд оплачивается дополнительно в размере 50% стоимости суток Вашей брони и дает право находиться в апартаментах до 22:00. Нахождение в номере после 22:00 оплачивается, как полные сутки."
}, {
  question: "Где можно оставить машину? Есть ли парковка?",
  answer: "В ЖК Сорренто парк\nПлатная парковка при бронировании заранее, по цене 700 руб/ сутки.\nТакже есть открытая неохраняемая парковка на улице."
}, {
  question: "Какие возможны способы оплаты?",
  answer: "Мы присылаем Вам счет на почту для оплаты по безналичному расчету, а также принимаем к оплате наличные."
}, {
  question: "Возможно ли выполнение особых пожеланий?",
  answer: "Да, конечно! Мы будем рады помочь Вам в организации досуга. Наша команда с большим удовольствием организует сюрприз Вашим любимым, поможет с составлением туристической поездки по достопримечательностям, забронирует прогулку на яхте, доставит прокатный автомобиль прямо к аэропорту или к любым апартаментам или закажет трансфер.\n\nДля наилучшего результата свяжитесь с нами заранее (как минимум за 2 дня до даты) и согласуйте всё необходимое."
}];

interface ApartmentFAQProps {
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export const ApartmentFAQ = ({ faqs = apartmentFAQData }: ApartmentFAQProps) => {
  return (
    <Card className="p-8 shadow-premium hover-lift space-y-6">
      <div className="stagger-item">
        <h3 className="mb-6 uppercase text-left text-gradient">ЧАСТЫЕ ВОПРОСЫ</h3>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="border-0 bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300"
            >
              <AccordionTrigger className="px-6 py-4 text-left font-semibold text-primary hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-foreground">
                <div className="leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Card>
  );
};