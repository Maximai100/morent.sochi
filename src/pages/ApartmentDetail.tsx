import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Share, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaUpload } from "@/components/MediaUpload";
import { ApartmentContentEditor } from "@/components/ApartmentContentEditor";
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
  lock_code: string | null;
}

const ApartmentDetail = () => {
  const { apartmentId } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestForm, setGuestForm] = useState({
    name: "",
    check_in_date: "",
    check_out_date: "",
    lock_code: ""
  });

  useEffect(() => {
    if (apartmentId) {
      loadApartment();
      loadGuests();
    }
  }, [apartmentId]);

  const loadApartment = async () => {
    if (!apartmentId) return;
    const { data, error } = await (supabase as any)
      .from('apartments')
      .select('*')
      .eq('id', apartmentId)
      .maybeSingle();
    if (!error && data) setApartment(data);
  };

  const loadGuests = async () => {
    if (!apartmentId) return;
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('apartment_id', apartmentId)
      .order('created_at', { ascending: false });
    if (!error && data) setGuests(data as Guest[]);
  };

  const generateGuestLink = (guest: Guest): string => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      guest: guest.name,
      checkin: guest.check_in_date,
      checkout: guest.check_out_date
    });
    // Объединяем: коды и Wi-Fi берутся либо из брони, либо из апартамента
    const lock = guest.lock_code || apartment?.lock_code || '';
    if (lock) params.set('lock', lock);
    if (apartment?.entrance_code) params.set('entrance', apartment.entrance_code);
    if (apartment?.wifi_password) params.set('wifi', apartment.wifi_password);
    return `${baseUrl}/apartment/${apartment?.id}?${params.toString()}`;
  };

  const saveGuest = async () => {
    if (!guestForm.name || !guestForm.check_in_date || !guestForm.check_out_date) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      if (selectedGuest) {
        // Обновление
        const { data, error } = await supabase
          .from('guests')
          .update({
            name: guestForm.name,
            check_in_date: guestForm.check_in_date,
            check_out_date: guestForm.check_out_date,
            lock_code: guestForm.lock_code || null,
          })
          .eq('id', selectedGuest.id)
          .select('*')
          .single();

        if (error) {
          toast.error('Ошибка обновления гостя');
          return;
        }

        const link = generateGuestLink({ ...(data as Guest), guide_link: null });
        const { data: updated, error: updErr } = await supabase
          .from('guests')
          .update({ guide_link: link })
          .eq('id', (data as Guest).id)
          .select('*')
          .single();
        if (updErr) {
          toast.error('Гость обновлен, но не удалось обновить ссылку');
        }
        setGuests(prev => prev.map(g => g.id === (updated as Guest).id ? (updated as Guest) : g));
        toast.success('Гость обновлен');
      } else {
        // Создание
        const insertPayload = {
          apartment_id: apartmentId!,
          name: guestForm.name,
          check_in_date: guestForm.check_in_date,
          check_out_date: guestForm.check_out_date,
          lock_code: guestForm.lock_code || null,
          guide_link: null as string | null,
        };

        const { data, error } = await supabase
          .from('guests')
          .insert(insertPayload)
          .select('*')
          .single();

        if (error) {
          toast.error('Ошибка сохранения гостя');
          return;
        }

        // Генерируем и сохраняем ссылку
        const link = generateGuestLink({ ...(data as Guest), guide_link: null });
        const { data: updated, error: updErr } = await supabase
          .from('guests')
          .update({ guide_link: link })
          .eq('id', (data as Guest).id)
          .select('*')
          .single();

        if (updErr) {
          toast.error('Гость сохранен, но не удалось создать ссылку');
        }

        setGuests(prev => [updated as Guest, ...prev]);
        toast.success('Гость добавлен');
      }

      setShowGuestForm(false);
      setSelectedGuest(null);
      setGuestForm({ name: "", check_in_date: "", check_out_date: "", lock_code: "" });
    } catch (e) {
      toast.error('Ошибка сохранения');
    }
  };

  const editGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setGuestForm({
      name: guest.name,
      check_in_date: guest.check_in_date,
      check_out_date: guest.check_out_date,
      lock_code: guest.lock_code || "",
    });
    setShowGuestForm(true);
  };

  const deleteGuest = async (guestId: string) => {
    if (!confirm('Удалить бронирование?')) return;
    const { error } = await supabase.from('guests').delete().eq('id', guestId);
    if (error) {
      toast.error('Ошибка удаления');
      return;
    }
    setGuests(prev => prev.filter(g => g.id !== guestId));
    toast.success('Бронирование удалено');
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Ссылка скопирована в буфер обмена');
    } catch (error) {
      toast.error('Ошибка копирования ссылки');
    }
  };

  const shareLink = async (guest: Guest) => {
    const link = guest.guide_link || generateGuestLink(guest);
    const message = `Добро пожаловать в MORENT! 🏠\n\nВаш персональный гид готов: ${link}\n\nВ нем вы найдете всю информацию для комфортного проживания.\n\nХорошего отдыха! 🌊`;
    
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Сообщение для отправки скопировано');
    } catch (error) {
      toast.error('Ошибка копирования сообщения');
    }
  };

  if (!apartment) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-wave p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к апартаментам
          </Button>
          <h1 className="text-3xl font-bold font-playfair text-primary mb-2">
            {apartment.name} (№{apartment.number})
          </h1>
          <p className="text-muted-foreground">{apartment.description}</p>
        </div>

        <Tabs defaultValue="guests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guests">Управление гостями</TabsTrigger>
            <TabsTrigger value="media">Медиа файлы</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>

          <TabsContent value="guests" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-primary">Гости</h2>
              <Button
                onClick={() => {
                  setSelectedGuest(null);
                  setGuestForm({ name: "", check_in_date: "", check_out_date: "" });
                  setShowGuestForm(true);
                }}
                className="touch-target"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить гостя
              </Button>
            </div>

            {showGuestForm && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedGuest ? 'Редактировать гостя' : 'Новый гость'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="guest_name">Имя гостя</Label>
                      <Input
                        id="guest_name"
                        value={guestForm.name}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Иван Иванов"
                      />
                    </div>
                    <div>
                      <Label htmlFor="check_in">Дата заезда</Label>
                      <Input
                        id="check_in"
                        value={guestForm.check_in_date}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, check_in_date: e.target.value }))}
                        placeholder="08.06.2025 в 15:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="check_out">Дата выезда</Label>
                      <Input
                        id="check_out"
                        value={guestForm.check_out_date}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, check_out_date: e.target.value }))}
                        placeholder="09.06.2025 в 12:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guest_lock">Код электронного замка (для брони)</Label>
                      <Input
                        id="guest_lock"
                        value={guestForm.lock_code}
                        onChange={(e) => setGuestForm(prev => ({ ...prev, lock_code: e.target.value }))}
                        placeholder={apartment?.lock_code || "1111"}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveGuest}>
                      {selectedGuest ? 'Обновить' : 'Создать'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGuestForm(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guests.map((guest) => (
                <Card key={guest.id} className="hover-lift">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{guest.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Заезд:</span> {guest.check_in_date}</p>
                      <p><span className="font-medium">Выезд:</span> {guest.check_out_date}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => copyLink(guest.guide_link || generateGuestLink(guest))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Копировать ссылку
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => shareLink(guest)}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Подготовить сообщение
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => editGuest(guest)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => deleteGuest(guest.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MediaUpload
                category={`apartment-${apartmentId}-photos`}
                title="Фотографии апартамента"
                onUploadSuccess={() => toast.success('Фото загружено')}
              />
              <MediaUpload
                category={`apartment-${apartmentId}-videos`}
                title="Видео-обзор апартамента"
                onUploadSuccess={() => toast.success('Видео загружено')}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ApartmentContentEditor apartmentId={apartmentId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApartmentDetail;