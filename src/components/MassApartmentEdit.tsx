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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Массовое редактирование апартаментов
          </DialogTitle>
          <DialogDescription>
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
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectApartment(apartment.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedApartments.includes(apartment.id)}
                      onChange={() => handleSelectApartment(apartment.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{apartment.name}</div>
                      <div className="text-sm text-gray-500 truncate">
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
            
            <div className="text-sm text-gray-600">
              Выбрано: {selectedApartments.length} из {apartments.length} апартаментов
            </div>
          </div>

          {/* Массовые обновления */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Массовые обновления</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ЖК */}
              <div className="space-y-2">
                <Label htmlFor="mass_housing_complex">ЖК (Жилой комплекс)</Label>
                <Select
                  value={massUpdates.housing_complex || 'none'}
                  onValueChange={(value) => handleMassUpdate('housing_complex', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ЖК или оставьте пустым" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Очистить поле</SelectItem>
                    {getUniqueValues('housing_complex').map((hc) => (
                      <SelectItem key={hc} value={hc}>{hc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Адрес */}
              <div className="space-y-2">
                <Label htmlFor="mass_address">Адрес</Label>
                <Input
                  id="mass_address"
                  value={massUpdates.address || ''}
                  onChange={(e) => handleMassUpdate('address', e.target.value)}
                  placeholder="Общий адрес для всех"
                />
              </div>

              {/* WiFi пароль */}
              <div className="space-y-2">
                <Label htmlFor="mass_wifi_password">WiFi пароль</Label>
                <Input
                  id="mass_wifi_password"
                  value={massUpdates.wifi_password || ''}
                  onChange={(e) => handleMassUpdate('wifi_password', e.target.value)}
                  placeholder="Общий WiFi пароль"
                />
              </div>

              {/* Код подъезда */}
              <div className="space-y-2">
                <Label htmlFor="mass_entrance_code">Код подъезда</Label>
                <Input
                  id="mass_entrance_code"
                  value={massUpdates.entrance_code || ''}
                  onChange={(e) => handleMassUpdate('entrance_code', e.target.value)}
                  placeholder="Общий код подъезда"
                />
              </div>

              {/* Имя менеджера */}
              <div className="space-y-2">
                <Label htmlFor="mass_manager_name">Имя менеджера</Label>
                <Input
                  id="mass_manager_name"
                  value={massUpdates.manager_name || ''}
                  onChange={(e) => handleMassUpdate('manager_name', e.target.value)}
                  placeholder="Общее имя менеджера"
                />
              </div>

              {/* Телефон менеджера */}
              <div className="space-y-2">
                <Label htmlFor="mass_manager_phone">Телефон менеджера</Label>
                <Input
                  id="mass_manager_phone"
                  value={massUpdates.manager_phone || ''}
                  onChange={(e) => handleMassUpdate('manager_phone', e.target.value)}
                  placeholder="Общий телефон менеджера"
                />
              </div>

              {/* Email менеджера */}
              <div className="space-y-2">
                <Label htmlFor="mass_manager_email">Email менеджера</Label>
                <Input
                  id="mass_manager_email"
                  type="email"
                  value={massUpdates.manager_email || ''}
                  onChange={(e) => handleMassUpdate('manager_email', e.target.value)}
                  placeholder="Общий email менеджера"
                />
              </div>
            </div>

            {/* FAQ поля */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold">FAQ информация</h4>
              
              <div className="space-y-2">
                <Label htmlFor="mass_faq_checkin">FAQ - Заселение</Label>
                <Textarea
                  id="mass_faq_checkin"
                  value={massUpdates.faq_checkin || ''}
                  onChange={(e) => handleMassUpdate('faq_checkin', e.target.value)}
                  placeholder="Общая информация о заселении"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mass_faq_apartment">FAQ - Апартаменты</Label>
                <Textarea
                  id="mass_faq_apartment"
                  value={massUpdates.faq_apartment || ''}
                  onChange={(e) => handleMassUpdate('faq_apartment', e.target.value)}
                  placeholder="Общая информация об апартаментах"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mass_faq_area">FAQ - Территория</Label>
                <Textarea
                  id="mass_faq_area"
                  value={massUpdates.faq_area || ''}
                  onChange={(e) => handleMassUpdate('faq_area', e.target.value)}
                  placeholder="Общая информация о территории"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || selectedApartments.length === 0}
              className="flex items-center gap-2"
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
