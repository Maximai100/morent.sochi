import { useState, useEffect } from "react";
import { directus, DIRECTUS_URL } from "@/integrations/directus/client";
import { uploadFiles, readFiles } from '@directus/sdk';
import { logger } from "@/utils/logger";
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
  const MAX_FILE_MB = Number(import.meta.env.VITE_UPLOAD_LIMIT_MB || 50);

  const deriveCategory = (): string | undefined => {
    if (category) return category;
    if (!apartmentId) return undefined;
    return directusField === 'photos' ? `apartment-${apartmentId}-photos` : `apartment-${apartmentId}-videos`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    // Client-side size guard to prevent 413 at proxy
    const tooLarge = Array.from(fileList).find(f => (f.size / (1024 * 1024)) > MAX_FILE_MB);
    if (tooLarge) {
      toast({
        title: "Файл слишком большой",
        description: `Размер файла превышает ${MAX_FILE_MB} МБ. Уменьшите размер или увеличьте лимит на сервере`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadedIds: string[] = [];
      // Derive a category title for fallback-based display
      const derivedCategory = deriveCategory();

      for (const file of Array.from(fileList)) {
        const form = new FormData();
        form.append('file', file);
        if (derivedCategory) form.append('title', derivedCategory);
        if (description) form.append('description', description);

        const res: any = await directus.request(uploadFiles(form));
        if (Array.isArray(res)) uploadedIds.push(...res.map((r: any) => r.id));
        else if (res?.id) uploadedIds.push(res.id);
      }

      if (apartmentId && directusField && uploadedIds.length) {
        try {
          const { updateItem, readItem, readFiles } = await import('@directus/sdk');
          // Merge with existing
          let targetIds = uploadedIds.slice();
          if (multiple) {
            const current: any = await (directus as any).request(readItem('apartments', apartmentId, { fields: [directusField, directusField.toUpperCase().slice(0,1)+directusField.slice(1)] }));
            const currentFieldValue = current?.[directusField] ?? current?.[directusField.toUpperCase().slice(0,1)+directusField.slice(1)];
            const existing = currentFieldValue || [];
            const existingIds = Array.isArray(existing) ? existing.map((v: any) => (typeof v === 'string' ? v : v.id)) : [];
            targetIds = Array.from(new Set([...existingIds, ...uploadedIds]));
          }

          // Try several shapes to satisfy different Directus field configs
          const filesMeta: any[] = await directus.request(readFiles({ filter: { id: { _in: targetIds } }, limit: -1 }));
          const byId = new Map<string, any>(filesMeta.map((f: any) => [f.id, f]));

          const singleId = targetIds[targetIds.length - 1];
          const arrayOfIds = targetIds;
          const arrayOfIdObjects = targetIds.map((id) => ({ id }));
          const arrayWithType = targetIds.map((id) => ({ id, type: byId.get(id)?.type }));

          const keyCandidates = [directusField, directusField.toUpperCase().slice(0,1)+directusField.slice(1)];
          // Deep write variant for M2M alias using junction key 'directus_files_id'
          const deepCreate = { create: targetIds.map((id) => ({ directus_files_id: id })) };

          const deepConnect = { connect: arrayOfIds };
          // For File (single) just set last file id
          if (!multiple) {
            const keyCandidates = [directusField, directusField.toUpperCase().slice(0,1)+directusField.slice(1)];
            let linked = false;
            let lastErr: any;
            for (const key of keyCandidates) {
              try {
                await (directus as any).request(updateItem('apartments', apartmentId, { [key]: singleId } as any));
                linked = true;
                break;
              } catch (e) { lastErr = e; }
              try {
                await (directus as any).request(updateItem('apartments', apartmentId, { [key]: { id: singleId } } as any));
                linked = true;
                break;
              } catch (e) { lastErr = e; }
            }
            if (!linked) throw lastErr;
          } else {
            const valueVariants: Array<any> = [arrayOfIds, arrayOfIdObjects, arrayWithType, deepConnect, deepCreate];
            let linked = false;
            let lastErr: any;
            for (const key of [directusField, directusField.toUpperCase().slice(0,1)+directusField.slice(1)]) {
              for (const value of valueVariants) {
                try {
                  await (directus as any).request(updateItem('apartments', apartmentId, { [key]: value } as any));
                  linked = true;
                  break;
                } catch (e) { lastErr = e; }
              }
              if (linked) break;
            }
            if (!linked) throw lastErr;
          }
          if (false) {
            // Try O2M style: set parent FK on each file (directus_files)
            try {
              const childFkCandidates = ['apartment', 'apartment_id', 'apartments_id', 'apartments'];
              for (const fid of targetIds) {
                let updated = false;
                for (const fk of childFkCandidates) {
                  try {
                    await (directus as any).request(updateItem('directus_files', fid, { [fk]: apartmentId } as any));
                    updated = true;
                    break;
                  } catch {}
                }
                if (!updated) throw new Error('No matching FK on directus_files to link to apartment');
              }
            } catch (o2mErr) {
              // ignore, fallback to category-only display
            }
          }
        } catch (linkErr) {
          logger.warn('Linking uploaded files to apartment failed. Falling back to category display.', linkErr);
          // Continue: files are uploaded and will be visible by category
        }
      }

      toast({
        title: "Файлы загружены!",
        description: `Успешно загружено ${fileList.length} файл(ов)`,
      });

      setDescription("");
      loadFiles();
      onUploadSuccess?.();
    } catch (error: any) {
      logger.error('Upload error', error);
      const status = error?.response?.status;
      const is413 = status === 413 || /\b413\b|payload too large|entity too large/i.test(String(error?.message || ''));
      const desc = is413
        ? `Сервер отклонил загрузку (413: слишком большой запрос). Увеличьте лимит 'client_max_body_size' в прокси и включите CORS для http://localhost:8080`
        : "Не удалось загрузить файлы";
      toast({
        title: "Ошибка загрузки",
        description: desc,
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
        if (ids.length > 0) {
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
      }

      const cat = deriveCategory();
      if (cat) {
        const list = await directus.request(readFiles({ filter: { title: { _eq: cat } }, sort: ['-date_created'] }));
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

  // Удаление файлов отключено по требованиям — крестик скрыт

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
          <input
            id={`file-${category}`}
            type="file"
            accept={directusField === 'photos' ? 'image/*' : 'video/*'}
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="mt-1 cursor-pointer"
          />
        </div>
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
                    {/* Кнопка удаления скрыта */}
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
                      preload="metadata"
                      poster={`${file.url}#t=0.1`}
                      onLoadedMetadata={(e) => {
                        const videoElement = e.target as HTMLVideoElement;
                        videoElement.currentTime = 0.1;
                      }}
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
