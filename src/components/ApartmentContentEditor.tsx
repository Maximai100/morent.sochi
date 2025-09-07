import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { directus, ApartmentRecord } from "@/integrations/directus/client";
import { readItem, updateItem } from '@directus/sdk';
import { toast } from "sonner";

interface ApartmentContent {
  id: string;
  title: string;
  description: string;
  address: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  faq_checkin: string;
  faq_apartment: string;
  faq_area: string;
  map_embed_code: string;
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
      const item = await directus.request(readItem<ApartmentRecord>('apartments', apartmentId));
      if (item) {
        setContent({
          id: item.id,
          title: item.title || '',
          description: item.description || '',
          address: item.base_address || '',
          manager_name: item.manager_name || '',
          manager_phone: item.manager_phone || '',
          manager_email: item.manager_email || '',
          faq_checkin: item.faq_checkin || '',
          faq_apartment: item.faq_apartment || '',
          faq_area: item.faq_area || '',
          map_embed_code: item.map_embed_code || '',
        });
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
      await directus.request(updateItem('apartments', apartmentId, {
        title: content.title,
        description: content.description,
        base_address: content.address,
        manager_name: content.manager_name,
        manager_phone: content.manager_phone,
        manager_email: content.manager_email,
        faq_checkin: content.faq_checkin,
        faq_apartment: content.faq_apartment,
        faq_area: content.faq_area,
        map_embed_code: content.map_embed_code,
      }));
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

      {/* Заголовки */}
      <Card>
        <CardHeader>
          <CardTitle>Заголовок и описание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero_title">Заголовок</Label>
            <Input
              id="hero_title"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Адрес и карта */}
      <Card>
        <CardHeader>
          <CardTitle>Адрес и карта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={content.address}
              onChange={(e) => setContent({ ...content, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="map_embed">Код встраивания Яндекс.Карт</Label>
            <Textarea
              id="map_embed"
              value={content.map_embed_code}
              onChange={(e) => setContent({ ...content, map_embed_code: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Контакты */}
      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={content.manager_phone}
              onChange={(e) => setContent({ ...content, manager_phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="manager_name">Имя менеджера</Label>
            <Input id="manager_name" value={content.manager_name} onChange={(e) => setContent({ ...content, manager_name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={content.manager_email} onChange={(e) => setContent({ ...content, manager_email: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Часто задаваемые вопросы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>FAQ: Заселение</Label>
            <Textarea value={content.faq_checkin} onChange={(e) => setContent({ ...content, faq_checkin: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>FAQ: Апартаменты</Label>
            <Textarea value={content.faq_apartment} onChange={(e) => setContent({ ...content, faq_apartment: e.target.value })} rows={3} />
          </div>
          <div>
            <Label>FAQ: Территория</Label>
            <Textarea value={content.faq_area} onChange={(e) => setContent({ ...content, faq_area: e.target.value })} rows={3} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};