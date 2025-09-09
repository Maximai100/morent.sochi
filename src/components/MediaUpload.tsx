import { useState, useEffect } from "react";
import { directus, DIRECTUS_URL } from "@/integrations/directus/client";
import { uploadFiles, readFiles, deleteFile } from '@directus/sdk';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Video } from "lucide-react";

interface MediaUploadProps {
  title: string;
  onUploadSuccess?: () => void;
  // Привязка к апартаменту: сохранение id файлов в поле коллекции apartments
  apartmentId?: string;
  directusField?: 'photos' | 'video_entrance' | 'video_lock';
  multiple?: boolean;
  // Резервный режим по категории (если нужно)
  category?: string;
}

interface MediaFileUI {
  id: string;
  filename: string;
  url: string;
  file_type: 'image' | 'video';
  description: string;
}

export const MediaUpload = ({ category, title, onUploadSuccess, apartmentId, directusField, multiple = false }: MediaUploadProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFileUI[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    try {
      const uploadedIds: string[] = [];
      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append('file', file);
        if (category) form.append('title', category);
        if (description) form.append('description', description);

        const res: any = await directus.request(uploadFiles(form));
        if (Array.isArray(res)) uploadedIds.push(...res.map((r: any) => r.id));
        else if (res?.id) uploadedIds.push(res.id);
      }

      if (apartmentId && directusField && uploadedIds.length) {
        const { updateItem, readItem } = await import('@directus/sdk');
        if (multiple) {
          const current: any = await (directus as any).request(readItem('apartments', apartmentId, { fields: [directusField] }));
          const existing = current?.[directusField] || [];
          const existingIds = Array.isArray(existing) ? existing.map((v: any) => (typeof v === 'string' ? v : v.id)) : [];
          const next = Array.from(new Set([...existingIds, ...uploadedIds]));
          await (directus as any).request(updateItem('apartments', apartmentId, { [directusField]: next }));
        } else {
          await (directus as any).request(updateItem('apartments', apartmentId, { [directusField]: uploadedIds[uploadedIds.length - 1] }));
        }
      }

      toast({
        title: "Файлы загружены!",
        description: `Успешно загружено ${fileList.length} файл(ов)`,
      });

      setDescription("");
      loadFiles();
      onUploadSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файлы",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const loadFiles = async () => {
    try {
      if (apartmentId && directusField) {
        const { readItem } = await import('@directus/sdk');
        const item: any = await (directus as any).request(readItem('apartments', apartmentId, { fields: ['id', directusField] }));
        const value = item?.[directusField];
        const ids: string[] = Array.isArray(value) ? value.map((v: any) => (typeof v === 'string' ? v : v.id)) : (value ? [ (typeof value === 'string' ? value : value.id) ] : []);
        if (ids.length === 0) {
          setFiles([]);
          return;
        }
        const list = await directus.request(readFiles({ filter: { id: { _in: ids } }, limit: -1 }));
        const mapped: MediaFileUI[] = (list || []).map((f: any) => ({
          id: f.id,
          filename: f.filename_download,
          url: `${DIRECTUS_URL}/assets/${f.id}`,
          file_type: f.type?.startsWith('video/') ? 'video' : 'image',
          description: f.description || f.filename_download,
        }));
        setFiles(mapped);
        return;
      }

      if (category) {
        const list = await directus.request(readFiles({ filter: { title: { _eq: category } }, sort: ['-date_created'] }));
        const mapped: MediaFileUI[] = (list || []).map((f: any) => ({
          id: f.id,
          filename: f.filename_download,
          url: `${DIRECTUS_URL}/assets/${f.id}`,
          file_type: f.type?.startsWith('video/') ? 'video' : 'image',
          description: f.description || f.filename_download,
        }));
        setFiles(mapped);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      if (apartmentId && directusField) {
        const { updateItem, readItem } = await import('@directus/sdk');
        const current: any = await (directus as any).request(readItem('apartments', apartmentId, { fields: [directusField] }));
        const value = current?.[directusField];
        if (Array.isArray(value)) {
          const next = value.map((v: any) => (typeof v === 'string' ? v : v.id)).filter((id: string) => id !== fileId);
          await (directus as any).request(updateItem('apartments', apartmentId, { [directusField]: next }));
        } else if (value && ((typeof value === 'string' ? value : value.id) === fileId)) {
          await (directus as any).request(updateItem('apartments', apartmentId, { [directusField]: null }));
        }
      }
      await directus.request(deleteFile(fileId));
      toast({ title: "Файл удален", description: "Файл успешно удален" });
      loadFiles();
    } catch (error) {
      toast({ title: "Ошибка удаления", description: "Не удалось удалить файл", variant: "destructive" });
    }
  };

  useEffect(() => {
    loadFiles();
  }, [category, apartmentId, directusField]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor={`description-${category}`}>Описание</Label>
          <Textarea
            id={`description-${category}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание файла"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor={`file-${category}`}>Загрузить файлы</Label>
          <Input
            id={`file-${category}`}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="mt-1"
          />
        </div>

        <Button
          onClick={() => document.getElementById(`file-${category}`)?.click()}
          disabled={uploading}
          className="w-full bg-gradient-ocean"
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Загрузка..." : "Выбрать файлы"}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-foreground mb-3">Загруженные файлы:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group">
                <Card className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {file.file_type === 'video' ? (
                        <Video className="w-8 h-8 text-accent" />
                      ) : (
                        <Image className="w-8 h-8 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {file.file_type === 'image' && (
                    <img
                      src={file.url}
                      alt={file.description}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                  {file.file_type === 'video' && (
                    <video
                      src={file.url}
                      controls
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};