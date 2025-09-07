import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Apartment {
  id: string;
  name: string;
  number: string;
  description: string | null;
  address: string | null;
  wifi_password: string | null;
  entrance_code: string | null;
  lock_code: string | null;
}

interface Guest {
  id: string;
  apartment_id: string;
  name: string;
  check_in_date: string;
  check_out_date: string;
  guide_link: string | null;
}

const ApartmentsManager = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showApartmentForm, setShowApartmentForm] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [apartmentForm, setApartmentForm] = useState({
    name: "",
    number: "",
    description: "",
    address: "",
    wifi_password: "",
    entrance_code: "",
    lock_code: ""
  });

  useEffect(() => {
    loadApartments();
    loadGuests();
  }, []);

  const loadApartments = async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading apartments:', error);
        toast.error('Ошибка загрузки апартаментов');
        return;
      }

      setApartments(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка подключения к базе данных');
    }
  };

  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading guests:', error);
        return;
      }

      setGuests(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveApartment = async () => {
    if (!apartmentForm.name || !apartmentForm.number) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      if (selectedApartment) {
        // Обновление существующего апартамента
        const { error } = await supabase
          .from('apartments')
          .update({
            name: apartmentForm.name,
            number: apartmentForm.number,
            description: apartmentForm.description || null,
            address: apartmentForm.address || null,
            wifi_password: apartmentForm.wifi_password || null,
            entrance_code: apartmentForm.entrance_code || null,
            lock_code: apartmentForm.lock_code || null
          })
          .eq('id', selectedApartment.id);

        if (error) {
          toast.error('Ошибка обновления апартамента');
          return;
        }
        toast.success('Апартамент обновлен');
      } else {
        // Создание нового апартамента
        const { error } = await supabase
          .from('apartments')
          .insert({
            name: apartmentForm.name,
            number: apartmentForm.number,
            description: apartmentForm.description || null,
            address: apartmentForm.address || null,
            wifi_password: apartmentForm.wifi_password || null,
            entrance_code: apartmentForm.entrance_code || null,
            lock_code: apartmentForm.lock_code || null
          });

        if (error) {
          toast.error('Ошибка создания апартамента');
          return;
        }
        toast.success('Апартамент создан');
      }

      // Перезагружаем данные
      await loadApartments();
      
      setShowApartmentForm(false);
      setSelectedApartment(null);
      setApartmentForm({
        name: "",
        number: "",
        description: "",
        address: "",
        wifi_password: "",
        entrance_code: "",
        lock_code: ""
      });
    } catch (error) {
      console.error('Error saving apartment:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const editApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment);
    setApartmentForm({
      name: apartment.name,
      number: apartment.number,
      description: apartment.description || "",
      address: apartment.address || "",
      wifi_password: apartment.wifi_password || "",
      entrance_code: apartment.entrance_code || "",
      lock_code: apartment.lock_code || ""
    });
    setShowApartmentForm(true);
  };

  const deleteApartment = async (apartmentId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот апартамент? Все связанные данные будут удалены.')) {
      return;
    }

    try {
      // Сначала удаляем связанных гостей
      await supabase
        .from('guests')
        .delete()
        .eq('apartment_id', apartmentId);

      // Удаляем медиафайлы
      await supabase
        .from('media_files')
        .delete()
        .eq('apartment_id', apartmentId);

      // Затем удаляем сам апартамент
      const { error } = await supabase
        .from('apartments')
        .delete()
        .eq('id', apartmentId);

      if (error) {
        toast.error('Ошибка удаления апартамента');
        return;
      }

      toast.success('Апартамент удален');
      await loadApartments();
      await loadGuests();
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error('Ошибка удаления');
    }
  };

  const getGuestsForApartment = (apartmentId: string) => {
    return guests.filter(guest => guest.apartment_id === apartmentId);
  };

  return (
    <div className="min-h-screen bg-gradient-wave p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair text-primary mb-2">
            Управление апартаментами MORENT
          </h1>
          <p className="text-muted-foreground">
            Создавайте карточки апартаментов и управляйте гостями
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apartments List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Апартаменты</h2>
              <Button
                onClick={() => {
                  setSelectedApartment(null);
                  setApartmentForm({
                    name: "",
                    number: "",
                    description: "",
                    address: "",
                    wifi_password: "",
                    entrance_code: "",
                    lock_code: ""
                  });
                  setShowApartmentForm(true);
                }}
                className="touch-target"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить апартамент
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apartments.map((apartment) => {
                const apartmentGuests = getGuestsForApartment(apartment.id);
                return (
                  <Card key={apartment.id} className="hover-lift">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{apartment.name}</CardTitle>
                          <CardDescription>Номер: {apartment.number}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editApartment(apartment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteApartment(apartment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {apartment.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {apartment.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm">
                        {apartment.address && (
                          <p><span className="font-medium">Адрес:</span> {apartment.address}</p>
                        )}
                        <p><span className="font-medium">Гостей:</span> {apartmentGuests.length}</p>
                      </div>
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => window.location.href = `/apartment/${apartment.id}/manage`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Управление гостями
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Apartment Form */}
          {showApartmentForm && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedApartment ? 'Редактировать апартамент' : 'Новый апартамент'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название *</Label>
                    <Input
                      id="name"
                      value={apartmentForm.name}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Люкс у моря"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Номер *</Label>
                    <Input
                      id="number"
                      value={apartmentForm.number}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="169"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={apartmentForm.description}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Красивый апартамент с видом на море"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Адрес</Label>
                    <Input
                      id="address"
                      value={apartmentForm.address}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Нагорный тупик 13 корпус Б"
                    />
                  </div>
                  <div>
                    <Label htmlFor="wifi_password">WiFi пароль</Label>
                    <Input
                      id="wifi_password"
                      value={apartmentForm.wifi_password}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, wifi_password: e.target.value }))}
                      placeholder="логин/пароль"
                    />
                  </div>
                  <div>
                    <Label htmlFor="entrance_code">Код подъезда</Label>
                    <Input
                      id="entrance_code"
                      value={apartmentForm.entrance_code}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, entrance_code: e.target.value }))}
                      placeholder="#2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lock_code">Код замка</Label>
                    <Input
                      id="lock_code"
                      value={apartmentForm.lock_code}
                      onChange={(e) => setApartmentForm(prev => ({ ...prev, lock_code: e.target.value }))}
                      placeholder="1111"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveApartment} className="flex-1">
                      {selectedApartment ? 'Обновить' : 'Создать'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApartmentForm(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApartmentsManager;