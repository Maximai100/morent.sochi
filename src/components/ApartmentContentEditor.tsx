import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApartmentContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  description: string | null;
  address: string | null;
  contact_info: {
    phone: string;
    whatsapp: string;
    telegram: string;
  };
  map_coordinates: {
    lat: number;
    lng: number;
  };
  loyalty_info: string;
  faq_data: Array<{
    question: string;
    answer: string;
  }>;
}

interface ApartmentContentEditorProps {
  apartmentId: string;
}

export const ApartmentContentEditor = ({ apartmentId }: ApartmentContentEditorProps) => {
  const [content, setContent] = useState<ApartmentContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [apartmentId]);

  const loadContent = async () => {
    try {
      // Временно используем any для обхода проблем с типами пока они не обновятся
      const { data, error } = await (supabase as any)
        .from('apartments')
        .select('*')
        .eq('id', apartmentId)
        .maybeSingle();

      if (error) {
        console.error('Error loading content:', error);
        return;
      }

      if (data) {
        setContent(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;

    try {
      // Временно используем any для обхода проблем с типами
      const { error } = await (supabase as any)
        .from('apartments')
        .update({
          hero_title: content.hero_title,
          hero_subtitle: content.hero_subtitle,
          description: content.description,
          address: content.address,
          contact_info: content.contact_info,
          map_coordinates: content.map_coordinates,
          loyalty_info: content.loyalty_info,
          faq_data: content.faq_data
        })
        .eq('id', apartmentId);

      if (error) {
        toast.error('Ошибка сохранения');
        return;
      }

      toast.success('Контент сохранен');
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const addFAQ = () => {
    if (!content) return;
    setContent({
      ...content,
      faq_data: [...content.faq_data, { question: '', answer: '' }]
    });
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (!content) return;
    const newFAQ = [...content.faq_data];
    newFAQ[index][field] = value;
    setContent({ ...content, faq_data: newFAQ });
  };

  const removeFAQ = (index: number) => {
    if (!content) return;
    const newFAQ = content.faq_data.filter((_, i) => i !== index);
    setContent({ ...content, faq_data: newFAQ });
  };

  const openLanding = () => {
    const url = `/apartment/${apartmentId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!content) {
    return <div>Ошибка загрузки данных</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-primary">Редактирование контента</h3>
        <div className="flex gap-2">
          <Button onClick={openLanding} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Открыть лендинг
          </Button>
          <Button onClick={saveContent}>
            Сохранить изменения
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>Главный экран</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero_title">Заголовок</Label>
            <Input
              id="hero_title"
              value={content.hero_title}
              onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="hero_subtitle">Подзаголовок</Label>
            <Input
              id="hero_subtitle"
              value={content.hero_subtitle}
              onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={content.description || ''}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address & Map */}
      <Card>
        <CardHeader>
          <CardTitle>Адрес и карта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={content.address || ''}
              onChange={(e) => setContent({ ...content, address: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="map_lat">Широта</Label>
              <Input
                id="map_lat"
                type="number"
                step="any"
                value={content.map_coordinates.lat}
                onChange={(e) => setContent({
                  ...content,
                  map_coordinates: { ...content.map_coordinates, lat: parseFloat(e.target.value) }
                })}
              />
            </div>
            <div>
              <Label htmlFor="map_lng">Долгота</Label>
              <Input
                id="map_lng"
                type="number"
                step="any"
                value={content.map_coordinates.lng}
                onChange={(e) => setContent({
                  ...content,
                  map_coordinates: { ...content.map_coordinates, lng: parseFloat(e.target.value) }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={content.contact_info.phone}
              onChange={(e) => setContent({
                ...content,
                contact_info: { ...content.contact_info, phone: e.target.value }
              })}
            />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={content.contact_info.whatsapp}
              onChange={(e) => setContent({
                ...content,
                contact_info: { ...content.contact_info, whatsapp: e.target.value }
              })}
            />
          </div>
          <div>
            <Label htmlFor="telegram">Telegram</Label>
            <Input
              id="telegram"
              value={content.contact_info.telegram}
              onChange={(e) => setContent({
                ...content,
                contact_info: { ...content.contact_info, telegram: e.target.value }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Program */}
      <Card>
        <CardHeader>
          <CardTitle>Программа лояльности</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content.loyalty_info}
            onChange={(e) => setContent({ ...content, loyalty_info: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Часто задаваемые вопросы</CardTitle>
            <Button onClick={addFAQ} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Добавить FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.faq_data.map((faq, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Вопрос {index + 1}</span>
                <Button
                  onClick={() => removeFAQ(index)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <Label>Вопрос</Label>
                <Input
                  value={faq.question}
                  onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                  placeholder="Введите вопрос"
                />
              </div>
              <div>
                <Label>Ответ</Label>
                <Textarea
                  value={faq.answer}
                  onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                  placeholder="Введите ответ"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};