import { useState, useEffect } from "react";
import { directus, DIRECTUS_URL, DIRECTUS_STATIC_TOKEN } from "@/integrations/directus/client";
import { readFiles } from '@directus/sdk';
import { logger } from "@/utils/logger";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SkeletonMedia } from "@/components/ui/skeleton";

interface MediaFileUI {
  id: string;
  filename: string;
  url: string;
  file_type: 'image' | 'video';
  description: string;
  mime?: string;
}

interface MediaDisplayProps {
  apartmentId?: string;
  useApartmentFields?: boolean;
  category?: string;
  fallbackText?: string;
  className?: string;
  showPhotos?: boolean;
  showVideos?: boolean;
  maxPhotos?: number;
  maxVideos?: number;
  photoFields?: string[];
  videoFields?: string[];
  hideTitle?: boolean;
}

export const MediaDisplay = ({ apartmentId, category, useApartmentFields, fallbackText, className, showPhotos = true, showVideos = true, maxPhotos, maxVideos, photoFields = ['photos'], videoFields = ['video_entrance', 'video_lock'], hideTitle = false }: MediaDisplayProps) => {
  const [photos, setPhotos] = useState<MediaFileUI[]>([]);
  const [videos, setVideos] = useState<MediaFileUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, [apartmentId, category, useApartmentFields]);

  const loadMedia = async () => {
    try {
      if (useApartmentFields && apartmentId) {
        const { readItem } = await import('@directus/sdk');
        const fieldsToFetch = Array.from(new Set(['id', ...photoFields, ...videoFields]));
        const item: any = await (directus as any).request(readItem('apartments', apartmentId, { 
          fields: fieldsToFetch
        }));
        const extractFileIds = (value: any): string[] => {
          if (!value) return [];
          const fromOne = (v: any): string | null => {
            if (!v) return null;
            if (typeof v === 'string') return v;
            if (v?.directus_files_id) {
              const df = v.directus_files_id;
              if (typeof df === 'string') return df;
              if (df?.id) return df.id;
            }
            if (v?.id && typeof v.id === 'string') return v.id;
            return null;
          };
          if (Array.isArray(value)) {
            return value.map(fromOne).filter(Boolean) as string[];
          }
          const one = fromOne(value);
          return one ? [one] : [];
        };
        const collectIds = (keys: string[]) => keys.flatMap((k) => extractFileIds(item?.[k]));
        const photoIds = showPhotos ? collectIds(photoFields) : [];
        const videoIds = showVideos ? collectIds(videoFields) : [];
        // Default: show by asset URLs without querying /files (avoids CORS/413 on /files)
        if (photoIds.length) {
          const tokenParam = DIRECTUS_STATIC_TOKEN ? `?access_token=${DIRECTUS_STATIC_TOKEN}` : '';
          const limited = maxPhotos ? photoIds.slice(0, maxPhotos) : photoIds;
          setPhotos(limited.map((id: string) => ({ id, filename: id, url: `${DIRECTUS_URL}/assets/${id}${tokenParam}`, file_type: 'image', description: id })));
          // Opportunistic metadata fetch (non-blocking)
          try {
            const list = await directus.request(readFiles({ filter: { id: { _in: photoIds } }, limit: -1 }));
            setPhotos(list.map((f: any) => ({ id: f.id, filename: f.filename_download, url: `${DIRECTUS_URL}/assets/${f.id}${tokenParam}`, file_type: f.type?.startsWith('video/') ? 'video' : 'image', description: f.description || f.filename_download, mime: f.type })));
          } catch {}
        } else {
          setPhotos([]);
        }
        if (videoIds.length) {
          const tokenParam = DIRECTUS_STATIC_TOKEN ? `?access_token=${DIRECTUS_STATIC_TOKEN}` : '';
          const limitedV = maxVideos ? videoIds.slice(0, maxVideos) : videoIds;
          setVideos(limitedV.map((id: string) => ({ id, filename: id, url: `${DIRECTUS_URL}/assets/${id}${tokenParam}`, file_type: 'video', description: id })));
          try {
            const list = await directus.request(readFiles({ filter: { id: { _in: videoIds } }, limit: -1 }));
            setVideos(list.map((f: any) => ({ id: f.id, filename: f.filename_download, url: `${DIRECTUS_URL}/assets/${f.id}${tokenParam}`, file_type: f.type?.startsWith('video/') ? 'video' : 'image', description: f.description || f.filename_download, mime: f.type })));
          } catch {}
        } else {
          setVideos([]);
        }
        // If nothing linked in fields, optionally fallback to category-based lookup (only when category provided)
        if (category && photoIds.length === 0 && videoIds.length === 0) {
          await loadByCategory();
        }
      } else {
        // No apartment binding; use category fallback only if provided
        if (category) await loadByCategory();
      }
    } catch (error: any) {
      logger.error('Error loading media', error);
      const status = error?.response?.status;
      const cors = /CORS|Cross-Origin/i.test(String(error?.message || ''));
      if (status === 413) {
        logger.error('Directus returned 413 (Payload Too Large). Increase client_max_body_size and Directus upload limits.');
      }
      if (cors) {
        logger.error('CORS appears to be misconfigured. Allow http://localhost:8080 in Directus CORS settings.');
      }
      // On error with fields, try category fallback only if provided
      if (category) await loadByCategory();
    } finally {
      setLoading(false);
    }
  };

  const loadByCategory = async () => {
    try {
      const photoCategory = category ? `${category}-photos` : `apartment-${apartmentId}-photos`;
      const videoCategory = category ? `${category}-videos` : `apartment-${apartmentId}-videos`;
      const [photoFiles, videoFiles] = await Promise.all([
        directus.request(readFiles({ filter: { title: { _eq: photoCategory } }, sort: ['-date_created'] })),
        directus.request(readFiles({ filter: { title: { _eq: videoCategory } }, sort: ['-date_created'] })),
      ]);
      const tokenParam = DIRECTUS_STATIC_TOKEN ? `?access_token=${DIRECTUS_STATIC_TOKEN}` : '';
      if (Array.isArray(photoFiles) && photoFiles.length) {
        setPhotos(photoFiles.map((f: any) => ({ id: f.id, filename: f.filename_download, url: `${DIRECTUS_URL}/assets/${f.id}${tokenParam}`, file_type: f.type?.startsWith('video/') ? 'video' : 'image', description: f.description || f.filename_download, mime: f.type })));
      }
      if (Array.isArray(videoFiles) && videoFiles.length) {
        setVideos(videoFiles.map((f: any) => ({ id: f.id, filename: f.filename_download, url: `${DIRECTUS_URL}/assets/${f.id}${tokenParam}`, file_type: f.type?.startsWith('video/') ? 'video' : 'image', description: f.description || f.filename_download, mime: f.type })));
      }
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        <SkeletonMedia />
      </div>
    );
  }

  const allMedia = [...photos, ...videos];

  if (allMedia.length === 0) {
    return (
      <div className={`text-center py-8 ${className || ''}`}>
        <p className="text-muted-foreground">
          {fallbackText || "Медиа файлы не найдены"}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="stagger-item">
          {!hideTitle && <h3 className="mb-6 uppercase text-left text-gradient">ФОТОГРАФИИ</h3>}
          
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer group overflow-hidden rounded-xl shadow-gentle hover:shadow-premium transition-all duration-300 hover-lift">
                        <img
                          src={photo.url}
                          alt={photo.description || photo.filename}
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full">
                      <img
                        src={photo.url}
                        alt={photo.description || photo.filename}
                        className="w-full h-auto max-h-[80vh] object-contain"
                        loading="lazy"
                      />
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Video Section */}
      {videos.length > 0 && (
        <div className="stagger-item">
          <h3 className="mb-6 uppercase text-left text-gradient">ВИДЕО</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="overflow-hidden rounded-xl shadow-gentle hover:shadow-premium transition-all duration-300 hover-lift">
                <video
                  controls
                  className="w-full h-64 object-cover bg-gradient-to-br from-primary/10 to-primary/20"
                  preload="metadata"
                  poster=""
                  style={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
                >
                  {/* Try provided mime; fallback to mp4; also add direct URL fallback for some browsers */}
                  {video.mime ? <source src={video.url} type={video.mime} /> : null}
                  <source src={video.url} type="video/mp4" />
                  <a href={video.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground underline">Открыть видео отдельной ссылкой</a>
                </video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};