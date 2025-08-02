-- Create image categories table
CREATE TABLE public.image_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  folder_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create images table to track S3 images
CREATE TABLE public.images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.image_categories(id),
  s3_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  width INTEGER,
  height INTEGER,
  is_processed BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for image_categories
CREATE POLICY "Anyone can view active categories" 
ON public.image_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON public.image_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for images
CREATE POLICY "Anyone can view processed images" 
ON public.images 
FOR SELECT 
USING (is_processed = true);

CREATE POLICY "Admins can manage images" 
ON public.images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default categories
INSERT INTO public.image_categories (name, description, folder_path) VALUES
('Interiors', 'Interior design images', 'interiors/'),
('Exteriors', 'Exterior design images', 'exteriors/'),
('Before & After', 'Before and after transformation images', 'transformations/'),
('Portfolio', 'Portfolio showcase images', 'portfolio/'),
('Team', 'Team and company images', 'team/'),
('Miscellaneous', 'Other uncategorized images', 'misc/');

-- Create trigger for updated_at
CREATE TRIGGER update_image_categories_updated_at
BEFORE UPDATE ON public.image_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_images_updated_at
BEFORE UPDATE ON public.images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();