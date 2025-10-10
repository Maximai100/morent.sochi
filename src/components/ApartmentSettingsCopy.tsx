import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckSquare, Square } from "lucide-react";
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

interface ApartmentSettingsCopyProps {
  apartments: Apartment[];
  onCopySettings: (sourceId: string, targetIds: string[], fields: string[]) => Promise<void>;
  onClose: () => void;
}

const ApartmentSettingsCopy: React.FC<ApartmentSettingsCopyProps> = ({
  apartments,
  onCopySettings,
  onClose
}) => {
  const { toast } = useToast();
  const [sourceApartmentId, setSourceApartmentId] = useState<string>('');
  const [targetApartmentIds, setTargetApartmentIds] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sourceApartment = apartments.find(a => a.id === sourceApartmentId);

  const availableFields = [
    { key: 'address', label: 'Адрес', description: 'Базовый адрес' },
    { key: 'wifi_password', label: 'WiFi пароль', description: 'Пароль от WiFi' },
    { key: 'entrance_code', label: 'Код подъезда', description: 'Код для входа в подъезд' },
    { key: 'lock_code', label: 'Код замка', description: 'Код электронного замка' },
    { key: 'manager_name', label: 'Имя менеджера', description: 'Имя ответственного менеджера' },
    { key: 'manager_phone', label: 'Телефон менеджера', description: 'Контактный телефон' },
    { key: 'manager_email', label: 'Email менеджера', description: 'Email для связи' },
    { key: 'faq_checkin', label: 'FAQ - Заселение', description: 'Информация о заселении' },
    { key: 'faq_apartment', label: 'FAQ - Апартаменты', description: 'Информация об апартаментах' },
    { key: 'faq_area', label: 'FAQ - Территория', description: 'Информация о территории' },
    { key: 'map_embed_code', label: 'Код карты', description: 'Встроенный код карты' }
  ];

  const handleSelectAllTargets = () => {
    if (targetApartmentIds.length === apartments.length) {
      setTargetApartmentIds([]);
    } else {
      setTargetApartmentIds(apartments.map(a => a.id));
    }
  };

  const handleSelectTarget = (apartmentId: string) => {
    setTargetApartmentIds(prev => 
      prev.includes(apartmentId) 
        ? prev.filter(id => id !== apartmentId)
        : [...prev, apartmentId]
    );
  };

  const handleSelectAllFields = () => {
    if (selectedFields.length === availableFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(availableFields.map(f => f.key));
    }
  };

  const handleSelectField = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleCopy = async () => {
    if (!sourceApartmentId) {
      toast({
        title: "Ошибка",
        description: "Выберите источник для копирования",
        variant: "destructive"
      });
      return;
    }

    if (targetApartmentIds.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите целевые апартаменты",
        variant: "destructive"
      });
      return;
    }

    if (selectedFields.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите поля для копирования",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onCopySettings(sourceApartmentId, targetApartmentIds, selectedFields);
      toast({
        title: "Успех",
        description: `Настройки скопированы в ${targetApartmentIds.length} апартаментов`
      });
      onClose();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать настройки",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldValue = (fieldKey: string) => {
    if (!sourceApartment) return '';
    return sourceApartment[fieldKey as keyof Apartment] || '';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 text-slate-200 border border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Copy className="w-5 h-5 text-blue-500" />
            Копирование настроек между апартаментами
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Выберите источник, целевые апартаменты и поля для копирования
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Выбор источника */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Источник (откуда копировать)</h3>
            <Select value={sourceApartmentId} onValueChange={setSourceApartmentId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                <SelectValue placeholder="Выберите апартамент-источник" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border border-slate-700 text-slate-100">
                {apartments.map((apartment) => (
                  <SelectItem key={apartment.id} value={apartment.id}>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{apartment.name}</span>
                      <span className="text-sm text-slate-400">
                        {apartment.housing_complex && `ЖК "${apartment.housing_complex}"`}
                        {apartment.housing_complex && apartment.building_number && ' • '}
                        {apartment.building_number && `Корпус ${apartment.building_number}`}
                        {apartment.number && ` №${apartment.number}`}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Выбор целевых апартаментов */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Целевые апартаменты (куда копировать)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllTargets}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
              >
                {targetApartmentIds.length === apartments.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {targetApartmentIds.length === apartments.length ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {apartments.map((apartment) => (
                <div
                  key={apartment.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    targetApartmentIds.includes(apartment.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  } ${apartment.id === sourceApartmentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => apartment.id !== sourceApartmentId && handleSelectTarget(apartment.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={targetApartmentIds.includes(apartment.id)}
                      disabled={apartment.id === sourceApartmentId}
                      onChange={() => apartment.id !== sourceApartmentId && handleSelectTarget(apartment.id)}
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
              Выбрано: {targetApartmentIds.length} из {apartments.length} апартаментов
            </div>
          </div>

          {/* Выбор полей для копирования */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Поля для копирования</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllFields}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700"
              >
                {selectedFields.length === availableFields.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedFields.length === availableFields.length ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFields.map((field) => (
                <div
                  key={field.key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFields.includes(field.key)
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => handleSelectField(field.key)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleSelectField(field.key)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200">{field.label}</div>
                      <div className="text-sm text-slate-400">{field.description}</div>
                      {sourceApartment && (
                        <div className="text-xs text-slate-400 mt-1 truncate">
                          Текущее значение: {getFieldValue(field.key) || 'не указано'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-sm text-slate-400">
              Выбрано: {selectedFields.length} из {availableFields.length} полей
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700">
              Отмена
            </Button>
            <Button 
              onClick={handleCopy} 
              disabled={isLoading || !sourceApartmentId || targetApartmentIds.length === 0 || selectedFields.length === 0}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Копирование...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Копировать настройки
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentSettingsCopy;
