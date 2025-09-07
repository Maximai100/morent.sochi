import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: 'image' | 'video';
  description: string;
}

interface MediaDisplayProps {
  apartmentId?: string;
  category?: string;
  fallbackText?: string;
  className?: string;
}

export const MediaDisplay = ({ apartmentId, category, fallbackText, className }: MediaDisplayProps) => {
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [videos, setVideos] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedia();
  }, [apartmentId, category]);

  const loadMedia = async () => {
    try {
      const photoCategory = category ? `${category}-photos` : `apartment-${apartmentId}-photos`;
      const videoCategory = category ? `${category}-videos` : `apartment-${apartmentId}-videos`;
      
      const [photosResult, videosResult] = await Promise.all([
        supabase
          .from('media_files')
          .select('*')
          .eq('category', photoCategory),
        supabase
          .from('media_files')
          .select('*')
          .eq('category', videoCategory)
      ]);

      if (photosResult.data) {
        setPhotos(photosResult.data as MediaFile[]);
      }
      
      if (videosResult.data) {
        setVideos(videosResult.data as MediaFile[]);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
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
          <h3 className="mb-6 uppercase text-left text-gradient">ФОТОГАЛЕРЕЯ</h3>
          
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {photos.map((photo) => (
                <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer group overflow-hidden rounded-xl shadow-gentle hover:shadow-premium transition-all duration-300 hover-lift">
                        <img
                          src={photo.file_path}
                          alt={photo.description || photo.filename}
                          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full">
                      <img
                        src={photo.file_path}
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
          <h3 className="mb-6 uppercase text-left text-gradient">ВИДЕО-ОБЗОР</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="overflow-hidden rounded-xl shadow-gentle hover:shadow-premium transition-all duration-300 hover-lift">
                <video
                  controls
                  className="w-full h-64 object-cover"
                  preload="metadata"
                >
                  <source src={video.file_path} type="video/mp4" />
                  Ваш браузер не поддерживает воспроизведение видео.
                </video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};