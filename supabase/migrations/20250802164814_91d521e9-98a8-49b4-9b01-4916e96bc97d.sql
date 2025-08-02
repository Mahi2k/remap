-- Remove AWS/S3 related columns from images table
ALTER TABLE public.images DROP COLUMN IF EXISTS s3_key;

-- Drop the images table entirely since it was specifically for S3 integration
DROP TABLE IF EXISTS public.images;

-- Drop the image_categories table as well since it was for S3 image management
DROP TABLE IF EXISTS public.image_categories;