import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Edit, CheckSquare, Square } from "lucide-react";
import "@/styles/mass-edit.css";

interface Apartment {
  id: string;
  name: string;
  number: string;
  building_number?: string | null;
  housing_complex?: string | null;
  address?: string | null;
  wifi_password?: string | null;
  entrance_code?: string | null;
  lock_code?: string | null;
  manager_name?: string | null;
  manager_phone?: string | null;
  manager_email?: string | null;
  faq_checkin?: string | null;
  faq_apartment?: string | null;
  faq_area?: string | null;
  map_embed_code?: string | null;
}

interface MassApartmentEditProps {
  apartments: Apartment[];
  onSave: (apartmentIds: string[], updates: Partial<Apartment>) => Promise<void>;
  onClose: () => void;
}

const MassApartmentEdit: React.FC<MassApartmentEditProps> = ({
  apartments,
  onSave,
  onClose
}) => {
  const { toast } = useToast();
  const [selectedApartments, setSelectedApartments] = useState<string[]>([]);
  const [massUpdates, setMassUpdates] = useState<Partial<Apartment>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAll = () => {
    if (selectedApartments.length === apartments.length) {
      setSelectedApartments([]);
    } else {
      setSelectedApartments(apartments.map(a => a.id));
    }
  };

  const handleSelectApartment = (apartmentId: string) => {
    setSelectedApartments(prev => 
      prev.includes(apartmentId) 
        ? prev.filter(id => id !== apartmentId)
        : [...prev, apartmentId]
    );
  };

  const handleMassUpdate = (field: keyof Apartment, value: string) => {
    setMassUpdates(prev => ({
      ...prev,
      [field]: value || null
    }));
  };

  const handleSave = async () => {
    if (selectedApartments.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите хотя бы один апартамент",
        variant: "destructive"
      });
      return;
    }

    if (Object.keys(massUpdates).length === 0) {
      toast({
        title: "Ошибка", 
        description: "Выберите хотя бы одно поле для обновления",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(selectedApartments, massUpdates);
      toast({
        title: "Успех",
        description: `Обновлено ${selectedApartments.length} апартаментов`
      });
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить апартаменты",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUniqueValues = (field: keyof Apartment) => {
    return Array.from(new Set(apartments.map(a => a[field]).filter(Boolean)));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 text-slate-200 border border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Edit className="w-5 h-5 text-blue-500" />
            Массовое редактирование апартаментов
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Выберите апартаменты и поля для массового обновления
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Выбор апартаментов */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Выбор апартаментов</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedApartments.length === apartments.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedApartments.length === apartments.length ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {apartments.map((apartment) => (
                <div
                  key={apartment.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedApartments.includes(apartment.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => handleSelectApartment(apartment.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedApartments.includes(apartment.id)}
                      onChange={() => handleSelectApartment(apartment.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-slate-200">{apartment.name}</div>
                      <div className="text-sm text-slate-400 truncate">
                        {apartment.housing_complex && `ЖК "${apartment.housing_complex}"`}
                        {apartment.housing_complex && apartment.building_number && ' • '}
                        {apartment.building_number && `Корпус ${apartment.building_number}`}
                        {apartment.number && ` №${apartment.number}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-slate-400">
              Выбрано: {selectedApartments.length} из {apartments.length} апартаментов
            </div>
          </div>

          {/* Массовые обновления */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Массовые обновления</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ЖК */}
              <div className="space-y-2">
                <Label htmlFor="mass_housing_complex" className="text-slate-400">ЖК (Жилой комплекс)</Label>
                <Select
                  value={massUpdates.housing_complex || 'none'}
                  onValueChange={(value) => handleMassUpdate('housing_complex', value === 'none' ? '' : value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                    <SelectValue placeholder="Выберите ЖК или оставьте пустым" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border border-slate-700 text-slate-100">
                    <SelectItem value="none">Очистить поле</SelectItem>
                    {getUniqueValues('housing_complex').map((hc) => (
                      <SelectItem key={hc} value={hc}>{hc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Адрес */}
              <div className="space-y-2">
                <Label htmlFor="mass_address" className="text-slate-400">Адрес</Label>
                <Input
                  id="mass_address"
                  value={massUpdates.address || ''}
                  onChange={(e) => handleMassUpdate('address', e.target.value)}
                  placeholder="Общий адрес для всех"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* WiFi пароль */}
              <div className="space-y-2">
                <Label htmlFor="mass_wifi_password" className="text-slate-400">WiFi пароль</Label>
                <Input
                  id="mass_wifi_password"
                  value={massUpdates.wifi_password || ''}
                  onChange={(e) => handleMassUpdate('wifi_password', e.target.value)}
                  placeholder="Общий WiFi пароль"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Код подъезда */}
              <div className="space-y-2">
                <Label htmlFor="mass_entrance_code" className="text-slate-400">Код подъезда</Label>
                <Input
                  id="mass_entrance_code"
                  value={massUpdates.entrance_code || ''}
                  onChange={(e) => handleMassUpdate('entrance_code', e.target.value)}
                  placeholder="Общий код подъезда"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Имя менеджера */}
              <div className="space-y-2">
                <Label htmlFor="mass_manager_name" className="text-slate-400">Имя менеджера</Label>
                <Input
                  id="mass_manager_name"
                  value={massUpdates.manager_name || ''}
                  onChange={(e) => handleMassUpdate('manager_name', e.target.value)}
                  placeholder="Общее имя менеджера"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Телефон менеджера */}
              <div className="space-y-2">
                <Label htmlFor="mass_manager_phone" className="text-slate-400">Телефон менеджера</Label>
                <Input
                  id="mass_manager_phone"
                  value={massUpdates.manager_phone || ''}
                  onChange={(e) => handleMassUpdate('manager_phone', e.target.value)}
                  placeholder="Общий телефон менеджера"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Email менеджера */}
              <div className="space-y-2">
                <Label htmlFor="mass_manager_email" className="text-slate-400">Email менеджера</Label>
                <Input
                  id="mass_manager_email"
                  type="email"
                  value={massUpdates.manager_email || ''}
                  onChange={(e) => handleMassUpdate('manager_email', e.target.value)}
                  placeholder="Общий email менеджера"
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            {/* FAQ поля */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-white">FAQ информация</h4>
              
              <div className="space-y-2">
                <Label htmlFor="mass_faq_checkin" className="text-slate-400">FAQ - Заселение</Label>
                <Textarea
                  id="mass_faq_checkin"
                  value={massUpdates.faq_checkin || ''}
                  onChange={(e) => handleMassUpdate('faq_checkin', e.target.value)}
                  placeholder="Общая информация о заселении"
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mass_faq_apartment" className="text-slate-400">FAQ - Апартаменты</Label>
                <Textarea
                  id="mass_faq_apartment"
                  value={massUpdates.faq_apartment || ''}
                  onChange={(e) => handleMassUpdate('faq_apartment', e.target.value)}
                  placeholder="Общая информация об апартаментах"
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mass_faq_area" className="text-slate-400">FAQ - Территория</Label>
                <Textarea
                  id="mass_faq_area"
                  value={massUpdates.faq_area || ''}
                  onChange={(e) => handleMassUpdate('faq_area', e.target.value)}
                  placeholder="Общая информация о территории"
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">
              Отмена
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || selectedApartments.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MassApartmentEdit;
