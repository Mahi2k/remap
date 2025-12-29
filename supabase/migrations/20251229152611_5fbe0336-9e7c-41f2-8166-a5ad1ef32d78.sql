-- Add new columns to services table for individual service pages
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS full_description text,
ADD COLUMN IF NOT EXISTS features text[],
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;

-- Create unique index on slug for URL routing
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_idx ON public.services(slug) WHERE slug IS NOT NULL;

-- Update existing services with slugs based on titles
UPDATE public.services SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '&', 'and')) WHERE slug IS NULL;