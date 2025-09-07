import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings, FileText, Map } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-wave flex items-center justify-center p-6">
      <Card className="max-w-3xl mx-auto shadow-premium text-center animate-fade-in">
        <div className="mb-10">
          <h1 className="text-7xl font-bold text-gradient mb-6 tracking-wider animate-glow-pulse font-playfair">
            MORENT
          </h1>
          <div className="w-40 h-2 bg-gradient-ocean rounded-full mx-auto mb-6 animate-scale-in" />
          <p className="text-2xl text-primary/80 font-inter font-medium">
            Система управления инструкциями заселения
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link to="/manager" className="group">
            <Button 
              variant="premium" 
              size="xl"
              className="w-full flex flex-col gap-4 group-hover:animate-float"
            >
              <Settings className="w-16 h-16" />
              <div>
                <p className="text-xl font-bold">Панель менеджера</p>
                <p className="text-base opacity-90">Создать инструкцию для гостя</p>
              </div>
            </Button>
          </Link>

          <Link to="/guide" className="group">
            <Button 
              variant="glass" 
              size="xl"
              className="w-full flex flex-col gap-4 group-hover:animate-float"
            >
              <FileText className="w-16 h-16 text-primary" />
              <div>
                <p className="text-xl font-bold text-primary">Инструкция для гостя</p>
                <p className="text-base text-muted-foreground">Демо-версия</p>
              </div>
            </Button>
          </Link>
        </div>

        <div className="mt-10 p-6 glass-card rounded-2xl">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Map className="w-6 h-6 text-accent animate-glow-pulse" />
            <p className="text-lg font-semibold font-playfair">Сочи • Апартаменты у моря</p>
          </div>
          <p className="text-base text-muted-foreground font-inter">
            Ваш дом у моря в любой момент!
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Index;
