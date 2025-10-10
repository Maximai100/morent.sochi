import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MediaUpload } from "@/components/MediaUpload";
import { ScrollableContainer } from "@/components/ScrollableContainer";
import "@/styles/apartment-modal.css";
import "@/styles/manager-simplified.css";

interface ApartmentForm {
  name: string;
  number: string;
  building_number: string;
  housing_complex: string;
  address: string;
  description: string;
  wifi_password: string;
  entrance_code: string;
  lock_code: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  faq_checkin: string;
  faq_apartment: string;
  faq_area: string;
  map_embed_code: string;
  entrance_number: string;
  floor_number: string;
}

interface ApartmentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartmentForm: ApartmentForm;
  setApartmentForm: React.Dispatch<React.SetStateAction<ApartmentForm>>;
  selectedApartment: { id?: string } | null;
  onSave: () => void;
}

export const ApartmentEditModal: React.FC<ApartmentEditModalProps> = ({
  open,
  onOpenChange,
  apartmentForm,
  setApartmentForm,
  selectedApartment,
  onSave,
}) => {
  const updateForm = (field: keyof ApartmentForm, value: string) => {
    setApartmentForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col dialog-content-mobile bg-slate-800 text-slate-200 border border-slate-700">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700">
          <DialogTitle className="text-xl font-semibold text-white">
            {selectedApartment?.id ? 'Редактировать апартамент' : 'Новый апартамент'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Заполните поля карточки апартамента и прикрепите медиа.
          </DialogDescription>
        </DialogHeader>

        <ScrollableContainer className="flex-1 px-6 py-4 apartment-modal-scrollable" maxHeight="calc(90vh - 140px)">
          <Tabs defaultValue="main" className="w-full apartment-modal-tabs">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800 border border-slate-700 rounded-lg">
              <TabsTrigger value="main" className="py-2 text-slate-300 hover:bg-slate-700 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">Основное</TabsTrigger>
              <TabsTrigger value="content" className="py-2 text-slate-300 hover:bg-slate-700 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">Контент</TabsTrigger>
              <TabsTrigger value="media" className="py-2 text-slate-300 hover:bg-slate-700 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">Медиа</TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-6">
              {/* Основная информация */}
              <Card className="apartment-modal-card bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-slate-400">Название</Label>
                      <Input
                        id="name"
                        value={apartmentForm.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                        placeholder="Апартаменты у моря"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="number" className="text-slate-400">Номер</Label>
                      <Input
                        id="number"
                        value={apartmentForm.number}
                        onChange={(e) => updateForm('number', e.target.value)}
                        placeholder="169"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="building_number" className="text-slate-400">Номер корпуса</Label>
                      <Input
                        id="building_number"
                        value={apartmentForm.building_number}
                        onChange={(e) => updateForm('building_number', e.target.value)}
                        placeholder="Б"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="housing_complex" className="text-slate-400">ЖК (Жилой комплекс)</Label>
                      <Input
                        id="housing_complex"
                        value={apartmentForm.housing_complex}
                        onChange={(e) => updateForm('housing_complex', e.target.value)}
                        placeholder="Например: Морской, Солнечный"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-slate-400">Адрес</Label>
                      <Input
                        id="address"
                        value={apartmentForm.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        placeholder="Нагорный тупик 13"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Доступ и подключения */}
              <Card className="apartment-modal-card bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Доступ и подключения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="wifi_password" className="text-slate-400">Wi-Fi пароль</Label>
                      <Input
                        id="wifi_password"
                        value={apartmentForm.wifi_password}
                        onChange={(e) => updateForm('wifi_password', e.target.value)}
                        placeholder="логин/пароль"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="entrance_code" className="text-slate-400">Код подъезда</Label>
                      <Input
                        id="entrance_code"
                        value={apartmentForm.entrance_code}
                        onChange={(e) => updateForm('entrance_code', e.target.value)}
                        placeholder="#2020"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lock_code" className="text-slate-400">Код замка</Label>
                      <Input
                        id="lock_code"
                        value={apartmentForm.lock_code}
                        onChange={(e) => updateForm('lock_code', e.target.value)}
                        placeholder="1111"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="entrance_number" className="text-slate-400">Подъезд</Label>
                      <Input
                        id="entrance_number"
                        value={apartmentForm.entrance_number}
                        onChange={(e) => updateForm('entrance_number', e.target.value)}
                        placeholder="2-й подъезд"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="floor_number" className="text-slate-400">Этаж</Label>
                      <Input
                        id="floor_number"
                        value={apartmentForm.floor_number}
                        onChange={(e) => updateForm('floor_number', e.target.value)}
                        placeholder="10 этаж"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {/* Контактная информация */}
              <Card className="apartment-modal-card bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="manager_name" className="text-slate-400">Имя менеджера</Label>
                      <Input
                        id="manager_name"
                        value={apartmentForm.manager_name}
                        onChange={(e) => updateForm('manager_name', e.target.value)}
                        placeholder="Морент"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manager_phone" className="text-slate-400">Телефон</Label>
                      <Input
                        id="manager_phone"
                        value={apartmentForm.manager_phone}
                        onChange={(e) => updateForm('manager_phone', e.target.value)}
                        placeholder="88007005501"
                        className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="manager_email" className="text-slate-400">Email</Label>
                    <Input
                      id="manager_email"
                      value={apartmentForm.manager_email}
                      onChange={(e) => updateForm('manager_email', e.target.value)}
                      placeholder="morent_sochi@mail.ru"
                      className="w-full bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* FAQ секции */}
              <Card className="apartment-modal-card bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Часто задаваемые вопросы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="faq_checkin" className="text-base font-medium text-slate-300">
                        FAQ: Заселение
                      </Label>
                      <p className="text-sm text-slate-400 mb-2">
                        Формат: Вопрос: ... Ответ: ...
                      </p>
                      <Textarea
                        id="faq_checkin"
                        rows={4}
                        value={apartmentForm.faq_checkin}
                        onChange={(e) => updateForm('faq_checkin', e.target.value)}
                        placeholder="Вопрос: Возможно ли выехать позже 12:00?&#10;Ответ: Стандартное время выезда - 12:00."
                        className="w-full resize-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    
                    <Separator className="bg-slate-700" />
                    
                    <div>
                      <Label htmlFor="faq_apartment" className="text-base font-medium text-slate-300">
                        FAQ: Апартаменты
                      </Label>
                      <p className="text-sm text-slate-400 mb-2">
                        Формат: Вопрос: ... Ответ: ...
                      </p>
                      <Textarea
                        id="faq_apartment"
                        rows={4}
                        value={apartmentForm.faq_apartment}
                        onChange={(e) => updateForm('faq_apartment', e.target.value)}
                        placeholder="Вопрос: Возможно ли выполнение особых пожеланий?&#10;Ответ: Да, конечно! Мы будем рады помочь Вам в организации досуга."
                        className="w-full resize-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    
                    <Separator className="bg-slate-700" />
                    
                    <div>
                      <Label htmlFor="faq_area" className="text-base font-medium text-slate-300">
                        FAQ: Территория
                      </Label>
                      <p className="text-sm text-slate-400 mb-2">
                        Формат: Вопрос: ... Ответ: ...
                      </p>
                      <Textarea
                        id="faq_area"
                        rows={4}
                        value={apartmentForm.faq_area}
                        onChange={(e) => updateForm('faq_area', e.target.value)}
                        placeholder="Вопрос: Где можно оставить машину? Есть ли парковка?&#10;Ответ: В ЖК Сорренто парк. Платная парковка при бронировании заранее по цене 700 руб/сутки."
                        className="w-full resize-none bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Яндекс.Карты */}
              <Card className="apartment-modal-card apartment-modal-map-section bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Карта</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="map_embed_code" className="text-base font-medium text-slate-300">
                      Код встраивания Яндекс.Карт
                    </Label>
                    <p className="text-sm text-slate-400 mb-2">
                      Вставьте код встраивания карты из Яндекс.Карт
                    </p>
                    <Textarea
                      id="map_embed_code"
                      rows={3}
                      value={apartmentForm.map_embed_code}
                      onChange={(e) => updateForm('map_embed_code', e.target.value)}
                      placeholder="<iframe src=&quot;https://yandex.ru/map-widget/v1/?um=...&quot; width=&quot;100%&quot; height=&quot;400&quot; frameborder=&quot;0&quot; allowfullscreen=&quot;true&quot;></iframe>"
                      className="w-full resize-none font-mono text-sm bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MediaUpload
                  apartmentId={selectedApartment?.id!}
                  directusField="photos"
                  title="Фотографии апартамента"
                  onUploadSuccess={() => {}}
                />
                <MediaUpload
                  apartmentId={selectedApartment?.id!}
                  directusField="video_entrance"
                  title="Видео подъезда"
                  onUploadSuccess={() => {}}
                />
                <MediaUpload
                  apartmentId={selectedApartment?.id!}
                  directusField="video_lock"
                  title="Видео электронного замка"
                  onUploadSuccess={() => {}}
                />
              </div>
            </TabsContent>
          </Tabs>
        </ScrollableContainer>

        <div className="flex gap-3 p-6 apartment-modal-actions">
          <Button onClick={onSave} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg focus:ring-2 focus:ring-blue-600" size="lg">
            {selectedApartment?.id ? 'Обновить' : 'Создать'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700" 
            onClick={() => onOpenChange(false)}
            size="lg"
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentEditModal;
