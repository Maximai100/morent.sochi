-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Create table for media files
CREATE TABLE public.media_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image' or 'video'
    category TEXT NOT NULL, -- 'trash_location', 'territory_description', 'beach_directions', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Create policies for media files (public read access, no auth needed for this use case)
CREATE POLICY "Media files are publicly viewable" 
ON public.media_files 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert media files" 
ON public.media_files 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update media files" 
ON public.media_files 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete media files" 
ON public.media_files 
FOR DELETE 
USING (true);

-- Create storage policies for media uploads
CREATE POLICY "Media files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Anyone can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can update media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media');

CREATE POLICY "Anyone can delete media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_files_updated_at
BEFORE UPDATE ON public.media_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();