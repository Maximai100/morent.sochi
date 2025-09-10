import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, FileText, Map } from "lucide-react";
import "@/styles/minimal-guest.css";

const Index = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 guest-minimal">
      <Card className="w-full max-w-4xl mx-auto shadow-premium text-center">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-[hsl(var(--guest-navy))] mb-4 tracking-wider font-playfair">
              MORENT
            </h1>
            <div className="w-24 h-1 bg-[hsl(var(--guest-navy))] rounded-full mx-auto mb-4" />
            <p className="text-lg md:text-xl text-[hsl(var(--guest-silver))] font-inter font-medium">
              Система управления инструкциями заселения
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link to="/manager" className="group">
              <Button 
                variant="outline" 
                className="w-full h-auto p-6 border-2 border-[hsl(var(--guest-navy))] hover:bg-[hsl(var(--guest-navy))] hover:text-white transition-all duration-300 flex flex-col gap-3"
              >
                <Settings className="w-12 h-12" />
                <div>
                  <p className="text-lg font-bold">Панель менеджера</p>
                  <p className="text-sm opacity-75">Создать инструкцию для гостя</p>
                </div>
              </Button>
            </Link>

            <Link to="/guide" className="group">
              <Button 
                variant="outline" 
                className="w-full h-auto p-6 border-2 border-[hsl(var(--guest-navy))] hover:bg-[hsl(var(--guest-navy))] hover:text-white transition-all duration-300 flex flex-col gap-3"
              >
                <FileText className="w-12 h-12" />
                <div>
                  <p className="text-lg font-bold">Инструкция для гостя</p>
                  <p className="text-sm opacity-75">Демо-версия</p>
                </div>
              </Button>
            </Link>
          </div>

          <div className="p-4 border border-[hsl(var(--guest-navy))]/20 rounded-lg bg-gray-50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Map className="w-5 h-5 text-[hsl(var(--guest-navy))]" />
              <p className="text-base font-semibold font-playfair text-[hsl(var(--guest-navy))]">Сочи • Апартаменты у моря</p>
            </div>
            <p className="text-sm text-[hsl(var(--guest-silver))] font-inter">
              Ваш дом у моря в любой момент!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Index;
