import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, Map } from "lucide-react";
import DirectusDebug from "@/components/DirectusDebug";
import BookingDebug from "@/components/BookingDebug";
import "@/styles/minimal-guest.css";

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto shadow-lg border border-slate-200">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4 tracking-wider font-playfair">
              MORENT
            </h1>
            <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto mb-4" />
            <p className="text-lg md:text-xl text-slate-600 font-inter font-medium">
              Система управления инструкциями заселения
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            <Link to="/manager" className="group">
              <Button 
                variant="outline" 
                className="w-full h-auto p-6 border-2 border-slate-800 hover:bg-slate-800 hover:text-white transition-colors duration-100 flex flex-col gap-3"
              >
                <Settings className="w-12 h-12" />
                <div>
                  <p className="text-lg font-bold">Панель менеджера</p>
                  <p className="text-sm opacity-75">Создать инструкцию для гостя</p>
                </div>
              </Button>
            </Link>

            {/* Демо-версия удалена */}
          </div>

          <div className="p-4 border border-slate-300 rounded-lg bg-slate-50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Map className="w-5 h-5 text-slate-800" />
              <p className="text-base font-semibold font-playfair text-slate-800">Сочи • Апартаменты у моря</p>
            </div>
            <p className="text-sm text-slate-600 font-inter">
              Ваш дом у моря в любой момент!
            </p>
          </div>

          {/* Debug компоненты для диагностики */}
          <div className="mt-8 space-y-8">
            <DirectusDebug />
            <BookingDebug />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;
