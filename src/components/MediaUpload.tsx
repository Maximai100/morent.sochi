import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Video } from "lucide-react";

interface MediaUploadProps {
  category: string;
  title: string;
  onUploadSuccess?: () => void;
}

interface MediaFile {
  id: string;
  filename: string;
  file_path: string;
  file_type: 'image' | 'video';
  description: string;
}

export const MediaUpload = ({ category, title, onUploadSuccess }: MediaUploadProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(fileList)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${category}/${fileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // Save file metadata to database
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';
        const { error: dbError } = await supabase
          .from('media_files')
          .insert({
            filename: file.name,
            file_path: publicUrl,
            file_type: fileType,
            category: category,
            description: description || file.name
          });

        if (dbError) {
          throw dbError;
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
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFiles(data as MediaFile[]);
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Extract file path from public URL
      const pathParts = filePath.split('/media/');
      const storagePath = pathParts[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([storagePath]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', fileId);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Файл удален",
        description: "Файл успешно удален",
      });

      loadFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить файл",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFiles();
  }, [category]);

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
                      onClick={() => deleteFile(file.id, file.file_path)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {file.file_type === 'image' && (
                    <img
                      src={file.file_path}
                      alt={file.description}
                      className="w-full h-32 object-cover rounded mt-2"
                    />
                  )}
                  {file.file_type === 'video' && (
                    <video
                      src={file.file_path}
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