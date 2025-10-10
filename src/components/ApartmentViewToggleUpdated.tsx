import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, List, Edit, ExternalLink, Plus, Copy, Users } from "lucide-react";
import MassApartmentEdit from './MassApartmentEdit';
import ApartmentSettingsCopy from './ApartmentSettingsCopy';
import "@/styles/apartment-view-toggle.css";
import "@/styles/mass-edit.css";

interface Apartment {
  id: string;
  name: string;
  number: string;
  entrance_code: string | null;
  lock_code: string | null;
  wifi_password: string | null;
  address?: string | null;
  description?: string | null;
  building_number?: string | null;
  housing_complex?: string | null;
}

interface ApartmentViewToggleProps {
  apartments: Apartment[];
  onEditApartment: (apartment: Apartment) => void;
  onRemoveApartment: (id: string) => void;
  onAddApartment: () => void;
  onMassUpdate: (apartmentIds: string[], updates: Partial<Apartment>) => Promise<void>;
  onCopySettings: (sourceId: string, targetIds: string[], fields: string[]) => Promise<void>;
}

const ApartmentViewToggle: React.FC<ApartmentViewToggleProps> = ({
  apartments,
  onEditApartment,
  onRemoveApartment,
  onAddApartment,
  onMassUpdate,
  onCopySettings
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [housingComplexFilter, setHousingComplexFilter] = useState<string>('all');
  const [showMassEdit, setShowMassEdit] = useState(false);
  const [showSettingsCopy, setShowSettingsCopy] = useState(false);

  // Получаем уникальные ЖК
  const uniqueHousingComplexes = Array.from(
    new Set(apartments.map(a => a.housing_complex).filter(Boolean))
  );

  // Фильтруем апартаменты
  const filteredApartments = housingComplexFilter === 'all' 
    ? apartments 
    : apartments.filter(a => a.housing_complex === housingComplexFilter);

  const ApartmentCard = ({ apartment }: { apartment: Apartment }) => (
    <Card key={apartment.id} className="hover-lift">
      <div className="p-4 apartment-card-mobile">
        <div className="flex items-start justify-between">
          <div>
            <div className="space-y-1">
              {apartment.housing_complex && (
                <div className="inline-block px-2 py-1 rounded-md border-2 border-blue-500/60 bg-blue-500/10 text-blue-600 font-bold tracking-wide text-sm">
                  ЖК "{apartment.housing_complex}"
                </div>
              )}
              <div className="inline-block px-2 py-1 rounded-md border-2 border-gold/60 bg-gold/10 text-gold font-bold tracking-wide text-base apartment-number">
                Корпус {apartment.building_number} № {apartment.number}
              </div>
            </div>
            <p className="text-lg font-semibold">{apartment.name}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEditApartment(apartment)} className="touch-target">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/apartment/${apartment.id}`, '_blank')}
            className="touch-target"
          >
            Открыть страницу гостя
          </Button>
        </div>
      </div>
    </Card>
  );

  const ApartmentListItem = ({ apartment }: { apartment: Apartment }) => (
    <div key={apartment.id} className="apartment-list-item">
      <div className="apartment-list-content">
        <div className="apartment-list-header">
          <div className="flex flex-col gap-1">
            {apartment.housing_complex && (
              <div className="inline-block px-2 py-1 rounded-md border-2 border-blue-500/60 bg-blue-500/10 text-blue-600 font-bold tracking-wide text-xs">
                ЖК "{apartment.housing_complex}"
              </div>
            )}
            <div className="apartment-list-number">
              Корпус {apartment.building_number} № {apartment.number}
            </div>
          </div>
          <h3 className="apartment-list-title">{apartment.name}</h3>
        </div>
        {apartment.address && (
          <p className="apartment-list-address">{apartment.address}</p>
        )}
      </div>
      <div className="apartment-list-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/apartment/${apartment.id}`, '_blank')}
          className="touch-target"
          title="Открыть страницу гостя"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEditApartment(apartment)} 
          className="touch-target"
          title="Редактировать"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="apartment-header">
        <div className="apartment-header-title">
          <h2 className="text-xl font-semibold text-slate-800">Апартаменты</h2>
          <span className="apartment-header-count">({filteredApartments.length})</span>
        </div>
        
        <div className="apartment-header-controls">
          {/* Фильтр по ЖК */}
          <Select value={housingComplexFilter} onValueChange={setHousingComplexFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все ЖК" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ЖК</SelectItem>
              {uniqueHousingComplexes.map((hc) => (
                <SelectItem key={hc} value={hc}>ЖК "{hc}"</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* View Toggle Buttons */}
          <div className="view-toggle">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="px-3 py-1"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Mass Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMassEdit(true)}
            className="flex items-center gap-2"
            disabled={apartments.length === 0}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Массовое редактирование</span>
            <span className="sm:hidden">Массовое</span>
          </Button>
          
          {/* Copy Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsCopy(true)}
            className="flex items-center gap-2"
            disabled={apartments.length < 2}
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Копировать настройки</span>
            <span className="sm:hidden">Копировать</span>
          </Button>
          
          {/* Add Apartment Button */}
          <Button
            onClick={onAddApartment}
            className="touch-target"
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" /> Добавить апартамент
          </Button>
        </div>
      </div>

      {/* Apartment Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 apartments-grid">
          {filteredApartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApartments.map((apartment) => (
            <ApartmentListItem key={apartment.id} apartment={apartment} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredApartments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Grid3X3 className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            {housingComplexFilter === 'all' ? 'Нет апартаментов' : 'Нет апартаментов в выбранном ЖК'}
          </h3>
          <p className="text-slate-500 mb-4">
            {housingComplexFilter === 'all' 
              ? 'Добавьте первый апартамент, чтобы начать работу'
              : 'Попробуйте выбрать другой ЖК или добавьте апартаменты в этот ЖК'
            }
          </p>
          <Button onClick={onAddApartment} variant="default">
            <Plus className="w-4 h-4 mr-2" /> Добавить апартамент
          </Button>
        </div>
      )}

      {/* Mass Edit Modal */}
      {showMassEdit && (
        <MassApartmentEdit
          apartments={apartments}
          onSave={onMassUpdate}
          onClose={() => setShowMassEdit(false)}
        />
      )}

      {/* Settings Copy Modal */}
      {showSettingsCopy && (
        <ApartmentSettingsCopy
          apartments={apartments}
          onCopySettings={onCopySettings}
          onClose={() => setShowSettingsCopy(false)}
        />
      )}
    </div>
  );
};

export default ApartmentViewToggle;
